"""End-to-end tests for the ``observe`` command, driven through the ports it is given."""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import pytest
from PIL import Image

import vision.capture
from tests.fakes import (
    SETTLED_COLOUR,
    FakeCamera,
    FakeCameras,
    FakeClock,
    FakeFeed,
    FakeFoundry,
    FakeOpenVINO,
    FakeVisionModel,
    colour_of,
    make_frame,
    make_identity,
    make_observation,
    make_provenance_identity,
    make_structured_observation,
    settling_feed,
)
from vision.capture import SETTLING_FRAMES, WORKING_RESOLUTION
from vision.cli import main
from vision.inference import (
    STRUCTURED_PROMPT,
    FinishReason,
    NoShape,
    ObjectsPresent,
    PresentObject,
    Where,
)
from vision.router import Router

SETUP_READINGS = (0.0, 0.5)
"""Registering the Execution Providers: 0.500 s."""

WORK_READINGS = (10.0, 11.25, 20.0, 20.03, 30.0, 32.5)
"""Load 1.250 s, capture 0.030 s, inference 2.500 s."""

CACHED_READINGS = (*SETUP_READINGS, *WORK_READINGS)
"""A whole run, with no download in front of it."""

REPORT = (
    "Model      qwen3-vl-2b-instruct-cuda-gpu:2"
    " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
    "Frame      640x480 jpeg, fit to 640x480, from docs/fixtures/reference-frame.jpg\n"
    "Providers  0.500 s\n"
    "Load       1.250 s\n"
    "Capture    0.030 s\n"
    "Inference  2.500 s\n"
)

OBSERVATION = "A wooden desk with a laptop, a coffee mug and an open notebook.\n"


class FrozenClock:
    """A stand-in for ``datetime`` that always reports the same instant."""

    @staticmethod
    def now() -> FrozenClock:
        return FrozenClock()

    def strftime(self, fmt: str) -> str:
        return "fixed"


@dataclass
class Run:
    """One invocation of the command, and everything it was driven through."""

    code: int
    out: str
    err: str
    foundry: FakeFoundry
    model: FakeVisionModel


def run(
    argv: list[str],
    *,
    model: FakeVisionModel | None = None,
    camera: FakeCamera | None = None,
    readings: tuple[float, ...] = CACHED_READINGS,
    setup_lines: tuple[str, ...] = (),
    foundry: FakeFoundry | None = None,
) -> Run:
    """One invocation. The Foundry resolves the one model under every name unless a test
    hands one over that answers to particular names.
    """
    model = model if model is not None else FakeVisionModel(make_identity(), [make_observation()])
    camera = camera if camera is not None else FakeCamera([make_frame()])
    if foundry is None:
        foundry = FakeFoundry.resolving_everything_to(model, setup_lines=setup_lines)
    out, err = io.StringIO(), io.StringIO()
    code = main(
        argv, camera=camera, router=Router(foundry), clock=FakeClock(readings), out=out, err=err
    )
    return Run(code, out.getvalue(), err.getvalue(), foundry, model)


def write_image(path: Path, size: tuple[int, int], mode: str = "RGB") -> Path:
    Image.new(mode, size, color=(20, 120, 200)).save(path)
    return path


def run_on_file(path: Path) -> Run:
    """One invocation with no Camera injected, so the real image-file capture runs.

    Rescaling and encoding are the two things the spec asks be exercised for real rather
    than faked, and this is the seam that does it without reaching past the command.
    """
    model = FakeVisionModel(make_identity(), [make_observation()])
    foundry = FakeFoundry.resolving_everything_to(model)
    out, err = io.StringIO(), io.StringIO()
    code = main(
        ["--image", str(path)],
        router=Router(foundry),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
    )
    return Run(code, out.getvalue(), err.getvalue(), foundry, model)


def test_reports_the_observation_the_model_the_resolution_and_what_it_cost() -> None:
    result = run(["--image", "docs/fixtures/reference-frame.jpg"])

    assert result.code == 0
    assert result.err == ""
    assert result.out == f"{REPORT}\n{OBSERVATION}"


def test_names_the_working_resolution_even_when_the_frame_does_not_fill_it() -> None:
    camera = FakeCamera([make_frame(provenance="wide.jpg", width=640, height=360)])
    result = run(["--image", "wide.jpg"], camera=camera)

    assert "Frame      640x360 jpeg, fit to 640x480, from wide.jpg\n" in result.out


def test_rescales_the_long_edge_down_to_the_working_resolution(tmp_path: Path) -> None:
    source = write_image(tmp_path / "wide.png", (1920, 1080))

    result = run_on_file(source)

    assert result.code == 0
    assert f"Frame      640x360 jpeg, fit to 640x480, from {source}\n" in result.out


def test_rescales_a_tall_frame_on_its_long_edge_too(tmp_path: Path) -> None:
    result = run_on_file(write_image(tmp_path / "tall.png", (1000, 4000)))

    assert "Frame      120x480 jpeg" in result.out


def test_never_crops(tmp_path: Path) -> None:
    result = run_on_file(write_image(tmp_path / "square.png", (2000, 2000)))

    assert "Frame      480x480 jpeg" in result.out


def test_leaves_a_frame_already_at_the_working_resolution_alone(tmp_path: Path) -> None:
    result = run_on_file(write_image(tmp_path / "exact.png", WORKING_RESOLUTION))

    assert "Frame      640x480 jpeg" in result.out


def test_encodes_as_jpeg_whatever_went_in(tmp_path: Path) -> None:
    source = write_image(tmp_path / "transparent.png", (800, 600), mode="RGBA")

    result = run_on_file(source)

    observed = result.model.observed[0].frame
    with Image.open(io.BytesIO(observed.data)) as decoded:
        assert decoded.format == "JPEG"
        assert decoded.size == (640, 480)


def test_says_what_to_do_when_the_file_is_not_an_image(tmp_path: Path) -> None:
    source = tmp_path / "notes.txt"
    source.write_text("not an image")

    result = run_on_file(source)

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        f"error: {source} is not an image Pillow can read"
        " — pass a JPEG, PNG, BMP, GIF or WebP to --image\n"
    )


def test_reports_the_download_outside_the_three_latencies() -> None:
    model = FakeVisionModel(
        make_identity(),
        [make_observation()],
        is_cached=False,
        # Foundry Local calls back far more often than a screen can be redrawn, and its
        # last reading is not guaranteed to be exactly 100.
        download_progress=(0.0, 0.4, 50.0, 50.9, 99.98, 100.4),
    )
    result = run(
        ["--image", "docs/fixtures/reference-frame.jpg"],
        model=model,
        readings=(*SETUP_READINGS, 100.0, 142.0, *WORK_READINGS),
    )

    assert result.code == 0
    # The progress bar takes itself off when nothing is watching, so what is left to
    # assert is the one number that outlives the download.
    assert result.out == f"Downloaded in 42.000 s\n\n{REPORT}\n{OBSERVATION}"


def test_says_what_to_do_when_a_variant_will_not_load() -> None:
    model = FakeVisionModel(
        make_identity(
            variant="qwen3.5-0.8b-cuda-gpu:3",
            execution_provider="CUDAExecutionProvider",
            device_type="GPU",
        ),
        [make_observation()],
        load_error=RuntimeError("This is an invalid model. Error: Duplicate definition of name"),
    )
    result = run(["--image", "a.jpg"], model=model)

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: qwen3.5-0.8b-cuda-gpu:3 would not load on GPU / CUDAExecutionProvider"
        " — pin a different variant with --variant (run `foundry model list`;"
        " a -generic-cpu variant is the safe one)."
        " Foundry Local said: This is an invalid model."
        " Error: Duplicate definition of name\n"
    )


def test_labels_an_observation_cut_short_by_the_output_limit_as_truncated() -> None:
    model = FakeVisionModel(
        make_identity(),
        [
            make_observation(
                "A wooden desk with a laptop, a coffee mug and an", FinishReason.TRUNCATED
            )
        ],
    )
    result = run(["--image", "docs/fixtures/reference-frame.jpg"], model=model)

    assert result.code == 0
    assert result.out == (
        f"{REPORT}"
        "\n"
        "A wooden desk with a laptop, a coffee mug and an\n"
        "\n"
        "(truncated: the Observation hit the 128-token output limit)\n"
    )


def test_sends_one_workload_carrying_the_fixed_prompt_and_the_captured_frame() -> None:
    camera = FakeCamera([make_frame(provenance="a.jpg")])
    result = run(["--image", "a.jpg"], camera=camera)

    assert camera.captures == 1
    assert result.model.loaded
    (workload,) = result.model.observed
    assert workload.frame.provenance == "a.jpg"
    assert workload.prompt == "Describe what you see in this image in two or three sentences."


def test_asks_the_scene_question_it_was_given_instead_of_the_fixed_prompt() -> None:
    result = run(["--image", "a.jpg", "--ask", "is anyone looking at the camera?"])

    (workload,) = result.model.observed
    assert workload.prompt == "is anyone looking at the camera?"


def test_a_scene_question_changes_nothing_else_about_the_request() -> None:
    """The one thing --ask replaces is the prompt: same Frame, same limits, same report."""
    asked = run(["--image", "docs/fixtures/reference-frame.jpg", "--ask", "how many cups?"])

    assert asked.code == 0
    assert asked.err == ""
    assert asked.out == f"{REPORT}\n{OBSERVATION}"
    (workload,) = asked.model.observed
    assert workload.frame.provenance == "docs/fixtures/reference-frame.jpg"
    assert workload.max_output_tokens == 128
    assert workload.temperature == 0.0


def test_labels_an_answer_cut_short_by_the_output_limit_as_truncated() -> None:
    """A Scene Question's answer is an Observation, so it hits the same note."""
    model = FakeVisionModel(
        make_identity(),
        [make_observation("Two cups, and a third one behind the", FinishReason.TRUNCATED)],
    )
    result = run(
        ["--image", "docs/fixtures/reference-frame.jpg", "--ask", "how many cups are there?"],
        model=model,
    )

    assert result.code == 0
    assert result.out == (
        f"{REPORT}"
        "\n"
        "Two cups, and a third one behind the\n"
        "\n"
        "(truncated: the Observation hit the 128-token output limit)\n"
    )


def test_asks_a_scene_question_of_a_pinned_variant() -> None:
    result = run(
        [
            "--image",
            "a.jpg",
            "--variant",
            "qwen3-vl-2b-instruct-generic-cpu:2",
            "--ask",
            "is the whiteboard readable?",
        ]
    )

    assert result.code == 0
    assert result.foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu:2"]
    (workload,) = result.model.observed
    assert workload.prompt == "is the whiteboard readable?"


@pytest.mark.parametrize("question", ["", "   ", "\t\n"])
def test_refuses_an_empty_scene_question_before_anything_is_downloaded(question: str) -> None:
    """A shell-quoting mistake must never reach the model as nothing at all — and being
    told so after several gigabytes of weights is the failure this refusal exists to
    prevent, so it lands ahead of the download and of the Execution Providers alike.
    """
    model = FakeVisionModel(make_identity(), [make_observation()], is_cached=False)
    result = run(["--image", "a.jpg", "--ask", question], model=model)

    assert result.code == 1
    assert result.out == ""
    assert result.model.downloads == 0
    assert result.model.observed == []
    assert result.foundry.events == []
    assert result.err == (
        "error: --ask was given no question — pass one in quotes"
        ' (--ask "is anyone looking at the camera?"), or leave --ask off to have the'
        " Frame described\n"
    )


def test_fixes_the_generation_limits_on_the_workload_it_sends() -> None:
    """The limits an Observation was generated under travel with it, for the Benchmark."""
    result = run(["--image", "a.jpg"])

    (workload,) = result.model.observed
    assert workload.max_output_tokens == 128
    assert workload.temperature == 0.0


def test_resolves_the_model_by_alias_by_default() -> None:
    result = run(["--image", "a.jpg"])

    assert result.foundry.resolved == ["qwen3-vl-2b-instruct"]


def test_pins_a_variant_and_reports_the_one_that_answered() -> None:
    """Driven through a Foundry that has both Variants on it, as a Benchmark's will be:
    pinning one has to reach the one that was pinned and not the other.
    """
    cpu = FakeVisionModel(
        make_identity(
            variant="qwen3-vl-2b-instruct-generic-cpu:2",
            execution_provider="CPUExecutionProvider",
            device_type="CPU",
        ),
        [make_observation()],
    )
    gpu = FakeVisionModel(make_identity(), [make_observation()])
    result = run(
        ["--image", "a.jpg", "--variant", "qwen3-vl-2b-instruct-generic-cpu:2"],
        model=cpu,
        foundry=FakeFoundry(
            {"qwen3-vl-2b-instruct-generic-cpu:2": cpu, "qwen3-vl-2b-instruct": gpu}
        ),
    )

    assert gpu.observed == []

    assert result.foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu:2"]
    assert (
        "Model      qwen3-vl-2b-instruct-generic-cpu:2"
        " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    ) in result.out


def test_registers_the_execution_providers_before_loading_the_model() -> None:
    result = run(["--image", "a.jpg"])

    assert result.foundry.events == ["resolve", "register"]
    assert result.model.loaded


def test_says_which_execution_provider_could_not_be_registered() -> None:
    lines = ("Could not register NvTensorRtRtxExecutionProvider",)
    result = run(["--image", "a.jpg"], setup_lines=lines)

    assert result.code == 0
    assert result.out == (
        f"Could not register NvTensorRtRtxExecutionProvider\n\n{REPORT}\n{OBSERVATION}"
    )


def test_refuses_a_model_that_cannot_see_a_frame_before_anything_is_downloaded() -> None:
    # Not cached, which is the only case a model download could start in: discovering
    # after several gigabytes that the model was never a vision-language model is the
    # worst failure this command has. The Execution Providers are the other download —
    # a first run fetches those too — so the refusal has to land ahead of both.
    model = FakeVisionModel(
        make_identity(task="chat", variant="qwen3.5-2b-text-generic-cpu:2"),
        [make_observation()],
        is_cached=False,
    )
    result = run(["--image", "a.jpg"], model=model)

    assert result.model.downloads == 0
    assert result.foundry.events == ["resolve"]
    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: qwen3.5-2b-text-generic-cpu:2 has task 'chat', not 'vision-language-chat',"
        " so it cannot see a Frame — pick a model whose task is vision-language-chat"
        " (run `foundry model list`)\n"
    )


def test_says_a_model_declaring_no_task_is_the_catalogues_gap_not_the_commands() -> None:
    # Foundry Local's own catalogue is what is incomplete here: `foundry model list` on
    # 0.8.119 already fails to process nine entries (docs/stack.md). Saying so keeps an
    # Operator from reading the refusal as a fault of this command.
    model = FakeVisionModel(
        make_identity(task=None, variant="gemma-4-e2b-it-generic-cpu:1"),
        [make_observation()],
        is_cached=False,
    )
    result = run(["--image", "a.jpg"], model=model)

    assert result.model.downloads == 0
    assert result.foundry.events == ["resolve"]
    assert result.code == 1
    assert result.err == (
        "error: gemma-4-e2b-it-generic-cpu:1 declares no task in the Foundry Local"
        " catalogue, so nothing says whether it can see a Frame — the incomplete entry"
        " is Foundry Local's, not this command's; pick a model that declares"
        " vision-language-chat (run `foundry model list`)\n"
    )


def test_reports_a_missing_image_in_one_line_and_exits_non_zero(tmp_path: Path) -> None:
    missing = tmp_path / "nope.jpg"
    out, err = io.StringIO(), io.StringIO()
    code = main(
        ["--image", str(missing)],
        router=Router(
            FakeFoundry.resolving_everything_to(
                FakeVisionModel(make_identity(), [make_observation()])
            )
        ),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
    )

    assert code == 1
    assert out.getvalue() == ""
    assert err.getvalue() == (
        f"error: there is no image at {missing} — pass a path that exists to --image\n"
    )


def test_debug_restores_the_traceback() -> None:
    model = FakeVisionModel(make_identity(task="chat"), [make_observation()])
    with pytest.raises(Exception, match="cannot see a Frame"):
        run(["--image", "a.jpg", "--debug"], model=model)


def test_structured_lists_the_objects_present_under_the_unchanged_facts_block() -> None:
    """--structured answers with the objects present, aligned, below the same facts block."""
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[
            make_structured_observation(
                ObjectsPresent(
                    (
                        PresentObject("cup", 2, Where.ZONE),
                        PresentObject("laptop", 1, Where.ZONE),
                    )
                )
            )
        ],
    )
    result = run(["--image", "docs/fixtures/reference-frame.jpg", "--structured"], model=model)

    assert result.code == 0
    assert result.err == ""
    assert result.out == f"{REPORT}\n2  cup  (zone)\n1  laptop  (zone)\n"
    assert result.model.observed == []


def test_structured_right_aligns_the_counts_into_a_column() -> None:
    """The list is aligned: a two-digit count does not push its name out of line."""
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[
            make_structured_observation(
                ObjectsPresent(
                    (
                        PresentObject("book", 12, Where.TRAY),
                        PresentObject("lamp", 1, Where.ELSEWHERE),
                    )
                )
            )
        ],
    )
    result = run(["--image", "a.jpg", "--structured"], model=model)

    assert result.out == f"{REPORT}\n12  book  (tray)\n 1  lamp  (elsewhere)\n"


def test_structured_renders_an_empty_list_as_nothing_present() -> None:
    """An empty list is a success, not an error — the model saying nothing is present."""
    model = FakeVisionModel(
        make_identity(), [], structured=[make_structured_observation(ObjectsPresent(()))]
    )
    result = run(["--image", "a.jpg", "--structured"], model=model)

    assert result.code == 0
    assert result.err == ""
    assert result.out == f"{REPORT}\nnothing present\n"


def test_structured_renders_a_no_shape_outcome_as_its_reason_without_raising() -> None:
    """A model that returns no well-formed shape is an ordinary outcome, not a crash."""
    reason = "the model answered in prose instead of the list of objects the shape asks for"
    model = FakeVisionModel(
        make_identity(), [], structured=[make_structured_observation(NoShape(reason))]
    )
    result = run(["--image", "a.jpg", "--structured"], model=model)

    assert result.code == 0
    assert result.err == ""
    assert result.out == f"{REPORT}\n{reason}\n"


def test_structured_notes_a_list_cut_short_by_the_output_limit() -> None:
    """A parseable list can still be truncated; it is flagged, as the prose path flags one."""
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[
            make_structured_observation(
                ObjectsPresent((PresentObject("cup", 2, Where.ZONE),)), FinishReason.TRUNCATED
            )
        ],
    )
    result = run(["--image", "a.jpg", "--structured"], model=model)

    assert result.code == 0
    assert result.out == (
        f"{REPORT}"
        "\n"
        "2  cup  (zone)\n"
        "\n"
        "(truncated: the list may be incomplete — the Observation hit the 256-token output limit)\n"
    )


def test_structured_does_not_flag_an_empty_list_as_maybe_incomplete() -> None:
    """ "Nothing present" under truncation still means nothing present — the "may be incomplete"
    note would contradict it, so it is not shown for an empty list."""
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[make_structured_observation(ObjectsPresent(()), FinishReason.TRUNCATED)],
    )
    result = run(["--image", "a.jpg", "--structured"], model=model)

    assert result.code == 0
    assert result.out == f"{REPORT}\nnothing present\n"


def test_structured_overrides_ask_and_sends_the_fixed_shape() -> None:
    """Passing both --structured and --ask uses the fixed shape, not the question."""
    model = FakeVisionModel(
        make_identity(), [make_observation()], structured=[make_structured_observation()]
    )
    result = run(
        ["--image", "a.jpg", "--structured", "--ask", "how many cups are there?"], model=model
    )

    assert result.code == 0
    assert result.model.observed == []
    (workload,) = result.model.observed_structured
    assert workload.prompt == STRUCTURED_PROMPT


def test_structured_does_not_refuse_an_empty_ask_beside_it() -> None:
    """--ask "" is a mistake on its own, but --structured ignores --ask entirely."""
    model = FakeVisionModel(
        make_identity(), [], structured=[make_structured_observation(ObjectsPresent(()))]
    )
    result = run(["--image", "a.jpg", "--structured", "--ask", ""], model=model)

    assert result.code == 0
    assert result.out == f"{REPORT}\nnothing present\n"


def test_without_structured_the_prose_observation_is_unchanged() -> None:
    """The flag is opt-in: leaving it off reaches the prose path exactly as before."""
    model = FakeVisionModel(make_identity(), [make_observation()], structured=[])
    result = run(["--image", "docs/fixtures/reference-frame.jpg"], model=model)

    assert result.code == 0
    assert result.out == f"{REPORT}\n{OBSERVATION}"
    assert result.model.observed_structured == []


@dataclass
class LiveRun:
    """One invocation driven through a fake Feed rather than a fake Camera."""

    code: int
    out: str
    err: str
    cameras: FakeCameras
    model: FakeVisionModel


def run_live(
    argv: list[str],
    frames_dir: Path,
    *,
    feeds: dict[int, FakeFeed] | None = None,
) -> LiveRun:
    feeds = feeds if feeds is not None else {0: settling_feed()}
    cameras = FakeCameras(feeds)
    model = FakeVisionModel(make_identity(), [make_observation()])
    out, err = io.StringIO(), io.StringIO()
    code = main(
        argv,
        open_feed=cameras,
        router=Router(FakeFoundry.resolving_everything_to(model)),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
        frames_dir=frames_dir,
    )
    return LiveRun(code, out.getvalue(), err.getvalue(), cameras, model)


def test_takes_a_frame_from_the_camera_when_no_image_is_given(tmp_path: Path) -> None:
    result = run_live([], tmp_path)

    assert result.code == 0
    assert result.err == ""
    assert result.cameras.opened == [0]
    assert "Frame      640x480 jpeg, fit to 640x480, from camera 0\n" in result.out


def test_selects_the_camera(tmp_path: Path) -> None:
    result = run_live(["--camera", "2"], tmp_path, feeds={2: settling_feed()})

    assert result.code == 0
    assert result.cameras.opened == [2]
    assert "from camera 2\n" in result.out


def test_discards_the_settling_frames_and_observes_the_next_one(tmp_path: Path) -> None:
    feed = settling_feed()

    result = run_live([], tmp_path, feeds={0: feed})

    assert feed.reads == SETTLING_FRAMES + 1
    observed = result.model.observed[0].frame
    assert colour_of(observed.data) == SETTLED_COLOUR


def test_counts_the_settling_discards_inside_the_reported_capture_time(tmp_path: Path) -> None:
    result = run_live([], tmp_path)

    assert (
        f"Capture    0.030 s (including {SETTLING_FRAMES} Frames discarded"
        " while the Feed settled)\n"
    ) in result.out


def test_keeps_the_camera_frame_and_says_where_when_asked_to(tmp_path: Path) -> None:
    result = run_live(["--keep-frames"], tmp_path)

    (saved,) = sorted(tmp_path.glob("*.jpg"))
    assert f"Saved      {saved}\n" in result.out
    observed = result.model.observed[0].frame
    assert saved.read_bytes() == observed.data


@pytest.mark.parametrize("flags", [[], ["--debug"]])
def test_keeps_no_camera_frame_and_prints_no_saved_line_unless_asked_to(
    tmp_path: Path, flags: list[str]
) -> None:
    """The default leaves no images of the Operator's room behind, and --debug — which is
    a different choice — does not quietly opt in to keeping them.
    """
    result = run_live(flags, tmp_path)

    assert result.code == 0
    assert list(tmp_path.glob("*.jpg")) == []
    assert "Saved" not in result.out


def test_keeping_frames_does_not_restore_the_traceback(tmp_path: Path) -> None:
    """The other direction of the same separation, on the failure --debug is about."""
    result = run_live(["--keep-frames"], tmp_path, feeds={})

    assert result.code == 1
    assert "there is no camera at index 0" in result.err


@pytest.mark.parametrize("flags", [[], ["--keep-frames"]])
def test_does_not_keep_a_frame_that_came_from_an_image_file(
    tmp_path: Path, flags: list[str]
) -> None:
    out, err = io.StringIO(), io.StringIO()
    main(
        [*flags, "--image", "a.jpg"],
        camera=FakeCamera([make_frame()]),
        router=Router(
            FakeFoundry.resolving_everything_to(
                FakeVisionModel(make_identity(), [make_observation()])
            )
        ),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
        frames_dir=tmp_path,
    )

    assert list(tmp_path.glob("*.jpg")) == []
    assert "Saved" not in out.getvalue()


def test_points_at_an_image_file_when_no_camera_is_attached(tmp_path: Path) -> None:
    result = run_live([], tmp_path, feeds={})

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: there is no camera at index 0 — attach one, select another with"
        " --camera N, or observe an image file with --image <path>\n"
    )


def test_says_what_to_do_when_another_application_is_holding_the_camera(tmp_path: Path) -> None:
    result = run_live([], tmp_path, feeds={0: FakeFeed([], gives_nothing=True)})

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: camera 0 opened but gave no Frame — another application is holding it;"
        " close that application, or observe an image file with --image <path>\n"
    )


def test_releases_the_camera_it_opened(tmp_path: Path) -> None:
    """A Feed left open holds the camera against every other application."""
    feed = settling_feed()

    run_live([], tmp_path, feeds={0: feed})

    assert feed.closed


def test_releases_the_camera_even_when_another_application_is_holding_it(tmp_path: Path) -> None:
    feed = FakeFeed([], gives_nothing=True)

    run_live([], tmp_path, feeds={0: feed})

    assert feed.closed


def test_keeps_every_camera_frame_in_its_own_file(tmp_path: Path) -> None:
    run_live(["--keep-frames"], tmp_path)
    run_live(["--keep-frames"], tmp_path)

    first, second = sorted(tmp_path.glob("*.jpg"))
    assert first.read_bytes() == second.read_bytes()


def test_keeps_both_frames_when_the_clock_hands_out_the_same_stamp(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The Windows clock is coarse enough that this is the ordinary case, not a corner."""
    monkeypatch.setattr(vision.capture, "datetime", FrozenClock)

    run_live(["--keep-frames"], tmp_path)
    run_live(["--keep-frames"], tmp_path)

    names = {path.name for path in tmp_path.glob("*.jpg")}
    assert names == {"frame-fixed.jpg", "frame-fixed-1.jpg"}


def test_refuses_an_image_file_and_a_camera_at_once(tmp_path: Path) -> None:
    with pytest.raises(SystemExit):
        run_live(["--image", "a.jpg", "--camera", "1"], tmp_path)


def test_asks_a_scene_question_of_a_camera_frame_it_also_keeps(tmp_path: Path) -> None:
    result = run_live(["--keep-frames", "--ask", "is anyone looking at the camera?"], tmp_path)

    assert result.code == 0
    (saved,) = sorted(tmp_path.glob("*.jpg"))
    assert f"Saved      {saved}\n" in result.out
    (workload,) = result.model.observed
    assert workload.prompt == "is anyone looking at the camera?"
    assert saved.read_bytes() == workload.frame.data


# --- The second Runtime: an OpenVINO Variant reaches observe behind the unchanged port ---
#
# observe holds a router over both Runtimes, so naming an OpenVINO Variant reaches OpenVINO
# with no change to the command: the FakeOpenVINO claims the slug, and the FakeFoundry beside
# it is never touched — which is how these pin that an OpenVINO-only observe registers no
# Execution Providers (ADR-0013).

OV_SLUG = "qwen3-vl-2b-instruct-int4-sym-npu"


def observe_openvino(
    argv: list[str],
    *,
    model: FakeVisionModel,
    camera: FakeCamera | None = None,
    frames_dir: Path | None = None,
) -> tuple[int, str, str, FakeFoundry]:
    """Drive observe with an OpenVINO Variant named, over a router that also holds Foundry Local."""
    foundry = FakeFoundry({})
    openvino = FakeOpenVINO({OV_SLUG: model})
    out, err = io.StringIO(), io.StringIO()
    code = main(
        [*argv, "--variant", OV_SLUG],
        camera=camera if camera is not None else FakeCamera([make_frame()]),
        router=Router(foundry, openvino),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
        frames_dir=frames_dir,
    )
    return code, out.getvalue(), err.getvalue(), foundry


def test_observes_off_an_openvino_variant_and_registers_no_execution_providers() -> None:
    model = FakeVisionModel(make_provenance_identity(), [make_observation()])

    code, out, err, foundry = observe_openvino(
        ["--image", "docs/fixtures/reference-frame.jpg"], model=model
    )

    assert code == 0
    assert err == ""
    # The Model line reads the provenance identity — the slug, no Alias, the device it ran on.
    assert f"Model      {OV_SLUG} (NPU)\n" in out
    assert OBSERVATION in out
    # Foundry Local was never resolved and never asked to register: an OpenVINO-only sitting.
    assert foundry.events == []


def test_structured_observation_crosses_the_second_runtime() -> None:
    model = FakeVisionModel(
        make_provenance_identity(),
        [],
        structured=[
            make_structured_observation(ObjectsPresent((PresentObject("cup", 2, Where.ZONE),)))
        ],
    )

    code, out, err, foundry = observe_openvino(
        ["--image", "docs/fixtures/reference-frame.jpg", "--structured"], model=model
    )

    assert code == 0
    assert f"Model      {OV_SLUG} (NPU)\n" in out
    assert "2  cup  (zone)\n" in out
    (workload,) = model.observed_structured
    assert workload.prompt == STRUCTURED_PROMPT
    assert foundry.events == []


def test_keep_frames_works_across_the_second_runtime(tmp_path: Path) -> None:
    model = FakeVisionModel(make_provenance_identity(), [make_observation()])

    code, out, err, _ = observe_openvino(
        ["--keep-frames"], model=model, camera=FakeCamera([make_frame()]), frames_dir=tmp_path
    )

    assert code == 0
    (saved,) = sorted(tmp_path.glob("*.jpg"))
    assert f"Saved      {saved}\n" in out
    assert saved.read_bytes() == model.observed[0].frame.data


def test_never_crashes_printing_an_observation_to_a_non_utf8_console(tmp_path: Path) -> None:
    """The regression issue #69 exists for: a model's emoji and em dashes must not crash
    a run whose ``stdout`` is a redirected Windows console — ``cp1252`` by default rather
    than UTF-8. Driven with a real ``TextIOWrapper`` over a buffer opened as ``cp1252``,
    which is what a redirected console gives a process, rather than the ``io.StringIO``
    the rest of this module uses: only a stream with a real encoding can prove the bytes
    it received were replaced instead of raising ``UnicodeEncodeError``.
    """
    model = FakeVisionModel(
        make_identity(), [make_observation(text="✅ done — nothing else in frame")]
    )
    camera = FakeCamera([make_frame()])
    foundry = FakeFoundry.resolving_everything_to(model)
    out_buffer = io.BytesIO()
    out = io.TextIOWrapper(out_buffer, encoding="cp1252", errors="strict")
    err = io.StringIO()

    code = main(
        [],
        camera=camera,
        router=Router(foundry),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
    )
    out.flush()

    assert code == 0
    # Reconfigured to UTF-8, so the emoji and the em dash round-trip whole rather than
    # being replaced — replacement only has to cover what UTF-8 itself cannot carry.
    written = out_buffer.getvalue().decode("utf-8")
    assert "✅ done — nothing else in frame" in written
