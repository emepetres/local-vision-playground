"""What a Variant costs the machine while it is loaded on the NPU: load time and memory.

The Agent shares the machine with the vision model (#81), so "how much does the 4B take?"
matters beside "how fast is it?". A Benchmark records load time but not memory; this measures
both for one Variant in a fresh process, so nothing a previous model left behind is counted.

It loads the Variant through the same Runtime ``observe`` uses (``InProcessOpenVINO``) and asks it
the Benchmark's own default Workload, so what is measured is what runs — not a second
configuration that could drift from it. Windows only (it reads the process counters through
``ctypes``). Run from ``vision/``::

    uv run python -m tools.measure.memory SLUG [--cold]

``--cold`` deletes the IR's ``ov-cache`` first, so the load pays the NPU compile; without it the
load is whatever the cache makes it.

Prints one JSON line: working set before the load, after the load, after one generation, and the
peak working set over the whole run, in MiB; plus load and first-generation seconds. The NPU's
own memory is not a process counter, so what is reported is host RAM the process holds.
"""

from __future__ import annotations

import argparse
import ctypes
import json
import shutil
import time
from ctypes import wintypes

from vision.capture import REFERENCE_FRAME, ImageFileCamera
from vision.inference import PROMPT, Workload
from vision.openvino_runtime import InProcessOpenVINO, resolve_ir_directory

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


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Load time and memory of one Variant.")
    ap.add_argument("slug")
    ap.add_argument("--cold", action="store_true", help="delete the IR's ov-cache first")
    args = ap.parse_args(argv)

    model = InProcessOpenVINO().resolve(args.slug)
    ir_dir = resolve_ir_directory(args.slug)
    if args.cold and ir_dir is not None:
        shutil.rmtree(ir_dir / "ov-cache", ignore_errors=True)
    workload = Workload(prompt=PROMPT, frame=ImageFileCamera(REFERENCE_FRAME).capture())

    before, _ = working_set()
    started = time.perf_counter()
    model.load()
    load = time.perf_counter() - started
    loaded, _ = working_set()
    started = time.perf_counter()
    model.observe(workload)
    first = time.perf_counter() - started
    after, peak = working_set()
    print(json.dumps({
        "slug": args.slug, "execution_provider": model.identity.execution_provider,
        "load_s": round(load, 1), "first_generation_s": round(first, 1),
        "ram_mib": {"before": round(before), "after_load": round(loaded),
                    "after_generation": round(after), "peak": round(peak)},
    }))
    model.unload()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
