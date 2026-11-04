"""The Benchmark counts repetition loops and the reliability of the Structured Observation.

Driven end to end through ``benchmark_main`` with fake models, and read back from the two files
it writes — the loop rate and the Work Cell reliability have to be in both (issue #79).
"""

from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any

import pytest
from PIL import Image

from tests.fakes import (
    FakeCamera,
    FakeClock,
    FakeFoundry,
    FakeVisionModel,
    make_frame,
    make_identity,
    make_observation,
    make_structured_observation,
)
from tests.test_benchmark import CPU_IDENTITY, CPU_VARIANT, GPU_VARIANT, READINGS
from tests.test_loops import LOOPING_CHANNEL_WISE_TEXT
from vision.benchmark import work_cell_fixtures
from vision.cli import benchmark_main
from vision.errors import VisionError
from vision.inference import (
    STRUCTURED_PROMPT,
    ModelIdentity,
    NoShape,
    ObjectsPresent,
    PresentObject,
    Where,
)
from vision.router import Router

CLEAN = "A desk with a green mat and a white tray, and a soldering iron on the board."
CUP = PresentObject("cup", 1, Where.ZONE)
CUP_LISTED = make_structured_observation(ObjectsPresent((CUP,)))


def photos(directory: Path, count: int, *, duplicates: int = 0) -> Path:
    """``count`` distinct PNGs, plus ``duplicates`` byte-identical copies of the first."""
    directory.mkdir(parents=True, exist_ok=True)
    for index in range(count):
        Image.new("RGB", (64, 48), (index * 40, 10, 10)).save(directory / f"photo_{index}.png")
    for copy in range(duplicates):
        (directory / f"copy_{copy}.png").write_bytes((directory / "photo_0.png").read_bytes())
    return directory


def sit(
    benchmarks: Path,
    argv: list[str],
    *,
    gpu: FakeVisionModel,
    cpu: FakeVisionModel,
    work_cell_dir: Path | None = None,
) -> tuple[int, str, dict[str, Any]]:
    """One sitting, and what it left behind: its exit code, everything written, the record."""
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        [*argv, "--hardware", "test rig"],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        router=Router(FakeFoundry({GPU_VARIANT: gpu, CPU_VARIANT: cpu})),
        clock=FakeClock((*READINGS, *(1000.0, 1001.0) * 40)),
        out=out,
        err=err,
        benchmarks_dir=benchmarks,
        work_cell_dir=work_cell_dir,
    )
    assert err.getvalue() == ""
    record = json.loads(next(benchmarks.glob("*.json")).read_text(encoding="utf-8"))
    document = next(benchmarks.glob("*.md")).read_text(encoding="utf-8")
    return code, out.getvalue() + document, record


def prose(
    identity: ModelIdentity, texts: list[str], *, structured: list[Any] | None = None
) -> FakeVisionModel:
    return FakeVisionModel(
        identity,
        [make_observation(text=text) for text in texts],
        structured=structured or [],
    )


def test_the_loop_rate_separates_a_looping_variant_from_a_clean_one(benchmarks: Path) -> None:
    looping = prose(make_identity(), [LOOPING_CHANNEL_WISE_TEXT] * 3 + [CLEAN] * 2)
    clean = prose(CPU_IDENTITY, [CLEAN] * 5)

    code, shown, record = sit(benchmarks, [], gpu=looping, cpu=clean)

    assert code == 0
    by_id = {variant["id"]: variant for variant in record["variants"]}
    assert by_id[make_identity().variant]["loops"] == 3
    assert by_id[make_identity().variant]["loop_rate"] == pytest.approx(0.6)
    assert by_id[CPU_IDENTITY.variant]["loops"] == 0
    assert by_id[CPU_IDENTITY.variant]["loop_rate"] == 0.0
    assert "Loops        3 of 5 Benchmark Runs (60%)" in shown
    assert "Loops        0 of 5 Benchmark Runs (0%)" in shown
    assert "| 3/5 | — |" in shown


def test_each_run_in_the_record_says_whether_it_looped(benchmarks: Path) -> None:
    looping = prose(make_identity(), [LOOPING_CHANNEL_WISE_TEXT, CLEAN, CLEAN, CLEAN, CLEAN])
    clean = prose(CPU_IDENTITY, [CLEAN] * 5)

    _, _, record = sit(benchmarks, [], gpu=looping, cpu=clean)

    assert [run["looped"] for run in record["variants"][0]["runs"]] == [
        True,
        False,
        False,
        False,
        False,
    ]


def test_a_structured_sitting_counts_a_repeated_object_as_a_loop(benchmarks: Path) -> None:
    stuck = make_structured_observation(ObjectsPresent((CUP, CUP, CUP)))
    gpu = FakeVisionModel(make_identity(), [], structured=[stuck] * 5)
    cpu = FakeVisionModel(CPU_IDENTITY, [], structured=[CUP_LISTED] * 5)

    _, _, record = sit(benchmarks, ["--structured"], gpu=gpu, cpu=cpu)

    assert [variant["loops"] for variant in record["variants"]] == [5, 0]


def test_without_the_sweep_the_record_has_no_work_cell_reliability(benchmarks: Path) -> None:
    gpu = prose(make_identity(), [CLEAN] * 5)
    cpu = prose(CPU_IDENTITY, [CLEAN] * 5)

    _, shown, record = sit(benchmarks, [], gpu=gpu, cpu=cpu)

    assert [variant["work_cell"] for variant in record["variants"]] == [None, None]
    assert "Work Cell  " not in shown


def test_the_sweep_reports_shape_respected_and_objects_found_per_variant(
    benchmarks: Path, tmp_path: Path
) -> None:
    fixtures = photos(tmp_path / "work-cell", 4)
    answers = [
        CUP_LISTED,
        make_structured_observation(ObjectsPresent(())),
        make_structured_observation(NoShape("the model answered in prose")),
        CUP_LISTED,
    ]
    gpu = prose(make_identity(), [CLEAN] * 5, structured=answers)
    cpu = prose(CPU_IDENTITY, [CLEAN] * 5, structured=[CUP_LISTED] * 4)

    code, shown, record = sit(benchmarks, ["--work-cell"], gpu=gpu, cpu=cpu, work_cell_dir=fixtures)

    assert code == 0
    assert record["variants"][0]["work_cell"] == {
        "fixtures": 4,
        "shape_respected": 3,
        "objects_found": 2,
    }
    assert record["variants"][1]["work_cell"] == {
        "fixtures": 4,
        "shape_respected": 4,
        "objects_found": 4,
    }
    assert "Work Cell    shape respected on 3 of 4 fixtures, objects found on 2" in shown
    assert "| 3/4 shaped, 2/4 found |" in shown


def test_the_sweep_asks_the_fixed_shape_of_every_distinct_photo_once(
    benchmarks: Path, tmp_path: Path
) -> None:
    fixtures = photos(tmp_path / "work-cell", 3, duplicates=2)
    gpu = prose(make_identity(), [CLEAN] * 5, structured=[CUP_LISTED] * 3)
    cpu = prose(CPU_IDENTITY, [CLEAN] * 5, structured=[CUP_LISTED] * 3)

    sit(benchmarks, ["--work-cell"], gpu=gpu, cpu=cpu, work_cell_dir=fixtures)

    assert len(gpu.observed_structured) == 3
    assert {workload.frame.digest for workload in gpu.observed_structured} == {
        frame.digest for frame in work_cell_fixtures(fixtures)
    }
    assert all(workload.prompt == STRUCTURED_PROMPT for workload in gpu.observed_structured)
    assert len(gpu.observed) == 5


def test_the_sweep_happens_while_the_variant_is_still_on_the_hardware(
    benchmarks: Path, tmp_path: Path
) -> None:
    fixtures = photos(tmp_path / "work-cell", 1)
    gpu = prose(make_identity(), [CLEAN] * 5, structured=[CUP_LISTED])
    cpu = prose(CPU_IDENTITY, [CLEAN] * 5, structured=[CUP_LISTED])
    events: list[str] = []
    gpu.events = cpu.events = events

    sit(benchmarks, ["--work-cell"], gpu=gpu, cpu=cpu, work_cell_dir=fixtures)

    assert events == [
        "load",
        *["observe"] * 5,
        "observe_structured",
        "unload",
        "load",
        *["observe"] * 5,
        "observe_structured",
        "unload",
    ]


def test_a_missing_fixture_directory_is_refused_with_a_reason(tmp_path: Path) -> None:
    with pytest.raises(VisionError, match="no Work Cell fixtures"):
        work_cell_fixtures(tmp_path / "nowhere")
