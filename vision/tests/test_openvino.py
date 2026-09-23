"""The OpenVINO Runtime, tested at the seams that need neither an NPU nor the ``openvino`` install.

The load/observe path is a several-second affair on real Intel hardware and is verified live on
the demo machine (ADR-0013), not here. What *is* tested is everything around it that has to be
right for that run to reach the right IR at all: resolving a provenance slug or a path to an IR
directory, reading a Variant's identity from its ``provenance.json`` rather than from where it was
found, the trivial OpenVINO meanings of ``is_cached`` and ``download``, and the pure half of the
clean-env defence against the OpenVINO 2025.3 archive (#38).

The adapter imports ``openvino_genai`` only inside ``load`` — lazily — so importing this module
and driving these seams pulls none of it in, exactly as the demo path does when no OpenVINO
Variant is named.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from pathlib import Path

import pytest

from vision.errors import VisionError
from vision.inference import VISION_TASK
from vision.openvino_runtime import (
    InProcessOpenVINO,
    device_of,
    identity_from_provenance,
    ir_cache_root,
    read_provenance,
    resolve_ir_directory,
    without_shadow,
)

PROVENANCE = {
    "weights": "Qwen/Qwen3-VL-2B-Instruct",
    "recipe": {"tool": "optimum-cli export openvino", "args": ["--weight-format", "int4"]},
    "execution_provider": "NPU",
    "slug": "qwen3-vl-2b-instruct-int4-sym-npu",
    "created": "2026-09-21T12:00:00+00:00",
}
"""A manifest shaped exactly as ``tools/convert/convert.py`` writes one (see test_convert)."""


def write_ir(directory: Path, provenance: Mapping[str, object] = PROVENANCE) -> Path:
    """A stand-in IR directory: the manifest beside a token weight file, as the export leaves it."""
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "provenance.json").write_text(json.dumps(provenance), encoding="utf-8")
    (directory / "openvino_model.xml").write_text("<net/>", encoding="utf-8")
    return directory


class TestResolveIrDirectory:
    """The two ways to name an OpenVINO Variant, and the one thing that makes a directory one."""

    def test_resolves_a_path_to_an_ir_directory(self, tmp_path: Path) -> None:
        ir = write_ir(tmp_path / "my-ir")
        assert resolve_ir_directory(str(ir)) == ir

    def test_resolves_a_slug_under_the_ir_cache(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", str(tmp_path))
        write_ir(tmp_path / "qwen3-vl-2b-instruct-int4-sym-npu")
        assert resolve_ir_directory("qwen3-vl-2b-instruct-int4-sym-npu") == (
            tmp_path / "qwen3-vl-2b-instruct-int4-sym-npu"
        )

    def test_a_directory_without_a_manifest_is_not_a_variant(self, tmp_path: Path) -> None:
        # IR bytes with no provenance.json have no identity to carry (ADR-0013), so the directory
        # is not one this Runtime claims — even though it is full of model files.
        bare = tmp_path / "bare"
        bare.mkdir()
        (bare / "openvino_model.xml").write_text("<net/>", encoding="utf-8")
        assert resolve_ir_directory(str(bare)) is None

    def test_a_name_that_is_neither_resolves_to_nothing(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", str(tmp_path))
        assert resolve_ir_directory("qwen3-vl-2b-instruct-generic-cpu") is None


class TestIrCacheRoot:
    """Where slugs resolve — the same location the conversion step writes to."""

    def test_honours_the_override(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", "/somewhere/else")
        assert ir_cache_root() == Path("/somewhere/else")

    def test_falls_back_under_localappdata(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("LVP_IR_CACHE", raising=False)
        monkeypatch.setenv("LOCALAPPDATA", str(Path("/users/op/AppData/Local")))
        assert ir_cache_root() == Path("/users/op/AppData/Local/local-vision-playground/ir")


class TestIdentity:
    """The identity read from the manifest, never from the path it was found at."""

    def test_is_the_slug_with_no_alias_and_no_version(self) -> None:
        identity = identity_from_provenance(PROVENANCE)
        assert identity.variant == "qwen3-vl-2b-instruct-int4-sym-npu"
        assert identity.alias is None
        assert ":" not in identity.variant

    def test_carries_the_vision_task_so_the_same_gate_passes(self) -> None:
        # We exported a Qwen3-VL vision model, so it can see a Frame; stating the task is what
        # lets ``require_vision_task`` gate both Runtimes alike (ADR-0013).
        assert identity_from_provenance(PROVENANCE).task == VISION_TASK

    def test_the_execution_provider_stands_without_a_device_type(self) -> None:
        identity = identity_from_provenance(PROVENANCE)
        assert identity.execution_provider == "NPU"
        assert identity.device_type is None
        assert identity.ran_on == "NPU"

    def test_the_device_is_the_execution_provider_it_was_built_for(self) -> None:
        assert device_of(PROVENANCE) == "NPU"
        assert device_of({"execution_provider": "gpu"}) == "GPU"
        assert device_of({}) == "CPU"

    def test_the_identity_and_the_device_agree_on_casing(self) -> None:
        # A manifest that spelled the Execution Provider lower-case must not print ``slug (gpu)``
        # while running on ``GPU`` — the slug and the manifest name the same Execution Provider.
        provenance = {"slug": "m-int4-sym-gpu", "execution_provider": "gpu"}
        assert identity_from_provenance(provenance).execution_provider == device_of(provenance)


class TestReadProvenance:
    """The manifest as data, or a refusal that names the file rather than a traceback."""

    def test_reads_the_manifest_beside_the_ir(self, tmp_path: Path) -> None:
        ir = write_ir(tmp_path / "ir")
        assert read_provenance(ir)["slug"] == "qwen3-vl-2b-instruct-int4-sym-npu"

    def test_a_manifest_that_will_not_parse_is_a_refusal(self, tmp_path: Path) -> None:
        ir = tmp_path / "ir"
        ir.mkdir()
        (ir / "provenance.json").write_text("{not json", encoding="utf-8")
        with pytest.raises(VisionError, match="provenance manifest"):
            read_provenance(ir)

    def test_a_manifest_that_names_no_slug_is_a_refusal(self, tmp_path: Path) -> None:
        # The slug is the name this Variant carries into a report and into a persisted
        # record; a row with no name answers nobody's "which build produced these numbers?"
        nameless = {key: value for key, value in PROVENANCE.items() if key != "slug"}
        ir = write_ir(tmp_path / "ir", nameless)
        with pytest.raises(VisionError, match="names no slug"):
            read_provenance(ir)


class TestInProcessOpenVINO:
    """Claiming and resolving a Variant, and the trivial OpenVINO meanings behind the port."""

    def test_claims_a_name_that_resolves_to_an_ir_directory(self, tmp_path: Path) -> None:
        ir = write_ir(tmp_path / "ir")
        runtime = InProcessOpenVINO()
        assert runtime.claims(str(ir)) is True
        assert runtime.claims("qwen3-vl-2b-instruct-generic-cpu") is False

    def test_resolves_the_identity_from_the_manifest(self, tmp_path: Path) -> None:
        ir = write_ir(tmp_path / "ir")
        model = InProcessOpenVINO().resolve(str(ir))
        assert model.identity.variant == "qwen3-vl-2b-instruct-int4-sym-npu"
        assert model.identity.execution_provider == "NPU"

    def test_an_ir_on_disk_is_already_cached(self, tmp_path: Path) -> None:
        model = InProcessOpenVINO().resolve(str(write_ir(tmp_path / "ir")))
        assert model.is_cached is True

    def test_download_is_a_refusal_pointing_at_the_conversion_step(self, tmp_path: Path) -> None:
        # The IR is produced out of band and nothing fetches it at run time (ADR-0012), so a
        # download is a refusal that names the step that would produce one.
        model = InProcessOpenVINO().resolve(str(write_ir(tmp_path / "ir")))
        with pytest.raises(VisionError, match="tools/convert/convert.py"):
            model.download(lambda _: None)


class TestShadowDefence:
    """The pure half of the clean-env defence against the OpenVINO 2025.3 archive (#38)."""

    def test_drops_the_archive_entries_and_keeps_the_rest(self) -> None:
        entries = [
            r"C:\Intel\openvino_2025.3\python",
            r"C:\Users\op\.venv\Lib\site-packages",
            r"C:\Program Files (x86)\Intel\openvino\runtime\bin",
        ]
        kept = without_shadow(entries)
        assert r"C:\Users\op\.venv\Lib\site-packages" in kept
        assert all("openvino_2025" not in entry.lower() for entry in kept)
        assert all("intel\\openvino" not in entry.lower() for entry in kept)

    def test_a_clean_path_is_left_whole(self) -> None:
        entries = [r"C:\Windows\System32", r"C:\Users\op\.venv\Lib\site-packages"]
        assert without_shadow(entries) == entries
