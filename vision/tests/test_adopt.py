"""Adopting an IR we did not build: Intel's published artifact as a Variant (#80).

The download is several gigabytes and the run is the NPU's, so neither is a unit test — what
is tested here is what has to be right for that run to be worth anything: a hand-written
Provenance that says the IR is someone else's, a Recipe stated on the card that the files
bear out, and a manifest the router reads like any other.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from tools.convert.adopt import (
    CardRecipeMismatch,
    build_third_party_provenance,
    main,
    verify_recipe,
)
from tools.convert.convert import Recipe, recipe_from_provenance
from vision.openvino_runtime import InProcessOpenVINO, identity_from_provenance

REPOSITORY = "OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov"
REVISION = "91c5e474bd5a21e1fd79b5c885fe61b4136a03c0"
CREATED = "2026-11-04T12:00:00+00:00"
CARD_RECIPE = Recipe(group_size=128)


def intel_manifest() -> dict[str, Any]:
    return build_third_party_provenance(
        weights="Qwen/Qwen3-VL-4B-Instruct",
        repository=REPOSITORY,
        revision=REVISION,
        recipe=CARD_RECIPE,
        execution_provider="NPU",
        requires={"openvino": "2026.4.0", "npu_driver": "32.0.100.4023"},
        created=CREATED,
    )


class TestThirdPartyProvenance:
    def test_says_the_ir_is_somebody_elses_and_where_it_came_from(self) -> None:
        manifest = intel_manifest()
        assert manifest["origin"] == "third-party"
        assert manifest["source"] == {
            "repository": REPOSITORY,
            "revision": REVISION,
            "url": f"https://huggingface.co/{REPOSITORY}",
            "requires": {"openvino": "2026.4.0", "npu_driver": "32.0.100.4023"},
        }

    def test_the_slug_names_the_publisher_so_it_never_collides_with_our_own_export(self) -> None:
        assert intel_manifest()["slug"] == "intel-qwen3-vl-4b-instruct-int4-sym-g128-npu"

    def test_the_recipe_is_the_one_the_card_states_and_reads_back(self) -> None:
        manifest = intel_manifest()
        assert manifest["recipe"]["name"] == "int4-sym-g128"
        assert manifest["recipe"]["tool"] == "nncf.compress_weights (as stated on the model card)"
        assert recipe_from_provenance(manifest) == CARD_RECIPE

    def test_the_router_reads_it_as_an_ordinary_openvino_variant(self) -> None:
        identity = identity_from_provenance(intel_manifest())
        assert identity.provenance is not None
        assert identity.variant == "intel-qwen3-vl-4b-instruct-int4-sym-g128-npu"
        assert identity.execution_provider == "NPU"
        assert identity.provenance["origin"] == "third-party"


def config(**lm_model: object) -> dict[str, Any]:
    """An ``openvino_config.json`` shaped like Intel's, the language model's entry overridden."""
    entry = {"bits": 4, "dtype": "int4", "group_size": 128, "sym": True, "ratio": 1.0}
    entry.update(lm_model)
    return {"quantization_config": {"quantization_configs": {"lm_model": entry}}}


class TestVerifyRecipe:
    def test_a_card_the_files_bear_out_passes(self) -> None:
        verify_recipe(CARD_RECIPE, config())

    @pytest.mark.parametrize(
        ("field", "value"),
        [("group_size", -1), ("sym", False), ("bits", 8), ("ratio", 0.8)],
    )
    def test_a_file_that_disagrees_with_the_card_is_refused_naming_the_field(
        self, field: str, value: object
    ) -> None:
        with pytest.raises(CardRecipeMismatch, match=field):
            verify_recipe(CARD_RECIPE, config(**{field: value}))

    def test_a_config_that_states_no_language_model_recipe_cannot_vouch_for_the_card(
        self,
    ) -> None:
        with pytest.raises(CardRecipeMismatch, match="lm_model"):
            verify_recipe(CARD_RECIPE, {"quantization_config": {"quantization_configs": {}}})


SLUG = "intel-qwen3-vl-4b-instruct-int4-sym-g128-npu"


def an_ir(directory: Path, **lm_model: object) -> Path:
    """A directory shaped like Intel's repo: bytes and the config that records the Recipe."""
    directory.mkdir(parents=True)
    (directory / "openvino_language_model.xml").write_text("<net/>", encoding="utf-8")
    (directory / "openvino_config.json").write_text(
        json.dumps(config(**lm_model)), encoding="utf-8"
    )
    return directory


class TestAdoptInPlace:
    """``--from DIR``: the IR is already on disk, so adopting it is writing its manifest."""

    def test_writes_the_manifest_beside_the_bytes(self, tmp_path: Path) -> None:
        ir = an_ir(tmp_path / "downloaded")
        assert main(["--from", str(ir), "--revision", REVISION]) == 0
        manifest = json.loads((ir / "provenance.json").read_text(encoding="utf-8"))
        assert manifest["slug"] == SLUG
        assert manifest["origin"] == "third-party"
        assert manifest["source"]["repository"] == REPOSITORY
        assert manifest["source"]["revision"] == REVISION
        assert manifest["source"]["requires"]["openvino"] == "2026.4.0"

    def test_refuses_an_ir_whose_files_disagree_with_the_card_and_writes_nothing(
        self, tmp_path: Path, capsys: pytest.CaptureFixture[str]
    ) -> None:
        ir = an_ir(tmp_path / "downloaded", group_size=-1)
        assert main(["--from", str(ir), "--revision", REVISION]) == 1
        assert "group_size" in capsys.readouterr().out
        assert not (ir / "provenance.json").exists()

    def test_refuses_a_directory_that_is_not_an_ir(self, tmp_path: Path) -> None:
        (tmp_path / "empty").mkdir()
        assert main(["--from", str(tmp_path / "empty"), "--revision", REVISION]) == 1
        assert not (tmp_path / "empty" / "provenance.json").exists()

    def test_does_not_overwrite_a_manifest_without_force(self, tmp_path: Path) -> None:
        ir = an_ir(tmp_path / "downloaded")
        (ir / "provenance.json").write_text("{}", encoding="utf-8")
        assert main(["--from", str(ir), "--revision", REVISION]) == 1
        assert (ir / "provenance.json").read_text(encoding="utf-8") == "{}"
        assert main(["--from", str(ir), "--revision", REVISION, "--force"]) == 0

    def test_needs_the_revision_it_cannot_discover_offline(self, tmp_path: Path) -> None:
        ir = an_ir(tmp_path / "downloaded")
        with pytest.raises(SystemExit):
            main(["--from", str(ir)])


class TestAdoptByDownloading:
    def test_downloads_into_the_ir_cache_under_the_slug_and_records_the_revision_got(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", str(tmp_path / "ir"))
        asked: list[tuple[str, str | None]] = []

        def download(repository: str, revision: str | None, out_dir: Path) -> str:
            asked.append((repository, revision))
            an_ir(out_dir)
            return REVISION

        assert main([], download=download) == 0
        assert asked == [(REPOSITORY, None)]
        manifest = json.loads(
            (tmp_path / "ir" / SLUG / "provenance.json").read_text(encoding="utf-8")
        )
        assert manifest["source"]["revision"] == REVISION


class TestTheAdoptedVariantInTheRuntime:
    def test_the_adopted_slug_resolves_under_the_ir_cache_to_an_npu_variant(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("LVP_IR_CACHE", str(tmp_path / "ir"))
        main([], download=lambda repository, revision, out_dir: (an_ir(out_dir), REVISION)[1])
        runtime = InProcessOpenVINO()
        assert runtime.claims(SLUG)
        model = runtime.resolve(SLUG)
        assert model.identity.provenance is not None
        assert model.identity.variant == SLUG
        assert model.identity.provenance["origin"] == "third-party"
        assert model.identity.provenance["source"]["revision"] == REVISION
        assert model.is_cached
