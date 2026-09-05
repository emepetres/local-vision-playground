"""End-to-end tests for the ``observe`` command, driven through its three ports."""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import pytest

from tests.fakes import (
    FakeCamera,
    FakeClock,
    FakeFoundry,
    FakeVisionModel,
    make_frame,
    make_identity,
    make_observation,
)
from vision.cli import main
from vision.inference import FinishReason

CACHED_READINGS = (0.0, 1.25, 10.0, 10.03, 20.0, 22.5)
"""Load 1.250 s, capture 0.030 s, inference 2.500 s, with no download in front of them."""

REPORT = (
    "Model      qwen3-vl-2b-instruct-cuda-gpu"
    " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
    "Frame      640x480 jpeg, fit to 640x480, from docs/fixtures/reference-frame.jpg\n"
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
) -> Run:
    model = model if model is not None else FakeVisionModel(make_identity(), make_observation())
    camera = camera if camera is not None else FakeCamera([make_frame()])
    foundry = FakeFoundry(model)
    out, err = io.StringIO(), io.StringIO()
    code = main(argv, camera=camera, foundry=foundry, clock=FakeClock(readings), out=out, err=err)
    return Run(code, out.getvalue(), err.getvalue(), camera, foundry, model)


def test_reports_the_observation_the_model_the_resolution_and_three_latencies() -> None:
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
        # Foundry Local calls back far more often than once per percent.
        download_progress=(0.0, 0.4, 50.0, 50.9, 100.0),
    )
    result = run(
        ["--image", "docs/fixtures/reference-frame.jpg"],
        model=model,
        readings=(100.0, 142.0, *CACHED_READINGS),
    )

    assert result.code == 0
    assert result.out == (
        "Downloading qwen3-vl-2b-instruct-cuda-gpu   0%\n"
        "Downloading qwen3-vl-2b-instruct-cuda-gpu  50%\n"
        "Downloading qwen3-vl-2b-instruct-cuda-gpu 100%\n"
        "Downloaded in 42.000 s\n"
        "\n"
        f"{REPORT}\n{OBSERVATION}"
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


def test_pins_a_variant_when_one_is_named() -> None:
    result = run(["--image", "a.jpg", "--model", "qwen3-vl-2b-instruct-generic-cpu:2"])

    assert result.foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu:2"]


def test_refuses_a_model_that_cannot_see_a_frame() -> None:
    model = FakeVisionModel(
        make_identity(task="chat", variant="qwen3.5-2b-text-generic-cpu:2"),
        make_observation(),
    )
    result = run(["--image", "a.jpg"], model=model)

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: qwen3.5-2b-text-generic-cpu:2 has task 'chat', not 'vision-language-chat',"
        " so it cannot see a Frame — pick a model whose task is vision-language-chat"
        " (run `foundry model list`)\n"
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


def test_an_image_is_required_while_the_feed_does_not_exist_yet() -> None:
    out, err = io.StringIO(), io.StringIO()
    code = main(
        [],
        foundry=FakeFoundry(FakeVisionModel(make_identity(), make_observation())),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
    )

    assert code == 1
    assert out.getvalue() == ""
    assert err.getvalue() == (
        "error: --image is required — capturing from a live camera Feed is not built yet\n"
    )
