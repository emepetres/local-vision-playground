"""End-to-end tests for the ``observe`` command, driven through the ports it is given."""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import pytest

from tests.fakes import (
    SETTLED_COLOUR,
    FakeCamera,
    FakeCameras,
    FakeClock,
    FakeFeed,
    FakeFoundry,
    FakeVisionModel,
    colour_of,
    make_frame,
    make_identity,
    make_observation,
    settling_feed,
)
from vision.capture import SETTLING_FRAMES
from vision.cli import main
from vision.inference import FinishReason

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


@dataclass
class Run:
    """One invocation of the command, and everything it was driven through."""

    code: int
    out: str
    err: str
    camera: FakeCamera
    foundry: FakeFoundry
    model: FakeVisionModel


def run(
    argv: list[str],
    *,
    model: FakeVisionModel | None = None,
    camera: FakeCamera | None = None,
    readings: tuple[float, ...] = CACHED_READINGS,
    setup_lines: tuple[str, ...] = (),
) -> Run:
    model = model if model is not None else FakeVisionModel(make_identity(), make_observation())
    camera = camera if camera is not None else FakeCamera([make_frame()])
    foundry = FakeFoundry(model, setup_lines=setup_lines)
    out, err = io.StringIO(), io.StringIO()
    code = main(argv, camera=camera, foundry=foundry, clock=FakeClock(readings), out=out, err=err)
    return Run(code, out.getvalue(), err.getvalue(), camera, foundry, model)


def test_reports_the_observation_the_model_the_resolution_and_what_it_cost() -> None:
    result = run(["--image", "docs/fixtures/reference-frame.jpg"])

    assert result.code == 0
    assert result.err == ""
    assert result.out == f"{REPORT}\n{OBSERVATION}"


def test_names_the_working_resolution_even_when_the_frame_does_not_fill_it() -> None:
    camera = FakeCamera([make_frame(provenance="wide.jpg", width=640, height=360)])
    result = run(["--image", "wide.jpg"], camera=camera)

    assert "Frame      640x360 jpeg, fit to 640x480, from wide.jpg\n" in result.out


def test_reports_the_download_outside_the_three_latencies() -> None:
    model = FakeVisionModel(
        make_identity(),
        make_observation(),
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
        make_identity(variant="qwen3.5-0.8b-cuda-gpu:3", runtime="GPU / CUDAExecutionProvider"),
        make_observation(),
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
        make_observation(
            "A wooden desk with a laptop, a coffee mug and an", FinishReason.TRUNCATED
        ),
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


def test_sends_the_fixed_prompt_and_the_captured_frame_to_the_model() -> None:
    result = run(["--image", "a.jpg"], camera=FakeCamera([make_frame(provenance="a.jpg")]))

    assert result.camera.captures == 1
    assert result.model.loaded
    (observed_frame, prompt) = result.model.observed[0]
    assert observed_frame.provenance == "a.jpg"
    assert prompt == "Describe what you see in this image in two or three sentences."


def test_resolves_the_model_by_alias_by_default() -> None:
    result = run(["--image", "a.jpg"])

    assert result.foundry.resolved == ["qwen3-vl-2b-instruct"]


def test_pins_a_variant_and_reports_the_one_that_answered() -> None:
    model = FakeVisionModel(
        make_identity(
            variant="qwen3-vl-2b-instruct-generic-cpu:2", runtime="CPU / CPUExecutionProvider"
        ),
        make_observation(),
    )
    result = run(
        ["--image", "a.jpg", "--variant", "qwen3-vl-2b-instruct-generic-cpu:2"], model=model
    )

    assert result.foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu:2"]
    assert (
        "Model      qwen3-vl-2b-instruct-generic-cpu:2"
        " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    ) in result.out


def test_registers_the_execution_providers_before_resolving_a_model() -> None:
    result = run(["--image", "a.jpg"])

    assert result.foundry.events == ["register", "resolve"]


def test_says_which_execution_provider_could_not_be_registered() -> None:
    lines = ("Could not register NvTensorRtRtxExecutionProvider",)
    result = run(["--image", "a.jpg"], setup_lines=lines)

    assert result.code == 0
    assert result.out == (
        f"Could not register NvTensorRtRtxExecutionProvider\n\n{REPORT}\n{OBSERVATION}"
    )


def test_refuses_a_model_that_cannot_see_a_frame_before_the_download_starts() -> None:
    # Not cached, which is the only case a download could start in: discovering after
    # several gigabytes that the model was never a vision-language model is the worst
    # failure this command has.
    model = FakeVisionModel(
        make_identity(task="chat", variant="qwen3.5-2b-text-generic-cpu:2"),
        make_observation(),
        is_cached=False,
    )
    result = run(["--image", "a.jpg"], model=model)

    assert result.model.downloads == 0
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
        make_observation(),
        is_cached=False,
    )
    result = run(["--image", "a.jpg"], model=model)

    assert result.model.downloads == 0
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
        foundry=FakeFoundry(FakeVisionModel(make_identity(), make_observation())),
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
    model = FakeVisionModel(make_identity(task="chat"), make_observation())
    with pytest.raises(Exception, match="cannot see a Frame"):
        run(["--image", "a.jpg", "--debug"], model=model)


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
    model = FakeVisionModel(make_identity(), make_observation())
    out, err = io.StringIO(), io.StringIO()
    code = main(
        argv,
        open_feed=cameras,
        foundry=FakeFoundry(model),
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
    (observed, _) = result.model.observed[0]
    assert colour_of(observed.data) == SETTLED_COLOUR


def test_counts_the_settling_discards_inside_the_reported_capture_time(tmp_path: Path) -> None:
    result = run_live([], tmp_path)

    assert (
        f"Capture    0.030 s (including {SETTLING_FRAMES} Frames discarded"
        " while the Feed settled)\n"
    ) in result.out


def test_keeps_the_camera_frame_and_says_where(tmp_path: Path) -> None:
    result = run_live([], tmp_path)

    (saved,) = sorted(tmp_path.glob("*.jpg"))
    assert f"Saved      {saved}\n" in result.out
    (observed, _) = result.model.observed[0]
    assert saved.read_bytes() == observed.data


def test_does_not_keep_a_frame_that_came_from_an_image_file(tmp_path: Path) -> None:
    out, err = io.StringIO(), io.StringIO()
    main(
        ["--image", "a.jpg"],
        camera=FakeCamera([make_frame()]),
        foundry=FakeFoundry(FakeVisionModel(make_identity(), make_observation())),
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


def test_refuses_an_image_file_and_a_camera_at_once(tmp_path: Path) -> None:
    with pytest.raises(SystemExit):
        run_live(["--image", "a.jpg", "--camera", "1"], tmp_path)
