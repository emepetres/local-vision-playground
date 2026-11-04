"""The conversion step, tested at the seams that do not need the toolchain or an NPU.

The export itself is a several-gigabyte, NPU-verified affair that belongs on the demo machine
(see ``tools/convert/README.md``) — its acceptance is the smoke run there, not a unit test. What
*is* tested here is everything around it that has to be right for that run to be worth anything:
the Provenance contract the runtime seam and the record read (ADR-0013), the slug that names an
IR with no catalogue id, where the IR is kept, and the clean-env defence against the OpenVINO
2025.3 archive (#38).

The module imports only the standard library, which is the whole point of the invariant — so
importing it here pulls in none of the ``convert`` group, and these tests run in the plain dev
environment exactly as the demo does.
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from tools.convert.convert import (
    DEFAULT_RECIPE,
    TOOLCHAIN,
    Recipe,
    build_provenance,
    child_environment,
    default_cache_root,
    main,
    parse_recipe,
    recipe_from_provenance,
    scrubbed_environment,
    slug_for,
    toolchain_versions,
)

CREATED = "2026-09-21T12:00:00+00:00"
"""A pinned instant, so a built manifest is a value a test can assert on whole."""


class TestSlug:
    """The name an IR carries in place of the catalogue id it does not have."""

    def test_drops_the_org_and_lowercases(self) -> None:
        assert slug_for("Qwen/Qwen3-VL-2B-Instruct", "NPU") == (
            "qwen3-vl-2b-instruct-int4-sym-cw-npu"
        )

    def test_names_the_recipe_in_full_group_size_included(self) -> None:
        weights = "Qwen/Qwen3-VL-2B-Instruct"
        assert slug_for(weights, "NPU", Recipe(group_size=-1)) == (
            "qwen3-vl-2b-instruct-int4-sym-cw-npu"
        )
        assert slug_for(weights, "NPU", Recipe(group_size=128)) == (
            "qwen3-vl-2b-instruct-int4-sym-g128-npu"
        )
        assert slug_for(weights, "NPU", Recipe(sym=False, group_size=128)) == (
            "qwen3-vl-2b-instruct-int4-asym-g128-npu"
        )

    def test_two_recipes_of_the_same_weights_are_two_names(self) -> None:
        a = slug_for("org/M", "NPU", Recipe(group_size=-1))
        b = slug_for("org/M", "NPU", Recipe(group_size=128))
        assert a != b

    def test_the_execution_provider_is_part_of_the_name(self) -> None:
        # The same weights built for a different Execution Provider is a different Variant, so
        # it must be a different slug — otherwise two IRs would claim one name.
        npu = slug_for("Qwen/Qwen3-VL-2B-Instruct", "NPU")
        gpu = slug_for("Qwen/Qwen3-VL-2B-Instruct", "GPU")
        assert npu != gpu
        assert npu.endswith("-npu")
        assert gpu.endswith("-gpu")


class TestProvenance:
    """The ``provenance.json`` contract the router and the record consume."""

    def test_carries_weights_recipe_execution_provider_and_slug(self) -> None:
        manifest = build_provenance(
            "Qwen/Qwen3-VL-2B-Instruct",
            "NPU",
            toolchain={"openvino": "2026.3.0", "transformers": "4.57.6"},
            created=CREATED,
        )
        assert manifest["weights"] == "Qwen/Qwen3-VL-2B-Instruct"
        assert manifest["execution_provider"] == "NPU"
        assert manifest["slug"] == "qwen3-vl-2b-instruct-int4-sym-cw-npu"
        assert manifest["created"] == CREATED
        recipe = manifest["recipe"]
        assert recipe["tool"] == "optimum-cli export openvino"
        assert recipe["args"] == DEFAULT_RECIPE.args()
        assert recipe["name"] == "int4-sym-cw"
        assert recipe["group_size"] == -1
        assert recipe["toolchain"] == {"openvino": "2026.3.0", "transformers": "4.57.6"}

    def test_records_the_recipe_actually_run_not_a_summary(self) -> None:
        # The recorded args are the ones the export ran under, so the INT4-symmetric recipe that
        # #40 proved on the NPU is legible from the manifest months later.
        manifest = build_provenance("m", "CPU", toolchain={}, created=CREATED)
        assert "--weight-format" in manifest["recipe"]["args"]
        assert "int4" in manifest["recipe"]["args"]
        assert "--sym" in manifest["recipe"]["args"]

    def test_round_trips_the_recipe(self) -> None:
        for recipe in (Recipe(), Recipe(group_size=128), Recipe(sym=False, group_size=64)):
            manifest = build_provenance(
                "m", "NPU", toolchain={}, created=CREATED, recipe=recipe
            )
            assert recipe_from_provenance(manifest) == recipe

    def test_the_recipe_in_the_manifest_is_the_one_in_the_slug_and_the_args(self) -> None:
        recipe = Recipe(group_size=128)
        manifest = build_provenance("org/M", "GPU", toolchain={}, created=CREATED, recipe=recipe)
        assert manifest["slug"] == "m-int4-sym-g128-gpu"
        assert "--group-size=128" in manifest["recipe"]["args"]

    def test_the_slug_matches_the_one_that_names_the_directory(self) -> None:
        # The slug in the manifest and the slug the IR directory is named for are the one name,
        # because the router matches an OpenVINO Variant token against it (ADR-0013).
        manifest = build_provenance("org/Model-X", "GPU", toolchain={}, created=CREATED)
        assert manifest["slug"] == slug_for("org/Model-X", "GPU")


class TestParseRecipe:
    """A Recipe is named on the command line the way the slug names it."""

    def test_parses_what_the_slug_prints(self) -> None:
        for recipe in (Recipe(), Recipe(group_size=128), Recipe(sym=False, group_size=32)):
            assert parse_recipe(recipe.name) == recipe

    def test_refuses_a_name_that_is_no_recipe(self) -> None:
        with pytest.raises(ValueError):
            parse_recipe("int4")


class TestToolchainVersions:
    """What the Provenance records about the tools that produced the IR."""

    def test_reads_only_installed_tools_and_never_raises(self) -> None:
        # In the plain dev environment none of the convert group is installed, so the map is
        # empty — and crucially it comes back empty rather than raising, which is what lets the
        # export fail with its own message a moment later instead of here.
        versions = toolchain_versions()
        assert set(versions) <= set(TOOLCHAIN)


class TestCacheRoot:
    """Where an IR is kept — outside the repository, either declared or per-user."""

    def test_honours_the_override(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", "/somewhere/else")
        assert default_cache_root() == Path("/somewhere/else")

    def test_falls_back_under_localappdata(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("LVP_IR_CACHE", raising=False)
        monkeypatch.setenv("LOCALAPPDATA", str(Path("/users/op/AppData/Local")))
        assert default_cache_root() == Path("/users/op/AppData/Local/local-vision-playground/ir")


class TestScrub:
    """The clean-env defence against the system-wide OpenVINO 2025.3 archive (#38)."""

    def test_a_clean_environment_is_left_alone(self) -> None:
        # Nothing to scrub, so nothing to re-exec for: the dev machine, which has no archive,
        # is told so by a None rather than paying for a needless re-exec.
        assert scrubbed_environment({"PATH": "/usr/bin", "HOME": "/home/op"}) is None

    def test_the_archive_variables_are_removed(self) -> None:
        dirty = {
            "PATH": "/usr/bin",
            "PYTHONPATH": r"C:\Intel\openvino_2025.3\python",
            "INTEL_OPENVINO_DIR": r"C:\Intel\openvino_2025.3",
            "OpenVINO_DIR": r"C:\Intel\openvino_2025.3\runtime\cmake",
        }
        clean = scrubbed_environment(dirty)
        assert clean is not None
        assert "PYTHONPATH" not in clean
        assert "INTEL_OPENVINO_DIR" not in clean
        assert "OpenVINO_DIR" not in clean

    def test_the_archive_path_entries_are_dropped_but_the_rest_kept(self) -> None:
        dirty = {
            "PATH": os_pathsep([r"C:\Intel\openvino_2025.3\runtime\bin", r"C:\Windows\System32"]),
        }
        clean = scrubbed_environment(dirty)
        assert clean is not None
        kept = clean["PATH"]
        assert "openvino_2025" not in kept.lower()
        assert r"C:\Windows\System32" in kept

    def test_the_export_child_is_handed_a_scrubbed_environment(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        # The export shells out to a child that imports OpenVINO; that child is what the archive
        # would shadow (#38), so it is the child that runs in a scrubbed environment.
        monkeypatch.setenv("INTEL_OPENVINO_DIR", r"C:\Intel\openvino_2025.3")
        monkeypatch.setenv("PATH", os_pathsep([r"C:\Intel\openvino_2025.3\runtime\bin", r"C:\bin"]))
        env = child_environment()
        assert "INTEL_OPENVINO_DIR" not in env
        assert "openvino_2025" not in env["PATH"].lower()

    def test_a_clean_machine_hands_the_child_its_own_environment(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        # The dev box has no archive, so there is nothing to scrub and the child simply inherits.
        for var in ("PYTHONPATH", "INTEL_OPENVINO_DIR", "OpenVINO_DIR"):
            monkeypatch.delenv(var, raising=False)
        monkeypatch.setenv("PATH", os_pathsep([r"C:\Windows\System32", r"C:\bin"]))
        assert child_environment()["PATH"] == os_pathsep([r"C:\Windows\System32", r"C:\bin"])


class TestDryRun:
    """``--dry-run`` prints the plan and writes nothing — no export, no directory."""

    def test_writes_nothing(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", str(tmp_path / "ir"))
        # The driver probe shells out to PowerShell; a dry run should not depend on it.
        monkeypatch.setattr("tools.convert.convert.check_npu_driver", lambda: None)
        assert main(["--dry-run"]) == 0
        assert not (tmp_path / "ir").exists()


def os_pathsep(parts: list[str]) -> str:
    """Join PATH entries with this platform's separator, so the test reads the same everywhere."""
    return os.pathsep.join(parts)
