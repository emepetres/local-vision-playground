"""What a Variant costs the machine while it is loaded on the NPU: load time and memory.

The Agent shares the machine with the vision model (#81), so "how much does the 4B take?"
matters beside "how fast is it?". A Benchmark records load time but not memory; this measures
both for one Variant in a fresh process, so nothing a previous model left behind is counted.

Windows only (it reads the process counters through ``ctypes``). Run from ``vision/``::

    uv run python -m tools.measure.memory SLUG [--execution-provider NPU]

Prints one JSON line: working set before the load, after the load, after one generation, and the
peak working set over the whole run, in MiB; plus load and first-generation seconds. The NPU's
own memory is not a process counter, so what is reported is host RAM the process holds.
"""

from __future__ import annotations

import argparse
import ctypes
import json
import os
import time
from ctypes import wintypes
from pathlib import Path

MIB = 1024 * 1024


class _Counters(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD),
        ("PageFaultCount", wintypes.DWORD),
        ("PeakWorkingSetSize", ctypes.c_size_t),
        ("WorkingSetSize", ctypes.c_size_t),
        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
        ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
        ("PagefileUsage", ctypes.c_size_t),
        ("PeakPagefileUsage", ctypes.c_size_t),
    ]


def working_set() -> tuple[float, float]:
    """The current and the peak working set of this process, in MiB."""
    counters = _Counters()
    counters.cb = ctypes.sizeof(counters)
    process = ctypes.windll.kernel32.GetCurrentProcess()
    ok = ctypes.windll.psapi.GetProcessMemoryInfo(
        ctypes.c_void_p(process), ctypes.byref(counters), counters.cb
    )
    if not ok:
        raise OSError("GetProcessMemoryInfo failed")
    return counters.WorkingSetSize / MIB, counters.PeakWorkingSetSize / MIB


def ir_directory(slug: str) -> Path:
    root = os.environ.get("LVP_IR_CACHE")
    local = Path(os.environ.get("LOCALAPPDATA", "~/.cache")).expanduser()
    base = Path(root) if root else local / "local-vision-playground" / "ir"
    return base / slug


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Load time and memory of one Variant.")
    ap.add_argument("slug")
    ap.add_argument("--execution-provider", default="NPU")
    args = ap.parse_args(argv)

    import numpy as np
    import openvino as ov  # loaded here so importing this module needs no OpenVINO
    import openvino_genai as genai
    from PIL import Image

    frame = Path(__file__).resolve().parents[3] / "docs" / "fixtures" / "reference-frame.jpg"
    image = ov.Tensor(np.array(Image.open(frame).convert("RGB"))[None])

    before, _ = working_set()
    started = time.perf_counter()
    pipe = genai.VLMPipeline(
        str(ir_directory(args.slug)),
        args.execution_provider,
        MAX_PROMPT_LEN=2048,
        MIN_RESPONSE_LEN=128,
    )
    load = time.perf_counter() - started
    loaded, _ = working_set()
    started = time.perf_counter()
    pipe.generate("Describe what you see in this image in two or three sentences.",
                  images=[image], max_new_tokens=128)
    first = time.perf_counter() - started
    after, peak = working_set()
    print(json.dumps({
        "slug": args.slug, "execution_provider": args.execution_provider,
        "load_s": round(load, 1), "first_generation_s": round(first, 1),
        "ram_mib": {"before": round(before), "after_load": round(loaded),
                    "after_generation": round(after), "peak": round(peak)},
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
