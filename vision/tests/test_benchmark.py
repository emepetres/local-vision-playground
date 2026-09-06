"""End-to-end tests for the ``benchmark`` command, driven through the ports it is given.

The whole command runs against a fake Foundry, a fake camera and a fake clock, and what is
asserted is the rendered table — the thing an Operator reads and the thing they will quote.
The last test in the file goes the other way and renders a Benchmark that no clock and no
model ever touched, which is what the split between measuring and reporting buys.
"""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import pytest

import vision.cli
from tests.fakes import (
    FakeCamera,
    FakeClock,
    FakeFoundry,
    FakeVisionModel,
    make_frame,
    make_identity,
    make_observation,
)
from vision.benchmark import Benchmark, BenchmarkRun
from vision.capture import REFERENCE_FRAME
from vision.cli import benchmark_main
from vision.inference import PROMPT, FinishReason, Workload

SETUP_READINGS = (0.0, 0.5, 10.0, 11.25)
"""Registering the Execution Providers: 0.500 s. Loading the Variant: 1.250 s."""

RUN_READINGS = (20.0, 22.5, 30.0, 32.0, 40.0, 41.8, 50.0, 52.2, 60.0, 62.0)
"""Five Benchmark Runs: 2.500 s cold, then 2.000 s, 1.800 s, 2.200 s and 2.000 s.

The four after the first have a median of 2.000 s, a minimum of 1.800 s and a maximum of
2.200 s — three numbers that are each a different repetition, so a table that mixed two of
them up would be caught.
"""

READINGS = (*SETUP_READINGS, *RUN_READINGS)

COMPLETION_TOKENS = (30, 24, 22, 26, 28)
"""One per Benchmark Run, all different: a rate read off the wrong run is then visible."""

HEADER = (
    "Model        qwen3-vl-2b-instruct-cuda-gpu:2"
    " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
    "Frame        640x360 jpeg, fit to 640x480, from docs/fixtures/reference-frame.jpg\n"
    "Prompt       Describe what you see in this image in two or three sentences.\n"
    "Limits       at most 128 tokens, temperature 0.0\n"
    "Providers    0.500 s\n"
    "Load         1.250 s\n"
    "Repetitions  5 — the first reported apart,"
    " the median, minimum and maximum taken over the other 4\n"
)

TABLE = (
    "                  First    Median       Min       Max\n"
    "Inference       2.500 s   2.000 s   1.800 s   2.200 s\n"
    "Tokens               30        25        22        28\n"
    "Tokens/second      12.0      12.1      11.8      14.0\n"
)


@dataclass
class Run:
    """One invocation of the command, and everything it was driven through."""

    code: int
    out: str
    err: str
    foundry: FakeFoundry
    model: FakeVisionModel
    camera: FakeCamera
    events: list[str]


def run(
    argv: list[str] | None = None,
    *,
    model: FakeVisionModel | None = None,
    camera: FakeCamera | None = None,
    readings: tuple[float, ...] = READINGS,
    tokens: tuple[int, ...] = COMPLETION_TOKENS,
    setup_lines: tuple[str, ...] = (),
) -> Run:
    """One invocation, with the Foundry, the camera and the clock all faked.

    The model and the Foundry write into one journal, so a test can pin what happened
    before what across the two of them.
    """
    events: list[str] = []
    if model is None:
        observations = [make_observation(completion_tokens=count) for count in tokens]
        model = FakeVisionModel(make_identity(), observations, events=events)
    camera = camera if camera is not None else FakeCamera([make_frame(width=640, height=360)])
    foundry = FakeFoundry.resolving_everything_to(model, setup_lines=setup_lines, events=events)
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        argv if argv is not None else [],
        camera=camera,
        foundry=foundry,
        clock=FakeClock(readings),
        out=out,
        err=err,
    )
    return Run(code, out.getvalue(), err.getvalue(), foundry, model, camera, events)


def test_measures_one_variant_and_prints_what_each_repetition_cost() -> None:
    result = run()

    assert result.code == 0
    assert result.err == ""
    assert result.out == f"{HEADER}\n{TABLE}"


def test_takes_five_benchmark_runs_by_default() -> None:
    result = run()

    assert len(result.model.observed) == 5


def test_takes_as_many_repetitions_as_asked_for() -> None:
    result = run(
        ["--repetitions", "3"],
        readings=(*SETUP_READINGS, *RUN_READINGS[:6]),
        tokens=COMPLETION_TOKENS[:3],
    )

    assert result.code == 0
    assert len(result.model.observed) == 3
    assert (
        "Repetitions  3 — the first reported apart,"
        " the median, minimum and maximum taken over the other 2\n"
    ) in result.out


def test_summarises_only_the_cold_repetition_when_that_is_all_there_is() -> None:
    """One repetition has a first and no steady state, and the table says so rather than
    inventing a median over a single sample."""
    result = run(
        ["--repetitions", "1"],
        readings=(*SETUP_READINGS, *RUN_READINGS[:2]),
        tokens=COMPLETION_TOKENS[:1],
    )

    assert result.code == 0
    assert "Repetitions  1 — a cold model, and no steady state to summarise\n" in result.out
    assert result.out.endswith(
        "                  First\n"
        "Inference       2.500 s\n"
        "Tokens               30\n"
        "Tokens/second      12.0\n"
    )


def test_refuses_to_measure_nothing() -> None:
    """The refusal is on ``measure`` rather than on the parser: it is the invariant of a
    Benchmark, not a property of the flag that happens to reach it."""
    result = run(["--repetitions", "0"])

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: 0 repetitions measures nothing — a Benchmark needs at least one"
        " Benchmark Run (--repetitions N)\n"
    )
    assert result.events == []


def test_keeps_the_cold_repetition_out_of_the_median_rather_than_out_of_the_table() -> None:
    """A cold model is the honest number, and it is also the one that would skew a median
    over four samples — so it is reported and then excluded."""
    cold = (20.0, 40.0, *RUN_READINGS[2:])
    result = run(readings=(*SETUP_READINGS, *cold))

    assert "Inference       20.000 s   2.000 s   1.800 s   2.200 s\n" in result.out
    assert "Tokens/second        1.5      12.1      11.8      14.0\n" in result.out


def test_reports_tokens_per_second_alongside_the_latency() -> None:
    """Two repetitions of the same latency that generated different amounts of text are
    not the same result, and the rate is what says so."""
    result = run(
        ["--repetitions", "2"],
        readings=(*SETUP_READINGS, 20.0, 22.0, 30.0, 32.0),
        tokens=(20, 40),
    )

    assert "Tokens               20        40        40        40\n" in result.out
    assert "Tokens/second      10.0      20.0      20.0      20.0\n" in result.out


def test_measures_the_reference_frame_by_default() -> None:
    """No camera injected, so the real image-file capture reads the repository's fixture."""
    events: list[str] = []
    model = FakeVisionModel(
        make_identity(),
        [make_observation(completion_tokens=count) for count in COMPLETION_TOKENS],
        events=events,
    )
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        [],
        foundry=FakeFoundry.resolving_everything_to(model, events=events),
        clock=FakeClock(READINGS),
        out=out,
        err=err,
    )

    assert code == 0
    assert err.getvalue() == ""
    assert f"Frame        640x360 jpeg, fit to 640x480, from {REFERENCE_FRAME}\n" in out.getvalue()


def test_says_the_reference_frame_only_exists_in_a_source_checkout(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """It is found relative to the installed package, so an installed wheel has no such
    file — and "there is no image at <path>" would point at a flag nobody passed."""
    missing = tmp_path / "reference-frame.jpg"
    monkeypatch.setattr(vision.cli, "REFERENCE_FRAME", missing)
    out, err = io.StringIO(), io.StringIO()

    code = benchmark_main(
        [],
        foundry=FakeFoundry.resolving_everything_to(FakeVisionModel(make_identity(), [])),
        clock=FakeClock(READINGS),
        out=out,
        err=err,
    )

    assert code == 1
    assert out.getvalue() == ""
    assert err.getvalue() == (
        f"error: the reference Frame is not at {missing} — it is kept in the repository"
        " and found relative to the installed package, so it is only there when the"
        " project is installed from a source checkout (which is what `uv run` gives you);"
        " pass --image <path> to measure a Frame of your own\n"
    )


def test_measures_an_image_file_when_one_is_named() -> None:
    camera = FakeCamera([make_frame(provenance="desk.jpg")])
    result = run(["--image", "desk.jpg"], camera=camera)

    assert result.code == 0
    assert "from desk.jpg\n" in result.out


def test_refuses_a_live_camera_and_says_why() -> None:
    result = run(["--camera", "0"])

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: camera 0 cannot be a Benchmark's Frame source — every Benchmark Run has to"
        " see the same bytes, and a Feed gives a different Frame each time; measure the"
        " reference Frame by leaving --camera off, or pass --image <path>\n"
    )


def test_refuses_a_live_camera_before_it_resolves_a_model() -> None:
    result = run(["--camera", "1"])

    assert result.events == []
    assert result.camera.captures == 0


def test_reads_the_frame_once_and_sends_those_exact_bytes_to_every_benchmark_run() -> None:
    """What makes the Workload identical across repetitions: one read, one set of bytes."""
    result = run()

    assert result.camera.captures == 1
    frames = {id(workload.frame) for workload in result.model.observed}
    assert len(frames) == 1
    assert all(workload.prompt == PROMPT for workload in result.model.observed)
    assert all(workload.max_output_tokens == 128 for workload in result.model.observed)


def test_registers_the_execution_providers_once_before_any_model_is_loaded() -> None:
    """Machine set-up, paid once for the whole Benchmark — not once per Benchmark Run."""
    result = run()

    assert result.events == [
        "resolve",
        "register",
        "load",
        *["observe"] * 5,
        "unload",
    ]


def test_reports_the_provider_registration_outside_the_table() -> None:
    result = run()

    header, table = result.out.split("\n\n")
    assert "Providers    0.500 s" in header
    assert "Providers" not in table


def test_reports_what_loading_the_variant_cost() -> None:
    result = run()

    assert "Load         1.250 s\n" in result.out


def test_takes_the_variant_back_off_the_hardware() -> None:
    result = run()

    assert result.model.unloads == 1
    assert not result.model.loaded


def test_takes_the_variant_off_the_hardware_even_when_a_benchmark_run_fails() -> None:
    """A model left resident measures whatever runs next under conditions it cannot report."""
    model = FakeVisionModel(make_identity(), [make_observation()])
    result = run(["--repetitions", "2"], model=model, readings=(*SETUP_READINGS, 20.0, 22.0, 30.0))

    assert result.code == 1
    assert model.unloads == 1


def test_says_how_many_benchmark_runs_the_output_limit_cut_short() -> None:
    """A truncated run generated exactly the limit, so the limit decided its token count."""
    observations = [
        make_observation(completion_tokens=30),
        make_observation(completion_tokens=128, finish_reason=FinishReason.TRUNCATED),
        make_observation(completion_tokens=22),
        make_observation(completion_tokens=128, finish_reason=FinishReason.TRUNCATED),
        make_observation(completion_tokens=28),
    ]
    result = run(model=FakeVisionModel(make_identity(), observations))

    assert result.code == 0
    assert result.out.endswith(
        "\n(2 of 5 Benchmark Runs hit the 128-token output limit,"
        " so the limit decided how much text they generated)\n"
    )


def test_pins_a_variant_and_reports_the_one_that_answered() -> None:
    cpu = FakeVisionModel(
        make_identity(
            variant="qwen3-vl-2b-instruct-generic-cpu:2", runtime="CPU / CPUExecutionProvider"
        ),
        [make_observation(completion_tokens=count) for count in COMPLETION_TOKENS],
    )
    gpu = FakeVisionModel(make_identity(), [make_observation()])
    foundry = FakeFoundry({"qwen3-vl-2b-instruct-generic-cpu:2": cpu, "qwen3-vl-2b-instruct": gpu})
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        ["--variant", "qwen3-vl-2b-instruct-generic-cpu:2"],
        camera=FakeCamera([make_frame()]),
        foundry=foundry,
        clock=FakeClock(READINGS),
        out=out,
        err=err,
    )

    assert code == 0
    assert gpu.observed == []
    assert foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu:2"]
    assert (
        "Model        qwen3-vl-2b-instruct-generic-cpu:2"
        " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    ) in out.getvalue()


def test_refuses_a_model_that_cannot_see_a_frame() -> None:
    model = FakeVisionModel(
        make_identity(task="chat", variant="qwen3.5-2b-text-generic-cpu:2"),
        [make_observation()],
        is_cached=False,
    )
    result = run(model=model)

    assert result.code == 1
    assert result.out == ""
    assert model.downloads == 0
    assert result.err.startswith(
        "error: qwen3.5-2b-text-generic-cpu:2 has task 'chat', not 'vision-language-chat'"
    )


def test_debug_restores_the_traceback() -> None:
    model = FakeVisionModel(make_identity(task="chat"), [make_observation()])
    with pytest.raises(Exception, match="cannot see a Frame"):
        run(["--debug"], model=model)


def test_refuses_an_image_file_and_a_camera_at_once() -> None:
    with pytest.raises(SystemExit):
        run(["--image", "a.jpg", "--camera", "1"])


def test_renders_a_benchmark_that_no_clock_and_no_model_ever_touched() -> None:
    """The reporting is exercised on its own, which is the point of it being its own module."""
    from vision.reporting import render_benchmark

    benchmark = Benchmark(
        model=make_identity(),
        workload=Workload(prompt=PROMPT, frame=make_frame(width=640, height=360)),
        providers=0.5,
        load=1.25,
        runs=tuple(
            BenchmarkRun(
                inference=inference,
                completion_tokens=tokens,
                finish_reason=FinishReason.COMPLETE,
            )
            for inference, tokens in zip((2.5, 2.0, 1.8, 2.2, 2.0), COMPLETION_TOKENS, strict=True)
        ),
    )

    assert render_benchmark(benchmark) == f"{HEADER}\n{TABLE}"
