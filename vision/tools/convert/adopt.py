"""Adopt an OpenVINO IR somebody else published as a Variant, out of band (#80).

``convert.py`` makes an IR and writes its Provenance from what it ran. This is the other way
in: Intel publishes a Qwen3-VL IR on Hugging Face, and a Variant is identified by its
Provenance, so adopting it means writing that Provenance by hand — the repository and revision
it came from, the Recipe its card states, and the OpenVINO version and NPU driver the card
says it needs. The manifest says ``origin: third-party`` and the slug carries the publisher,
so a Benchmark row is never mistaken for one of our own exports.

Like ``convert.py`` this module imports only the standard library (``tools/convert/README.md``,
"The invariant"); the download reaches ``huggingface_hub`` lazily, in the ``convert`` group.
"""

from __future__ import annotations

import argparse
import json
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from tools.convert.convert import (
    Recipe,
    _recipe_argument,
    default_cache_root,
    slug_for,
)

DEFAULT_REPOSITORY = "OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov"
DEFAULT_WEIGHTS = "Qwen/Qwen3-VL-4B-Instruct"
"""The model the default artifact was made from (its card's ``base_model``)."""
# What the card states, as of 2026-11-04: INT4_SYM, group_size 128, ratio 1.0, awq False.
CARD_RECIPE = Recipe(group_size=128)
CARD_REQUIRES = {"openvino": "2026.4.0", "npu_driver": "32.0.100.4023"}
MANIFEST = "provenance.json"
CONFIG = "openvino_config.json"
LANGUAGE_MODEL = "openvino_language_model.xml"

Download = Callable[[str, "str | None", Path], str]
"""``(repository, revision, out_dir) -> the commit sha that was fetched``."""

THIRD_PARTY = "third-party"
"""The ``origin`` a manifest carries when the IR was not exported by ``convert.py``."""

STATED_ON_THE_CARD = "nncf.compress_weights (as stated on the model card)"
"""The ``recipe.tool``: not something we ran, so not recorded as if we had."""


def build_third_party_provenance(
    *,
    weights: str,
    repository: str,
    revision: str,
    recipe: Recipe,
    execution_provider: str,
    requires: dict[str, str],
    created: str,
    publisher: str = "intel",
) -> dict[str, Any]:
    """The ``provenance.json`` of an IR we did not build (CONTEXT.md, "Provenance").

    ``weights`` are the model the IR was made from, ``repository`` and ``revision`` the exact
    artifact adopted, and ``recipe`` what its card states — checked against the files by the
    caller, not here. The slug is the one ``convert.py`` would give those weights and Recipe,
    prefixed with the ``publisher``: the same weights under the same Recipe exported by us are
    a different Variant, because we cannot vouch they are the same bytes.
    """
    return {
        "origin": THIRD_PARTY,
        "weights": weights,
        "source": {
            "repository": repository,
            "revision": revision,
            "url": f"https://huggingface.co/{repository}",
            "requires": dict(requires),
        },
        "recipe": {
            "name": recipe.name,
            "weight_format": recipe.weight_format,
            "sym": recipe.sym,
            "group_size": recipe.group_size,
            "ratio": recipe.ratio,
            "tool": STATED_ON_THE_CARD,
            "args": recipe.args(),
            "toolchain": {},
        },
        "execution_provider": execution_provider,
        "slug": f"{publisher}-{slug_for(weights, execution_provider, recipe)}",
        "created": created,
    }


class CardRecipeMismatch(Exception):
    """The Recipe the card states is not the one the IR's own files record."""


def verify_recipe(recipe: Recipe, openvino_config: dict[str, Any]) -> None:
    """Check the card's Recipe against ``openvino_config.json``, or refuse to adopt.

    A card is prose somebody can get wrong; the config beside the bytes is what the export
    wrote. Only the language model's entry (``lm_model``) is compared, because that is the only
    component the INT4 Recipe applies to — the vision tower and embeddings are INT8.
    """
    entries = openvino_config.get("quantization_config", {}).get("quantization_configs", {})
    stated = entries.get("lm_model")
    if not isinstance(stated, dict):
        raise CardRecipeMismatch(
            "openvino_config.json records no lm_model quantisation, so it cannot vouch for"
            f" the card's {recipe.name}"
        )
    expected = {
        "bits": 4 if recipe.weight_format == "int4" else None,
        "group_size": recipe.group_size,
        "sym": recipe.sym,
        "ratio": recipe.ratio,
    }
    for field, wanted in expected.items():
        if stated.get(field) != wanted:
            raise CardRecipeMismatch(
                f"the card states {recipe.name} but openvino_config.json records"
                f" {field}={stated.get(field)!r} (expected {wanted!r})"
            )


def download_from_hub(repository: str, revision: str | None, out_dir: Path) -> str:
    """Fetch the repository into ``out_dir`` and answer with the exact commit it was.

    ``huggingface_hub`` is in the ``convert`` group and imported here so the rest of the module
    stays standard-library only. The revision is pinned to a sha *before* downloading, so the
    Provenance names the bytes that arrived and not a branch that may move.
    """
    from huggingface_hub import HfApi, snapshot_download

    sha = HfApi().model_info(repository, revision=revision).sha
    if sha is None:
        raise RuntimeError(f"Hugging Face reported no commit for {repository}")
    snapshot_download(repository, revision=sha, local_dir=out_dir)
    return sha


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(
        description="Adopt an OpenVINO IR somebody else published as a Variant.",
    )
    ap.add_argument("--repository", default=DEFAULT_REPOSITORY,
                    help="Hugging Face repository that publishes the IR")
    ap.add_argument("--weights", default=DEFAULT_WEIGHTS,
                    help="the model the IR was made from, named in the slug")
    ap.add_argument("--recipe", default=CARD_RECIPE, type=_recipe_argument, metavar="NAME",
                    help="the Recipe the model card states (checked against openvino_config.json)")
    ap.add_argument("--revision", default=None,
                    help="commit to fetch (default: the repository's latest); required with --from")
    ap.add_argument("--requires-openvino", default=CARD_REQUIRES["openvino"],
                    help="the OpenVINO version the card says it needs")
    ap.add_argument("--requires-npu-driver", default=CARD_REQUIRES["npu_driver"],
                    help="the NPU driver the card says it needs")
    ap.add_argument("--ep", dest="execution_provider", default="NPU",
                    choices=["NPU", "GPU", "CPU"],
                    help="Execution Provider the Variant is named for (Provenance and slug)")
    ap.add_argument("--from", dest="source_dir", type=Path, default=None, metavar="DIR",
                    help="adopt an IR already on disk, in place, instead of downloading it")
    ap.add_argument("--out", type=Path, default=None,
                    help="IR directory to download into (default: $LVP_IR_CACHE/<slug>)")
    ap.add_argument("--force", action="store_true",
                    help="Overwrite an existing manifest or IR directory")
    args = ap.parse_args(argv)
    if args.source_dir is not None and args.revision is None:
        ap.error("--from needs --revision: offline, the commit the bytes came from is unknowable")
    return args


def main(argv: list[str] | None = None, *, download: Download = download_from_hub) -> int:
    args = parse_args(argv)
    recipe: Recipe = args.recipe
    requires = {
        "openvino": args.requires_openvino,
        "npu_driver": args.requires_npu_driver,
    }
    slug = f"intel-{slug_for(args.weights, args.execution_provider, recipe)}"

    if args.source_dir is not None:
        ir_dir: Path = args.source_dir
        revision: str | None = args.revision
    else:
        ir_dir = args.out or (default_cache_root() / slug)
        revision = None
        if ir_dir.exists() and not args.force:
            print(f"[adopt] {ir_dir} exists — pass --force to overwrite.")
            return 1

    manifest_path = ir_dir / MANIFEST
    if manifest_path.exists() and not args.force:
        print(f"[adopt] {manifest_path} exists — pass --force to overwrite.")
        return 1

    if args.source_dir is None:
        print(f"[adopt] {args.repository} -> {ir_dir}  (outside the repo - gigabytes)")
        revision = download(args.repository, args.revision, ir_dir)

    config_path = ir_dir / CONFIG
    if not (ir_dir / LANGUAGE_MODEL).is_file() or not config_path.is_file():
        print(f"[adopt] {ir_dir} is not an OpenVINO IR: it needs {LANGUAGE_MODEL} and {CONFIG}.")
        return 1
    try:
        verify_recipe(recipe, json.loads(config_path.read_text(encoding="utf-8")))
    except (CardRecipeMismatch, json.JSONDecodeError) as error:
        print(f"[adopt] refusing to adopt {ir_dir}: {error}")
        return 1

    assert revision is not None
    manifest = build_third_party_provenance(
        weights=args.weights,
        repository=args.repository,
        revision=revision,
        recipe=recipe,
        execution_provider=args.execution_provider,
        requires=requires,
        created=datetime.now(UTC).isoformat(),
    )
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"[adopt] wrote {manifest_path}  (Variant {manifest['slug']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
