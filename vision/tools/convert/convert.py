#!/usr/bin/env python
"""Export a vision-language model to an OpenVINO IR, once, out of band.

`observe`, `watch` and `benchmark` reach the NPU and the Arc iGPU through an OpenVINO IR —
a converted copy of the model's weights — because Foundry Local's catalogue on the demo
machine publishes no vision build beyond CPU (ADR-0012). Foundry Local does not produce
that IR, and nothing fetches it at run time; this step produces it, and it produces it
*off the demo path*.

**The invariant.** The conversion toolchain never enters the demo path. Its pins live in an
opt-in ``convert`` dependency group (``uv sync --group convert``): they are recorded in
``uv.lock`` for reproducibility but are never installed by a plain ``uv sync``, and nothing
in ``observe`` / ``watch`` / ``benchmark`` imports any of them. This module holds to its half
of that bargain by importing *only the standard library* — the export tools are reached by
shelling out to ``optimum-cli`` in the same interpreter, so importing this file (as the tests
do) pulls in none of them.

Run it, from the ``vision`` project directory::

    uv run --group convert tools/convert/convert.py            # Qwen3-VL-2B, INT4-sym, NPU
    uv run --group convert tools/convert/convert.py --dry-run  # print the plan, check the driver
    uv run --group convert tools/convert/convert.py --help

The IR lands **outside the repo** (it is ~1.7 GB) under ``$LVP_IR_CACHE`` — or
``%LOCALAPPDATA%\\local-vision-playground\\ir\\<slug>`` when that is unset — with a
``provenance.json`` beside it. See ``README.md`` for the prerequisites and the smoke run.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import UTC, datetime
from importlib import metadata
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# The recipe. This is the load-bearing bet verified on the demo machine in #40: this exact
# export of Qwen3-VL-2B-Instruct yields a ~1.7 GB IR that runs first-try on the NPU, and the
# same INT4-sym IR serves the OV-CPU and OV-GPU Benchmark rows too — one model behind four
# rows. Change an argument here and that first-try result is no longer the one #40 proved.
# ---------------------------------------------------------------------------
DEFAULT_WEIGHTS = "Qwen/Qwen3-VL-2B-Instruct"
EXPORT_ARGS = [
    "--weight-format", "int4",
    "--sym",
    "--ratio=1.0",
    "--group-size=-1",
]
# No --trust-remote-code: transformers >= 4.57 carries native `qwen3_vl`, so no custom remote
# code is fetched, and #40 verified this exact argument list (issue #48). Recording anything the
# export did not run under would make the Provenance lie about what produced the IR.

# The distributions whose exact resolved versions become part of the IR's Provenance. They are
# read from the environment the export actually ran in rather than hard-coded, because the
# Provenance is read back months later to answer "what produced this?" — a version copied by
# hand can drift from the ``convert`` group in uv.lock, and then it answers the wrong thing.
TOOLCHAIN = (
    "openvino",
    "openvino-genai",
    "openvino-tokenizers",
    "optimum",
    "optimum-intel",
    "nncf",
    "transformers",
)

# The NPU driver floor from #38. Only matters for the smoke run on the demo machine — the
# export itself is CPU-bound and needs no NPU at all.
NPU_DRIVER_FLOOR = (32, 0, 100, 3104)

# The demo machine carries a system-wide OpenVINO 2025.3 archive install whose setupvars are
# permanent in the environment. It shadows any pip/uv-installed openvino and then makes
# ``openvino_genai`` fail to import (#38). We scrub its footprint and re-exec ourselves with a
# clean environment before any openvino import can happen downstream (in the optimum-cli child).
_SHADOW_ENV_VARS = ("PYTHONPATH", "INTEL_OPENVINO_DIR", "OpenVINO_DIR")
_SHADOW_PATH_MARKERS = ("openvino_2025", os.path.join("Intel", "openvino"))
_CLEAN_SENTINEL = "LVP_CONVERT_CLEAN_ENV"


def scrubbed_environment(env: dict[str, str]) -> dict[str, str] | None:
    """A copy of ``env`` with the OpenVINO 2025.3 archive removed, or ``None`` if it is clean.

    The archive announces itself in three variables and in three ``PATH`` entries (#38). This
    returns a scrubbed copy when any of them is present and ``None`` when none is — so the
    caller re-execs with the copy only when there is something to scrub, and the decision is
    testable without spawning a process. The returned copy always carries the sentinel that
    stops the re-exec recursing: a clean environment is marked clean, a dirty one is cleaned
    and marked.
    """
    dirty = any(env.get(var) for var in _SHADOW_ENV_VARS) or any(
        marker.lower() in env.get("PATH", "").lower() for marker in _SHADOW_PATH_MARKERS
    )
    clean = dict(env)
    clean[_CLEAN_SENTINEL] = "1"
    if not dirty:
        return None
    for var in _SHADOW_ENV_VARS:
        clean.pop(var, None)
    parts = clean.get("PATH", "").split(os.pathsep)
    kept = [p for p in parts if not any(m.lower() in p.lower() for m in _SHADOW_PATH_MARKERS)]
    clean["PATH"] = os.pathsep.join(kept)
    return clean


def ensure_clean_env() -> None:
    """Re-exec once with the OpenVINO archive scrubbed, before any openvino import happens.

    Runs at most once: the scrubbed environment carries a sentinel, and finding it set means
    this process is already the clean re-exec and must not spawn another. On the dev machine,
    which has no archive, nothing is scrubbed and the process simply carries on.
    """
    if os.environ.get(_CLEAN_SENTINEL):
        return
    clean = scrubbed_environment(dict(os.environ))
    if clean is None:
        os.environ[_CLEAN_SENTINEL] = "1"
        return
    print("[convert] OpenVINO 2025.3 archive on PATH/PYTHONPATH — scrubbing and re-execing.")
    os.execve(sys.executable, [sys.executable, *sys.argv], clean)


def default_cache_root() -> Path:
    """Where IRs are kept, outside the repository: ``$LVP_IR_CACHE`` or the per-user default.

    The IR is gigabytes and is not a source artefact, so it never lives in the tree. The
    runtime seam reads from this same location (ADR-0013): the convention is shared, not the
    conversion step's private choice.
    """
    override = os.environ.get("LVP_IR_CACHE")
    if override:
        return Path(override)
    base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~/.cache")
    return Path(base) / "local-vision-playground" / "ir"


def slug_for(weights: str, execution_provider: str) -> str:
    """The Provenance slug that names an IR that has no catalogue id (CONTEXT.md, Variant).

    A Foundry Local Variant is named by its id; an IR we exported has none, so it is named by
    this slug instead — the weights and the Execution Provider it was built for, reduced to
    something a directory name and a Variant token will both take. ``Qwen/Qwen3-VL-2B-Instruct``
    on the NPU is ``qwen3-vl-2b-instruct-int4-sym-npu``.

    The reduction mirrors ``vision.record._slug`` deliberately rather than sharing it: this
    module holds to the stdlib-only invariant (module docstring) and must not import ``vision``.
    """
    stem = weights.split("/")[-1].lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return f"{stem}-int4-sym-{execution_provider.lower()}"


def toolchain_versions() -> dict[str, str]:
    """The exact resolved version of each export tool installed in this environment.

    Read from ``importlib.metadata`` so the Provenance records what actually ran, not what was
    intended. A tool that is not installed is simply left out rather than guessed at — which is
    the honest thing when someone runs this without ``--group convert`` and the export will fail
    a moment later anyway.
    """
    versions: dict[str, str] = {}
    for name in TOOLCHAIN:
        try:
            versions[name] = metadata.version(name)
        except metadata.PackageNotFoundError:
            continue
    return versions


def build_provenance(
    weights: str,
    execution_provider: str,
    *,
    toolchain: dict[str, str],
    created: str,
) -> dict[str, Any]:
    """The ``provenance.json`` contract: what identifies an IR no catalogue published.

    A path on disk is not an identity (CONTEXT.md, "Provenance"), and a Benchmark is read back
    months later — so the IR carries the weights it came from, the recipe it was exported with,
    and the Execution Provider it was built for. The runtime seam reads a Variant's identity
    from this manifest rather than from where the file was found (ADR-0013), and the persisted
    Benchmark record reads through that. The slug is carried too, because it is the name the
    router matches an OpenVINO Variant token against.
    """
    return {
        "weights": weights,
        "recipe": {
            "tool": "optimum-cli export openvino",
            "args": list(EXPORT_ARGS),
            "toolchain": toolchain,
        },
        "execution_provider": execution_provider,
        "slug": slug_for(weights, execution_provider),
        "created": created,
    }


def write_provenance(out_dir: Path, weights: str, execution_provider: str) -> Path:
    """Write ``provenance.json`` beside the IR bytes, and answer with where it went."""
    manifest = build_provenance(
        weights,
        execution_provider,
        toolchain=toolchain_versions(),
        created=datetime.now(UTC).isoformat(),
    )
    path = out_dir / "provenance.json"
    path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"[convert] wrote {path}")
    return path


def check_npu_driver() -> None:
    """Best-effort NPU driver floor check on Windows. Warns only; never blocks the export.

    The export is CPU-bound and does not touch the NPU, so a missing or old driver is not a
    reason to refuse it — only a reason to warn that the smoke run will need the demo machine.
    """
    if sys.platform != "win32":
        return
    try:
        out = subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             "(Get-CimInstance Win32_PnPSignedDriver | "
             "Where-Object { $_.DeviceName -match 'AI Boost' } | "
             "Select-Object -First 1 -ExpandProperty DriverVersion)"],
            capture_output=True, text=True, timeout=30,
        ).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return
    if not out:
        print("[convert] No 'Intel(R) AI Boost' NPU found — export still works; "
              "the smoke run needs the demo machine.")
        return
    found = tuple(int(x) for x in out.split(".")[:4])
    floor = ".".join(map(str, NPU_DRIVER_FLOOR))
    verdict = "OK" if found >= NPU_DRIVER_FLOOR else "BELOW FLOOR, update it"
    print(f"[convert] NPU driver {out} (floor {floor}) — {verdict}.")


def export(weights: str, out_dir: Path) -> None:
    """Run the verified ``optimum-cli export openvino`` recipe into ``out_dir``.

    Invoked as ``python -m`` in this same interpreter rather than as a bare ``optimum-cli`` on
    PATH, so it runs against the environment ``uv run --group convert`` built and not whatever
    else the shell might resolve. The clean-env re-exec has already happened, so the child does
    not inherit the OpenVINO 2025.3 archive.
    """
    cmd = [
        sys.executable, "-m", "optimum.commands.optimum_cli",
        "export", "openvino", "-m", weights, *EXPORT_ARGS, str(out_dir),
    ]
    print(f"[convert] {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(
        description="Export a vision-language model to an OpenVINO IR, out of band.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--weights", default=DEFAULT_WEIGHTS, help="Hugging Face model id to export")
    ap.add_argument("--ep", dest="execution_provider", default="NPU",
                    choices=["NPU", "GPU", "CPU"],
                    help="Execution Provider this IR is built for (Provenance and slug only; "
                         "the INT4-sym IR runs on all three OpenVINO rows)")
    ap.add_argument("--out", type=Path, default=None,
                    help="IR output directory (default: $LVP_IR_CACHE/<slug>)")
    ap.add_argument("--force", action="store_true", help="Overwrite an existing IR directory")
    ap.add_argument("--dry-run", action="store_true",
                    help="Print the plan, check the NPU driver, and exit")
    return ap.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    weights: str = args.weights
    execution_provider: str = args.execution_provider
    out_dir: Path = args.out or (default_cache_root() / slug_for(weights, execution_provider))

    print(f"[convert] weights={weights} ep={execution_provider}")
    print(f"[convert] IR -> {out_dir}  (outside the repo — gigabytes)")

    if args.dry_run:
        check_npu_driver()
        return 0
    if out_dir.exists() and not args.force:
        print(f"[convert] {out_dir} exists — pass --force to overwrite.")
        return 1

    check_npu_driver()
    out_dir.mkdir(parents=True, exist_ok=True)
    export(weights, out_dir)
    write_provenance(out_dir, weights, execution_provider)
    print("[convert] done. Smoke-run it on the demo machine's NPU (see README.md).")
    return 0


if __name__ == "__main__":
    ensure_clean_env()  # must run before any openvino import happens in the child
    raise SystemExit(main())
