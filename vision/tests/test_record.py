"""What a Benchmark leaves behind: the JSON record and the Markdown beside it.

Driven through the command, like the other end-to-end tests, because the point of this
feature is what an Operator finds on disk after a real sitting — not what a function
returns. The destination is a temporary directory (see ``conftest``), and the assertions
are on the files as they land there.
"""

from __future__ import annotations

import hashlib
import io
import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import pytest

from tests.fakes import (
    OBSERVED,
    FakeCamera,
    FakeClock,
    FakeFoundry,
    FakeVisionModel,
    make_frame,
    make_identity,
    make_observation,
)
from tests.test_benchmark import (
    CPU_IDENTITY,
    CPU_VARIANT,
    CUPS,
    GPU_OBJECTS,
    GPU_VARIANT,
    INVALID_GRAPH,
    READINGS,
    make_cpu,
    make_gpu,
    make_structured_cpu,
    make_structured_gpu,
)
from vision.cli import benchmark_main
from vision.inference import PROMPT, STRUCTURED_PROMPT, NoShape, ObjectsPresent
from vision.record import SCHEMA_VERSION, hardware_profile, this_machine
from vision.router import Router

PROFILE = "RTX 4090 + i7-13700KF"
"""What an Operator declares their machine to be — the words a reader is left with."""

AT = datetime(2026, 9, 7, 14, 3, 11, tzinfo=timezone(timedelta(hours=2)))
"""The instant the Benchmark was recorded at, pinned so the file name is pinnable."""

STEM = "rtx-4090-i7-13700kf-20260907-140311"
"""The slug of that Hardware Profile, and that instant down to the second."""


@dataclass
class Kept:
    """One sitting, and the two files it left behind."""

    code: int
    out: str
    json: Path
    markdown: Path

    @property
    def record(self) -> dict[str, Any]:
        return dict(json.loads(self.json.read_text(encoding="utf-8")))

    @property
    def document(self) -> str:
        return self.markdown.read_text(encoding="utf-8")


def keep(
    benchmarks: Path,
    argv: list[str] | None = None,
    *,
    gpu: FakeVisionModel | None = None,
    cpu: FakeVisionModel | None = None,
    camera: FakeCamera | None = None,
    readings: tuple[float, ...] = READINGS,
    at: datetime = AT,
    profile: str | None = PROFILE,
) -> Kept:
    """Run the default two-Variant sitting and hand back what it wrote down."""
    declared = [] if profile is None else ["--hardware", profile]
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        [*(argv or []), *declared],
        camera=camera if camera is not None else FakeCamera([make_frame(width=640, height=360)]),
        router=Router(
            FakeFoundry(
                {
                    GPU_VARIANT: gpu if gpu is not None else make_gpu(),
                    CPU_VARIANT: cpu if cpu is not None else make_cpu(),
                }
            )
        ),
        clock=FakeClock(readings),
        now=lambda: at,
        out=out,
        err=err,
        benchmarks_dir=benchmarks,
    )
    written = sorted(benchmarks.glob("*.json"))
    assert len(written) == 1, f"expected one record, found {written}"
    return Kept(code, out.getvalue(), written[0], written[0].with_suffix(".md"))


def test_writes_a_json_record_and_a_markdown_table_together(benchmarks: Path) -> None:
    """Both from the same value at the same moment: a table that could disagree with its
    own record would be worse than either file alone."""
    kept = keep(benchmarks)

    assert kept.code == 0
    assert kept.json.exists()
    assert kept.markdown.exists()
    assert sorted(path.name for path in benchmarks.iterdir()) == [f"{STEM}.json", f"{STEM}.md"]


def test_names_the_files_after_the_hardware_profile_and_a_full_timestamp(
    benchmarks: Path,
) -> None:
    """Two machines' results never collide, and three sittings in one afternoon are three
    pairs of files rather than one overwritten twice."""
    kept = keep(benchmarks)

    assert kept.json.name == "rtx-4090-i7-13700kf-20260907-140311.json"
    assert kept.markdown.name == "rtx-4090-i7-13700kf-20260907-140311.md"


def test_says_where_it_wrote_the_benchmark_down(benchmarks: Path) -> None:
    """An Operator who is not told where the file went has to go and find it."""
    kept = keep(benchmarks)

    assert kept.out.endswith(f"\nRecorded     {kept.json}\n             {kept.markdown}\n")


def test_a_second_benchmark_in_the_same_second_does_not_overwrite_the_first(
    benchmarks: Path,
) -> None:
    """The one failure the whole module exists to prevent — a sitting that cost minutes
    and was silently replaced by the next one."""
    for _ in range(2):
        benchmark_main(
            ["--hardware", PROFILE],
            camera=FakeCamera([make_frame(width=640, height=360)]),
            router=Router(FakeFoundry({GPU_VARIANT: make_gpu(), CPU_VARIANT: make_cpu()})),
            clock=FakeClock(READINGS),
            now=lambda: AT,
            out=io.StringIO(),
            err=io.StringIO(),
            benchmarks_dir=benchmarks,
        )

    assert sorted(path.name for path in benchmarks.iterdir()) == [
        f"{STEM}-1.json",
        f"{STEM}-1.md",
        f"{STEM}.json",
        f"{STEM}.md",
    ]


def test_neither_file_is_written_over_a_name_something_else_already_holds(
    benchmarks: Path,
) -> None:
    """The Markdown is claimed as exclusively as the record. It is the half a reader is
    more likely to have opened, and overwriting it would be the same loss."""
    benchmarks.mkdir(parents=True)
    (benchmarks / f"{STEM}.md").write_text("someone else's Benchmark", encoding="utf-8")

    kept = keep(benchmarks)

    assert kept.json.name == f"{STEM}-1.json"
    assert kept.markdown.name == f"{STEM}-1.md"
    assert (benchmarks / f"{STEM}.md").read_text(encoding="utf-8") == "someone else's Benchmark"
    assert not (benchmarks / f"{STEM}.json").exists()


def test_the_record_carries_a_schema_version(benchmarks: Path) -> None:
    """Cross-machine comparison is not built here; the version is what keeps that door
    open, by making today's files identifiable to the tool that will one day read them."""
    assert keep(benchmarks).record["schema_version"] == SCHEMA_VERSION


def test_the_record_carries_the_instant_the_hardware_profile_and_the_sitting(
    benchmarks: Path,
) -> None:
    record = keep(benchmarks).record

    assert record["recorded_at"] == "2026-09-07T14:03:11+02:00"
    assert record["hardware_profile"] == PROFILE
    assert record["repetitions"] == 5
    assert record["provider_registration"] == 0.5


def test_the_record_identifies_the_frame_by_its_bytes(benchmarks: Path) -> None:
    """ "The same Workload" is a claim a reader can check against a Frame of their own,
    rather than one they have to take on trust (ADR-0005)."""
    frame = make_frame(width=640, height=360)
    workload = keep(benchmarks).record["workload"]

    assert workload["frame"] == {
        "sha256": hashlib.sha256(frame.data).hexdigest(),
        "bytes": len(frame.data),
        "width": 640,
        "height": 360,
        "codec": "jpeg",
        "provenance": "docs/fixtures/reference-frame.jpg",
    }
    assert workload["prompt"].startswith("Describe what you see")
    assert workload["max_output_tokens"] == 128
    assert workload["temperature"] == 0.0


def test_the_scene_question_is_the_prompt_the_record_carries(benchmarks: Path) -> None:
    """A record whose question is not in it cannot be compared with any other record: two
    Benchmarks taken under different Scene Questions measured different work."""
    workload = keep(benchmarks, ["--ask", CUPS]).record["workload"]

    assert workload["prompt"] == CUPS
    assert workload["max_output_tokens"] == 128
    assert workload["temperature"] == 0.0


def test_the_markdown_carries_the_scene_question_beside_the_frame_and_the_limits(
    benchmarks: Path,
) -> None:
    """The three facts that say what was measured travel together, so a reader months
    later can tell whether two documents are comparable at all."""
    frame = make_frame(width=640, height=360)
    document = keep(benchmarks, ["--ask", CUPS]).document

    assert f"- **Prompt** — {CUPS}\n" in document
    assert f"- **Frame bytes** — sha256 {hashlib.sha256(frame.data).hexdigest()}," in document
    assert "- **Limits** — at most 128 tokens, temperature 0.0\n" in document


def test_a_benchmark_with_no_scene_question_is_recorded_as_it_always_was(
    benchmarks: Path,
) -> None:
    """The records already committed to the repository keep their peers."""
    kept = keep(benchmarks)

    assert kept.record["workload"]["prompt"] == PROMPT
    assert f"- **Prompt** — {PROMPT}\n" in kept.document


def test_the_record_carries_the_order_the_variants_were_measured_in(benchmarks: Path) -> None:
    """A Variant measured second was measured on a machine that had just had another model
    taken off it, and the record is where that survives the terminal."""
    variants = keep(benchmarks).record["variants"]

    assert [variant["id"] for variant in variants] == [
        "qwen3-vl-2b-instruct-cuda-gpu:2",
        "qwen3-vl-2b-instruct-generic-cpu:2",
    ]
    assert [variant["order"] for variant in variants] == [1, 2]


def test_the_record_carries_every_benchmark_run_of_every_variant(benchmarks: Path) -> None:
    """Every run rather than the spread over them: a spread can be recomputed from the
    runs, and the runs cannot be recovered from a spread."""
    gpu, cpu = keep(benchmarks).record["variants"]

    assert gpu["alias"] == "qwen3-vl-2b-instruct"
    assert gpu["execution_provider"] == "NvTensorRtRtxExecutionProvider"
    assert gpu["device_type"] == "GPU"
    assert gpu["loaded"] is True
    assert gpu["reason"] is None
    assert gpu["load"] == 1.25
    # The seconds are what the clock gave, to the last bit: the record is the raw one, and
    # rounding on the way in is a decision the report makes and a record does not.
    assert [run["inference"] for run in gpu["runs"]] == pytest.approx([2.5, 2.0, 1.8, 2.2, 2.0])
    assert [run["completion_tokens"] for run in gpu["runs"]] == [30, 24, 22, 26, 28]
    assert [run["finish_reason"] for run in gpu["runs"]] == ["complete"] * 5
    assert cpu["execution_provider"] == "CPUExecutionProvider"
    assert cpu["device_type"] == "CPU"
    assert len(cpu["runs"]) == 5


def test_the_record_carries_one_observation_per_variant(benchmarks: Path) -> None:
    """Whether the CPU says the same thing as the GPU is the more interesting half of the
    comparison once the latency gap turns out to be eightfold."""
    gpu, cpu = keep(
        benchmarks,
        cpu=FakeVisionModel(
            CPU_IDENTITY, [make_observation(text="A cluttered desk.") for _ in range(5)]
        ),
    ).record["variants"]

    assert gpu["observation"] == OBSERVED
    assert cpu["observation"] == "A cluttered desk."


def test_a_variant_that_would_not_load_is_a_row_in_the_record_too(benchmarks: Path) -> None:
    """It is part of the Benchmark rather than an error that ended one (ADR-0007), and a
    record that dropped it would be a record of a question nobody asked."""
    kept = keep(
        benchmarks,
        gpu=FakeVisionModel(make_identity(), [], load_error=RuntimeError(INVALID_GRAPH)),
        readings=(0.0, 0.5, 10.0, *READINGS[14:]),
    )
    gpu, cpu = kept.record["variants"]

    assert kept.code == 0
    assert gpu["order"] == 1
    assert gpu["loaded"] is False
    assert gpu["load"] is None
    assert gpu["runs"] == []
    assert gpu["observation"] is None
    assert INVALID_GRAPH in gpu["reason"]
    assert cpu["loaded"] is True


def test_a_benchmark_that_measured_nothing_is_not_written_down(benchmarks: Path) -> None:
    """A directory of records is a directory of results, and a sitting in which nothing
    could be measured has none — the reasons are printed and that is the whole answer."""
    out, err = io.StringIO(), io.StringIO()
    code = benchmark_main(
        ["--hardware", PROFILE],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        router=Router(
            FakeFoundry(
                {
                    GPU_VARIANT: FakeVisionModel(
                        make_identity(), [], load_error=RuntimeError(INVALID_GRAPH)
                    ),
                    CPU_VARIANT: FakeVisionModel(
                        CPU_IDENTITY, [], load_error=RuntimeError(INVALID_GRAPH)
                    ),
                }
            )
        ),
        clock=FakeClock((0.0, 0.5, 10.0, 100.0)),
        now=lambda: AT,
        out=out,
        err=err,
        benchmarks_dir=benchmarks,
    )

    assert code == 1
    assert "Not measured" in out.getvalue()
    assert "Recorded" not in out.getvalue()
    assert not benchmarks.exists() or list(benchmarks.iterdir()) == []


def test_the_markdown_lays_every_variant_out_as_one_comparison_table(benchmarks: Path) -> None:
    document = keep(benchmarks).document

    assert document.startswith(f"# Benchmark — {PROFILE}\n")
    assert "- **Recorded** — 2026-09-07 14:03:11+02:00\n" in document
    assert (
        "| Variant | Runs on | Turn | Load | First | Median | Min | Max |"
        " Tokens | Tokens/second |\n"
    ) in document
    assert (
        "| `qwen3-vl-2b-instruct-cuda-gpu:2` | GPU / NvTensorRtRtxExecutionProvider |"
        " 1st of 2 | 1.250 s | 2.500 s | 2.000 s | 1.800 s | 2.200 s | 25 | 12.1 |\n"
    ) in document
    assert (
        "| `qwen3-vl-2b-instruct-generic-cpu:2` | CPU / CPUExecutionProvider |"
        " 2nd of 2 | 0.800 s | 20.000 s | 18.000 s | 17.500 s | 18.500 s | 25 | 1.4 |\n"
    ) in document


def test_the_markdown_names_the_frame_by_its_bytes_as_well_as_by_its_path(
    benchmarks: Path,
) -> None:
    frame = make_frame()
    document = keep(benchmarks).document

    assert f"- **Frame bytes** — sha256 {hashlib.sha256(frame.data).hexdigest()}," in document
    assert f"{len(frame.data)} bytes\n" in document


def test_the_markdown_carries_what_each_variant_saw(benchmarks: Path) -> None:
    document = keep(benchmarks).document

    assert "## What each Variant saw" in document
    assert f"**qwen3-vl-2b-instruct-cuda-gpu:2**\n\n> {OBSERVED}\n" in document


def test_the_token_divergence_warning_travels_into_the_markdown(benchmarks: Path) -> None:
    """The caveat has to reach whoever reads the file months later, in the same words the
    terminal used — a table of seconds looks like a hardware comparison wherever it is read."""
    kept = keep(benchmarks, cpu=make_cpu((60, 48, 44, 52, 56)))
    sentence = (
        "qwen3-vl-2b-instruct-generic-cpu:2 generated 52 tokens against"
        " qwen3-vl-2b-instruct-cuda-gpu:2's 26 — 100% more, so these Variants did not do the"
        " same amount of work and their latencies are not a hardware comparison;"
        " Tokens/second is the figure that survives it"
    )

    assert f"({sentence})\n" in kept.out
    assert f"**Not a hardware comparison.** {sentence}.\n" in kept.document
    assert kept.record["token_divergence"] == {
        "fewest": "qwen3-vl-2b-instruct-cuda-gpu:2",
        "fewest_tokens": 26.0,
        "most": "qwen3-vl-2b-instruct-generic-cpu:2",
        "most_tokens": 52.0,
        "fraction": 1.0,
    }


def test_the_markdown_says_why_an_unmeasured_variants_row_is_empty(benchmarks: Path) -> None:
    document = keep(
        benchmarks,
        gpu=FakeVisionModel(make_identity(), [], load_error=RuntimeError(INVALID_GRAPH)),
        readings=(0.0, 0.5, 10.0, *READINGS[14:]),
    ).document

    assert (
        "| `qwen3-vl-2b-instruct-cuda-gpu:2` | GPU / NvTensorRtRtxExecutionProvider |"
        " 1st of 2 | — | — | — | — | — | — | — |\n"
    ) in document
    assert "**qwen3-vl-2b-instruct-cuda-gpu:2 was not measured.** " in document
    assert INVALID_GRAPH in document


def test_a_lone_repetition_has_no_steady_state_to_put_in_the_table(benchmarks: Path) -> None:
    """Dashes rather than a median over one sample, exactly as the terminal declines to
    summarise a single Benchmark Run — and the cold run's own tokens where a median over
    the steady state is what the column would otherwise hold."""
    document = keep(
        benchmarks,
        ["--repetitions", "1", "--variant", GPU_VARIANT],
        gpu=make_gpu((30,)),
        readings=(0.0, 0.5, 10.0, 11.25, 20.0, 22.5),
    ).document

    assert (
        "| `qwen3-vl-2b-instruct-cuda-gpu:2` | GPU / NvTensorRtRtxExecutionProvider |"
        " 1st of 1 | 1.250 s | 2.500 s | — | — | — | 30 | 12.0 |\n"
    ) in document


def test_an_operator_who_declares_no_hardware_profile_still_gets_a_named_record(
    benchmarks: Path,
) -> None:
    """A Benchmark is never anonymous. What the standard library reports tells two machines
    apart; it is a fallback, not the description a reader six months from now needs."""
    kept = keep(benchmarks, profile=None)

    assert kept.record["hardware_profile"] == this_machine()
    assert kept.json.name.endswith("-20260907-140311.json")
    assert kept.json.name != "-20260907-140311.json"


def test_what_the_machine_says_about_itself_names_the_host_and_the_platform() -> None:
    """No hardware probing, no platform-specific tooling and no new dependencies: there is
    no portable way to ask a machine what GPU it has, and it would be a string either way."""
    import platform

    described = this_machine()

    assert platform.node() in described
    assert platform.machine() in described


def test_a_declared_hardware_profile_is_preferred_to_what_the_machine_reports() -> None:
    """ "RTX 4090 + i7-13700KF" is what a reader needs; a hostname means nothing to them."""
    assert hardware_profile(PROFILE) == PROFILE
    assert hardware_profile("  padded  ") == "padded"
    assert hardware_profile(None) == this_machine()
    assert hardware_profile("   ") == this_machine()


def test_the_recorded_instant_carries_its_offset(benchmarks: Path) -> None:
    """An Operator recognises the afternoon they ran it; a reader elsewhere can still
    place it against their own."""
    kept = keep(benchmarks, at=datetime(2026, 9, 7, 12, 3, 11, tzinfo=UTC))

    assert kept.record["recorded_at"] == "2026-09-07T12:03:11+00:00"


def test_a_record_that_cannot_be_written_costs_the_file_and_not_the_numbers(
    tmp_path: Path,
) -> None:
    """A sitting takes minutes. A directory that will not take the file is worth a failure,
    but never one that swallows the table it was about to write down."""
    blocked = tmp_path / "occupied"
    blocked.write_text("not a directory", encoding="utf-8")
    out, err = io.StringIO(), io.StringIO()

    code = benchmark_main(
        ["--hardware", PROFILE],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        router=Router(FakeFoundry({GPU_VARIANT: make_gpu(), CPU_VARIANT: make_cpu()})),
        clock=FakeClock(READINGS),
        now=lambda: AT,
        out=out,
        err=err,
        benchmarks_dir=blocked / "benchmarks",
    )

    assert code == 1
    assert "Tokens/second       12.0       12.1       11.8       14.0\n" in out.getvalue()
    assert "Recorded" not in out.getvalue()
    assert err.getvalue().startswith(
        f"error: the Benchmark was measured but could not be written to"
        f" {blocked / 'benchmarks'} — its numbers are in the report above,"
        " and nothing else was lost."
    )


class BreaksOnWrite:
    """A file that was created and then would not take its contents.

    The half-written case, which is the one the pair has to survive: exclusive creation
    has already succeeded, so a rollback that forgets this file leaves an empty document
    behind under a name a reader will open.
    """

    def __init__(self, file: Any) -> None:
        self._file = file

    def __enter__(self) -> BreaksOnWrite:
        self._file.__enter__()
        return self

    def __exit__(self, *closing: Any) -> None:
        self._file.__exit__(*closing)

    def write(self, _: str) -> int:
        raise OSError("no space left on device")


def test_a_document_that_breaks_mid_write_leaves_neither_half_behind(
    benchmarks: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A truncated Markdown with no record beside it reads like a real one to whoever opens
    it next, which is exactly the half a reader is more likely to open."""
    opening = Path.open

    def breaking(self: Path, *arguments: Any, **keywords: Any) -> Any:
        file = opening(self, *arguments, **keywords)
        return BreaksOnWrite(file) if self.suffix == ".md" else file

    monkeypatch.setattr(Path, "open", breaking)
    out, err = io.StringIO(), io.StringIO()

    code = benchmark_main(
        ["--hardware", PROFILE],
        camera=FakeCamera([make_frame(width=640, height=360)]),
        router=Router(FakeFoundry({GPU_VARIANT: make_gpu(), CPU_VARIANT: make_cpu()})),
        clock=FakeClock(READINGS),
        now=lambda: AT,
        out=out,
        err=err,
        benchmarks_dir=benchmarks,
    )

    assert code == 1
    assert list(benchmarks.iterdir()) == []


def keep_structured(
    benchmarks: Path,
    argv: list[str] | None = None,
    *,
    gpu: FakeVisionModel | None = None,
    cpu: FakeVisionModel | None = None,
    readings: tuple[float, ...] = READINGS,
) -> Kept:
    """A ``--structured`` sitting, and the two files it left behind."""
    return keep(
        benchmarks,
        ["--structured", *(argv or [])],
        gpu=gpu if gpu is not None else make_structured_gpu(),
        cpu=cpu if cpu is not None else make_structured_cpu(),
        readings=readings,
    )


def test_a_structured_record_carries_the_object_list_as_machine_readable_data(
    benchmarks: Path,
) -> None:
    """The objects are data, not a quoted paragraph, so a later tool reads them rather than
    parsing them back out of prose (ADR-0008, ADR-0011)."""
    kept = keep_structured(benchmarks)
    gpu, cpu = kept.record["variants"]

    assert kept.code == 0
    assert gpu["objects"] == [{"name": "cup", "count": 2}, {"name": "laptop", "count": 1}]
    assert gpu["no_shape"] is None
    assert "observation" not in gpu
    assert cpu["objects"] == [{"name": "cup", "count": 2}, {"name": "book", "count": 3}]


def test_a_structured_markdown_shows_the_objects_as_a_list(benchmarks: Path) -> None:
    """Both renderings come from the same Benchmark, so they cannot disagree: the Markdown
    lays out the same objects the JSON records, as a list a person reads (ADR-0008)."""
    document = keep_structured(benchmarks).document

    assert "## What each Variant saw" in document
    assert "**qwen3-vl-2b-instruct-cuda-gpu:2**\n\n- 2 × cup\n- 1 × laptop\n" in document
    assert "**qwen3-vl-2b-instruct-generic-cpu:2**\n\n- 2 × cup\n- 3 × book\n" in document


def test_a_structured_no_shape_run_is_recorded_and_shown_as_its_reason(
    benchmarks: Path,
) -> None:
    """A model that declined the shape is a "no shape" run carrying its reason, never a
    silent degrade to prose — in the JSON as null objects, in the Markdown as the reason."""
    reason = "the model answered in prose instead of the list of objects the shape asks for"
    declined = (NoShape(reason),) + tuple(ObjectsPresent(GPU_OBJECTS) for _ in range(4))
    kept = keep_structured(benchmarks, gpu=make_structured_gpu(declined))
    gpu, _ = kept.record["variants"]

    assert kept.code == 0
    assert gpu["objects"] is None
    assert gpu["no_shape"] == reason
    assert f"**qwen3-vl-2b-instruct-cuda-gpu:2**\n\n_No shape — {reason}._\n" in kept.document


def test_a_structured_record_carries_the_fixed_shape_as_its_prompt(benchmarks: Path) -> None:
    """The fixed shape is the Workload's prompt; two structured records are comparable only
    when it matches, as they must match the Frame and the limits."""
    kept = keep_structured(benchmarks)

    assert kept.record["workload"]["prompt"] == STRUCTURED_PROMPT
    assert f"- **Prompt** — {STRUCTURED_PROMPT}\n" in kept.document


def test_an_unmeasured_variant_in_a_structured_sitting_carries_the_structured_answer_keys(
    benchmarks: Path,
) -> None:
    """Every Variant in one record carries the answer keys of its kind of Benchmark, the
    Unmeasured ones included, so a reader never has to know which kind it is holding (ADR-0007)."""
    kept = keep_structured(
        benchmarks,
        gpu=FakeVisionModel(make_identity(), [], load_error=RuntimeError(INVALID_GRAPH)),
        readings=(0.0, 0.5, 10.0, *READINGS[14:]),
    )
    gpu, cpu = kept.record["variants"]

    assert kept.code == 0
    assert gpu["loaded"] is False
    assert gpu["objects"] is None
    assert gpu["no_shape"] is None
    assert "observation" not in gpu
    assert cpu["loaded"] is True
    assert cpu["objects"] == [{"name": "cup", "count": 2}, {"name": "book", "count": 3}]


def test_a_prose_record_is_unchanged_by_the_structured_answer_keys(benchmarks: Path) -> None:
    """A prose Benchmark carries its observation and no objects keys: the records already in
    the repository keep the shape they had."""
    gpu = keep(benchmarks).record["variants"][0]

    assert gpu["observation"] == OBSERVED
    assert "objects" not in gpu
    assert "no_shape" not in gpu
