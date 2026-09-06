"""End-to-end tests for the ``benchmark`` command, driven through the ports it is given.

The whole command runs against a fake Foundry, a fake camera and a fake clock, and what is
asserted is the rendered report — the thing an Operator reads and the thing they will quote.
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
from vision.benchmark import Benchmark, BenchmarkRun, MeasuredVariant
from vision.capture import REFERENCE_FRAME
from vision.cli import benchmark_main
from vision.errors import VisionError
from vision.inference import DEFAULT_VARIANTS, PROMPT, FinishReason, ModelIdentity, Workload

GPU_VARIANT, CPU_VARIANT = DEFAULT_VARIANTS
"""The two Variants a Benchmark measures when the Operator names none."""

PROVIDER_READINGS = (0.0, 0.5)
"""Registering the Execution Providers: 0.500 s. Paid once for the whole Benchmark."""

GPU_READINGS = (10.0, 11.25, 20.0, 22.5, 30.0, 32.0, 40.0, 41.8, 50.0, 52.2, 60.0, 62.0)
"""Loading the GPU Variant: 1.250 s. Then 2.500 s cold, then 2.000, 1.800, 2.200, 2.000.

The four after the first have a median of 2.000 s, a minimum of 1.800 s and a maximum of
2.200 s — three numbers that are each a different repetition, so a table that mixed two of
them up would be caught.
"""

CPU_READINGS = (
    100.0,
    100.8,
    200.0,
    220.0,
    300.0,
    318.0,
    400.0,
    417.5,
    500.0,
    518.5,
    600.0,
    618.0,
)
"""Loading the CPU Variant: 0.800 s. Then 20.000 s cold, then 18.000, 17.500, 18.500, 18.000."""

READINGS = (*PROVIDER_READINGS, *GPU_READINGS, *CPU_READINGS)

ONE_VARIANT_READINGS = (*PROVIDER_READINGS, *GPU_READINGS)

COMPLETION_TOKENS = (30, 24, 22, 26, 28)
"""One per Benchmark Run, all different: a rate read off the wrong run is then visible."""

HEADER = (
    "Frame        640x360 jpeg, fit to 640x480, from docs/fixtures/reference-frame.jpg\n"
    "Prompt       Describe what you see in this image in two or three sentences.\n"
    "Limits       at most 128 tokens, temperature 0.0\n"
    "Providers    0.500 s\n"
    "Repetitions  5 per Variant — the first reported apart,"
    " the median, minimum and maximum taken over the other 4\n"
)

GPU_BLOCK = (
    "Model        qwen3-vl-2b-instruct-cuda-gpu:2"
    " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
    "Measured     1st of 2\n"
    "Load         1.250 s\n"
    "\n"
    "                   First     Median        Min        Max\n"
    "Inference        2.500 s    2.000 s    1.800 s    2.200 s\n"
    "Tokens                30         25         22         28\n"
    "Tokens/second       12.0       12.1       11.8       14.0\n"
)

CPU_BLOCK = (
    "Model        qwen3-vl-2b-instruct-generic-cpu:2"
    " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    "Measured     2nd of 2\n"
    "Load         0.800 s\n"
    "\n"
    "                   First     Median        Min        Max\n"
    "Inference       20.000 s   18.000 s   17.500 s   18.500 s\n"
    "Tokens                30         25         22         28\n"
    "Tokens/second        1.5        1.4        1.3        1.6\n"
)

REPORT = f"{HEADER}\n{GPU_BLOCK}\n{CPU_BLOCK}"


@dataclass
class Run:
    """One invocation of the command, and everything it was driven through."""

    code: int
    out: str
    err: str
    foundry: FakeFoundry
    gpu: FakeVisionModel
    cpu: FakeVisionModel
    camera: FakeCamera
    events: list[str]


def make_gpu(
    tokens: tuple[int, ...] = COMPLETION_TOKENS, *, events: list[str] | None = None
) -> FakeVisionModel:
    return FakeVisionModel(
        make_identity(),
        [make_observation(completion_tokens=count) for count in tokens],
        events=events,
    )


def make_cpu(
    tokens: tuple[int, ...] = COMPLETION_TOKENS, *, events: list[str] | None = None
) -> FakeVisionModel:
    return FakeVisionModel(
        make_identity(
            variant="qwen3-vl-2b-instruct-generic-cpu:2", runtime="CPU / CPUExecutionProvider"
        ),
        [make_observation(completion_tokens=count) for count in tokens],
        events=events,
    )


def run(
    argv: list[str] | None = None,
    *,
    gpu: FakeVisionModel | None = None,
    cpu: FakeVisionModel | None = None,
    camera: FakeCamera | None = None,
    readings: tuple[float, ...] = READINGS,
    setup_lines: tuple[str, ...] = (),
) -> Run:
    """One invocation, with the Foundry, the camera and the clock all faked.

    The two Variants and the Foundry write into one journal, so a test can pin what
    happened before what across the three of them — which is the only way to see that one
    Variant really came off the hardware before the next went on.
    """
    events: list[str] = []
    gpu = gpu if gpu is not None else make_gpu(events=events)
    cpu = cpu if cpu is not None else make_cpu(events=events)
    gpu.events = cpu.events = events
    camera = camera if camera is not None else FakeCamera([make_frame(width=640, height=360)])
    foundry = FakeFoundry(
        {GPU_VARIANT: gpu, CPU_VARIANT: cpu}, setup_lines=setup_lines, events=events
    )
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        argv if argv is not None else [],
        camera=camera,
        foundry=foundry,
        clock=FakeClock(readings),
        out=out,
        err=err,
    )
    return Run(code, out.getvalue(), err.getvalue(), foundry, gpu, cpu, camera, events)


def test_measures_both_default_variants_and_prints_a_block_for_each() -> None:
    result = run()

    assert result.code == 0
    assert result.err == ""
    assert result.out == REPORT


def test_measures_the_cuda_gpu_and_cpu_variants_of_the_default_alias_by_default() -> None:
    """The comparison the demo exists to make, without orchestrating two runs by hand."""
    result = run()

    assert result.foundry.resolved == [
        "qwen3-vl-2b-instruct-cuda-gpu",
        "qwen3-vl-2b-instruct-generic-cpu",
    ]
    assert len(result.gpu.observed) == 5
    assert len(result.cpu.observed) == 5


def test_names_the_default_variants_without_a_version_so_the_catalogue_picks_one() -> None:
    """A version written into the source breaks the morning the catalogue publishes the
    next one, and would quietly measure a build nobody chose."""
    assert all(":" not in variant for variant in DEFAULT_VARIANTS)


def test_reports_the_resolved_variant_id_its_alias_and_what_it_runs_on() -> None:
    """The version the catalogue picked is what says which build produced these numbers."""
    result = run()

    assert (
        "Model        qwen3-vl-2b-instruct-cuda-gpu:2"
        " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
    ) in result.out
    assert (
        "Model        qwen3-vl-2b-instruct-generic-cpu:2"
        " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    ) in result.out


def test_takes_each_variant_off_the_hardware_before_the_next_one_goes_on() -> None:
    """Two loaded models compete for the same device, so the second measurement would be
    taken under conditions the Benchmark cannot report."""
    result = run()

    assert result.events == [
        "resolve",
        "resolve",
        "register",
        "load",
        *["observe"] * 5,
        "unload",
        "load",
        *["observe"] * 5,
        "unload",
    ]


def test_reports_the_order_the_variants_were_measured_in() -> None:
    """A result suspected of being contaminated by the previously loaded model can then be
    checked by reversing the order."""
    result = run()

    assert "Measured     1st of 2\n" in result.out
    assert "Measured     2nd of 2\n" in result.out


def test_reverses_the_order_when_the_variants_are_named_the_other_way_round() -> None:
    result = run(["--variant", CPU_VARIANT, "--variant", GPU_VARIANT])

    assert result.code == 0
    assert result.foundry.resolved == [CPU_VARIANT, GPU_VARIANT]
    cpu_block = result.out.index("qwen3-vl-2b-instruct-generic-cpu:2")
    gpu_block = result.out.index("qwen3-vl-2b-instruct-cuda-gpu:2")
    assert cpu_block < gpu_block


def test_a_named_variant_replaces_the_default_list_entirely() -> None:
    """Replacing rather than adding is what lets two model sizes be compared on fixed
    hardware, or an NPU Variant be measured, without the default pair coming along."""
    result = run(["--variant", GPU_VARIANT], readings=ONE_VARIANT_READINGS)

    assert result.code == 0
    assert result.foundry.resolved == [GPU_VARIANT]
    assert result.cpu.observed == []


def test_drops_the_order_and_the_per_variant_wording_when_there_is_one_variant() -> None:
    result = run(["--variant", GPU_VARIANT], readings=ONE_VARIANT_READINGS)

    assert "Measured" not in result.out
    assert (
        "Repetitions  5 — the first reported apart,"
        " the median, minimum and maximum taken over the other 4\n"
    ) in result.out


def test_lays_every_variants_table_out_to_one_set_of_column_widths() -> None:
    """Independently aligned tables cannot be read against each other, which is the only
    reason to measure two Variants in one sitting."""
    result = run()

    headers = [line for line in result.out.splitlines() if line.strip().startswith("First")]
    assert len(headers) == 2
    assert headers[0] == headers[1]


def test_refuses_a_variant_that_is_not_in_the_catalogue_before_measuring_anything() -> None:
    """Two minutes into a Benchmark is too late to be told the third name names nothing."""
    result = run(["--variant", GPU_VARIANT, "--variant", "no-such-variant"])

    assert result.code == 1
    assert result.out == ""
    assert result.err == "error: Foundry Local has no model called 'no-such-variant'\n"
    assert result.gpu.observed == []
    assert "load" not in result.events


def test_takes_five_benchmark_runs_per_variant_by_default() -> None:
    result = run()

    assert len(result.gpu.observed) == 5
    assert len(result.cpu.observed) == 5


def test_takes_as_many_repetitions_as_asked_for() -> None:
    result = run(
        ["--repetitions", "3"],
        gpu=make_gpu(COMPLETION_TOKENS[:3]),
        cpu=make_cpu(COMPLETION_TOKENS[:3]),
        readings=(*PROVIDER_READINGS, *GPU_READINGS[:8], *CPU_READINGS[:8]),
    )

    assert result.code == 0
    assert len(result.gpu.observed) == 3
    assert len(result.cpu.observed) == 3
    assert (
        "Repetitions  3 per Variant — the first reported apart,"
        " the median, minimum and maximum taken over the other 2\n"
    ) in result.out


def test_summarises_only_the_cold_repetition_when_that_is_all_there_is() -> None:
    """One repetition has a first and no steady state, and the table says so rather than
    inventing a median over a single sample."""
    result = run(
        ["--repetitions", "1", "--variant", GPU_VARIANT],
        gpu=make_gpu(COMPLETION_TOKENS[:1]),
        readings=(*PROVIDER_READINGS, *GPU_READINGS[:4]),
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


def test_refuses_a_benchmark_with_no_variant_to_measure() -> None:
    """Not reachable from the command line, where the default pair fills the gap — but it
    is an invariant of a Benchmark, so it is guarded where a Benchmark is made."""
    from vision.benchmark import require_a_variant

    with pytest.raises(VisionError, match="at least one Variant"):
        require_a_variant([])


def test_keeps_the_cold_repetition_out_of_the_median_rather_than_out_of_the_table() -> None:
    """A cold model is the honest number, and it is also the one that would skew a median
    over four samples — so it is reported and then excluded."""
    cold = (10.0, 11.25, 20.0, 40.0, *GPU_READINGS[4:])
    result = run(["--variant", GPU_VARIANT], readings=(*PROVIDER_READINGS, *cold))

    assert "Inference       20.000 s   2.000 s   1.800 s   2.200 s\n" in result.out
    assert "Tokens/second        1.5      12.1      11.8      14.0\n" in result.out


def test_reports_tokens_per_second_alongside_the_latency() -> None:
    """Two repetitions of the same latency that generated different amounts of text are
    not the same result, and the rate is what says so."""
    result = run(
        ["--repetitions", "2", "--variant", GPU_VARIANT],
        gpu=make_gpu((20, 40)),
        readings=(*PROVIDER_READINGS, 10.0, 11.25, 20.0, 22.0, 30.0, 32.0),
    )

    assert "Tokens               20        40        40        40\n" in result.out
    assert "Tokens/second      10.0      20.0      20.0      20.0\n" in result.out


def test_measures_the_reference_frame_by_default() -> None:
    """No camera injected, so the real image-file capture reads the repository's fixture."""
    events: list[str] = []
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        [],
        foundry=FakeFoundry(
            {GPU_VARIANT: make_gpu(events=events), CPU_VARIANT: make_cpu(events=events)},
            events=events,
        ),
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
        foundry=FakeFoundry({GPU_VARIANT: make_gpu(), CPU_VARIANT: make_cpu()}),
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
    """What makes the Workload identical across repetitions and across Variants: one read,
    one set of bytes."""
    result = run()

    assert result.camera.captures == 1
    observed = [*result.gpu.observed, *result.cpu.observed]
    assert len({id(workload.frame) for workload in observed}) == 1
    assert all(workload.prompt == PROMPT for workload in observed)
    assert all(workload.max_output_tokens == 128 for workload in observed)


def test_registers_the_execution_providers_once_for_the_whole_benchmark() -> None:
    """Machine set-up, paid once per process — not once per Variant and not once per run."""
    result = run()

    assert result.events.count("register") == 1
    assert result.events.index("register") < result.events.index("load")


def test_reports_the_provider_registration_outside_every_variants_table() -> None:
    result = run()

    header, *blocks = result.out.split("\n\n")
    assert "Providers    0.500 s" in header
    assert all("Providers" not in block for block in blocks)


def test_reports_what_loading_each_variant_cost() -> None:
    """Paid once per Variant, so it sits above that Variant's table rather than in it."""
    result = run()

    assert "Load         1.250 s\n" in result.out
    assert "Load         0.800 s\n" in result.out


def test_takes_every_variant_back_off_the_hardware() -> None:
    result = run()

    assert result.gpu.unloads == 1
    assert result.cpu.unloads == 1
    assert not result.gpu.loaded
    assert not result.cpu.loaded


def test_takes_the_variant_off_the_hardware_even_when_a_benchmark_run_fails() -> None:
    """A model left resident measures whatever runs next under conditions it cannot report."""
    gpu = make_gpu((30,))
    result = run(
        ["--repetitions", "2"],
        gpu=gpu,
        readings=(*PROVIDER_READINGS, 10.0, 11.25, 20.0, 22.0, 30.0),
    )

    assert result.code == 1
    assert gpu.unloads == 1
    assert result.cpu.observed == []


def test_says_how_many_benchmark_runs_the_output_limit_cut_short_under_the_variant() -> None:
    """Two Variants do not truncate the same number of times, so the note sits with the
    numbers it accuses rather than at the bottom of the report."""
    truncated = FakeVisionModel(
        make_identity(),
        [
            make_observation(completion_tokens=30),
            make_observation(completion_tokens=128, finish_reason=FinishReason.TRUNCATED),
            make_observation(completion_tokens=22),
            make_observation(completion_tokens=128, finish_reason=FinishReason.TRUNCATED),
            make_observation(completion_tokens=28),
        ],
    )
    result = run(gpu=truncated)

    assert result.code == 0
    note = (
        "(2 of 5 Benchmark Runs hit the 128-token output limit,"
        " so the limit decided how much text they generated)\n"
    )
    assert note in result.out
    assert result.out.index(note) < result.out.index("qwen3-vl-2b-instruct-generic-cpu:2")


def test_shows_no_progress_bar_when_the_output_is_not_a_terminal() -> None:
    """Output captured in a pipe or in CI is just the report, exactly as the download bar
    takes itself off. The exact-output assertions above only hold because of this."""
    result = run()

    assert "Measuring" not in result.out
    assert "\r" not in result.out


def test_shows_one_progress_bar_per_variant_on_a_terminal() -> None:
    """A Benchmark that says nothing for minutes looks like a hang."""
    out = _Terminal()
    code = benchmark_main(
        [],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        foundry=FakeFoundry({GPU_VARIANT: make_gpu(), CPU_VARIANT: make_cpu()}),
        clock=FakeClock(READINGS),
        out=out,
        err=io.StringIO(),
    )

    assert code == 0
    assert "Measuring qwen3-vl-2b-instruct-cuda-gpu:2" in out.getvalue()
    assert "Measuring qwen3-vl-2b-instruct-generic-cpu:2" in out.getvalue()


def test_the_progress_bar_carries_the_last_latency_and_the_running_median() -> None:
    """The median is the one the table is about to print — over the repetitions after the
    first — because a bar quoting a different median would be worse than no bar."""
    out = _Terminal()
    code = benchmark_main(
        ["--variant", GPU_VARIANT],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        foundry=FakeFoundry({GPU_VARIANT: make_gpu()}),
        clock=FakeClock(ONE_VARIANT_READINGS),
        out=out,
        err=io.StringIO(),
    )

    assert code == 0
    assert "last 2.000 s, median 2.000 s" in out.getvalue()


def test_the_progress_bar_says_a_lone_repetition_is_cold_rather_than_calling_it_a_median() -> None:
    """One sample is not a steady state, and the bar does not pretend it is."""
    out = _Terminal()
    code = benchmark_main(
        ["--variant", GPU_VARIANT, "--repetitions", "1"],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        foundry=FakeFoundry({GPU_VARIANT: make_gpu(COMPLETION_TOKENS[:1])}),
        clock=FakeClock((*PROVIDER_READINGS, *GPU_READINGS[:4])),
        out=out,
        err=io.StringIO(),
    )

    assert code == 0
    assert "last 2.500 s (cold)" in out.getvalue()


class _Terminal(io.StringIO):
    """A stream that says it is a terminal, so tqdm draws instead of taking itself off."""

    def isatty(self) -> bool:
        return True


def test_pins_an_exact_variant_id_and_reports_the_one_that_answered() -> None:
    """A version suffix names one build, and the flag still accepts one — a Benchmark of a
    Variant that has since been republished is the reason to want that."""
    cpu = make_cpu()
    out, err = io.StringIO(), io.StringIO()
    foundry = FakeFoundry({"qwen3-vl-2b-instruct-generic-cpu:2": cpu})
    code = benchmark_main(
        ["--variant", "qwen3-vl-2b-instruct-generic-cpu:2"],
        camera=FakeCamera([make_frame()]),
        foundry=foundry,
        clock=FakeClock(ONE_VARIANT_READINGS),
        out=out,
        err=err,
    )

    assert code == 0
    assert foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu:2"]
    assert (
        "Model        qwen3-vl-2b-instruct-generic-cpu:2"
        " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    ) in out.getvalue()


def test_refuses_a_model_that_cannot_see_a_frame() -> None:
    blind = FakeVisionModel(
        make_identity(task="chat", variant="qwen3.5-2b-text-generic-cpu:2"),
        [make_observation()],
        is_cached=False,
    )
    result = run(gpu=blind)

    assert result.code == 1
    assert result.out == ""
    assert blind.downloads == 0
    assert result.err.startswith(
        "error: qwen3.5-2b-text-generic-cpu:2 has task 'chat', not 'vision-language-chat'"
    )


def test_debug_restores_the_traceback() -> None:
    blind = FakeVisionModel(make_identity(task="chat"), [make_observation()])
    with pytest.raises(Exception, match="cannot see a Frame"):
        run(["--debug"], gpu=blind)


def test_refuses_an_image_file_and_a_camera_at_once() -> None:
    with pytest.raises(SystemExit):
        run(["--image", "a.jpg", "--camera", "1"])


def test_renders_a_benchmark_that_no_clock_and_no_model_ever_touched() -> None:
    """The reporting is exercised on its own, which is the point of it being its own module."""
    from vision.reporting import render_benchmark

    benchmark = Benchmark(
        workload=Workload(prompt=PROMPT, frame=make_frame(width=640, height=360)),
        providers=0.5,
        variants=(
            _measured(1, make_identity(), 1.25, (2.5, 2.0, 1.8, 2.2, 2.0)),
            _measured(
                2,
                make_identity(
                    variant="qwen3-vl-2b-instruct-generic-cpu:2",
                    runtime="CPU / CPUExecutionProvider",
                ),
                0.8,
                (20.0, 18.0, 17.5, 18.5, 18.0),
            ),
        ),
    )

    assert render_benchmark(benchmark) == REPORT


def _measured(
    order: int, identity: ModelIdentity, load: float, latencies: tuple[float, ...]
) -> MeasuredVariant:
    return MeasuredVariant(
        model=identity,
        order=order,
        load=load,
        runs=tuple(
            BenchmarkRun(
                inference=inference,
                completion_tokens=tokens,
                finish_reason=FinishReason.COMPLETE,
            )
            for inference, tokens in zip(latencies, COMPLETION_TOKENS, strict=True)
        ),
    )
