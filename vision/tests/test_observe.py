"""End-to-end tests for the ``observe`` command, driven through its three ports."""

from __future__ import annotations

import io
from pathlib import Path

import pytest

from tests.fakes import (
    FakeCamera,
    FakeClock,
    FakeFoundry,
    FakeVisionModel,
    completion,
    frame,
    identity,
)
from vision.cli import main
from vision.inference import FinishReason

CACHED_READINGS = (0.0, 1.25, 10.0, 10.03, 20.0, 22.5)


def run(
    argv: list[str],
    *,
    model: FakeVisionModel | None = None,
    camera: FakeCamera | None = None,
    readings: tuple[float, ...] = CACHED_READINGS,
) -> tuple[int, str, str]:
    out, err = io.StringIO(), io.StringIO()
    code = main(
        argv,
        camera=camera if camera is not None else FakeCamera([frame()]),
        foundry=FakeFoundry(
            model if model is not None else FakeVisionModel(identity(), completion())
        ),
        clock=FakeClock(readings),
        out=out,
        err=err,
    )
    return code, out.getvalue(), err.getvalue()


def test_reports_the_observation_the_model_the_resolution_and_three_latencies() -> None:
    code, out, err = run(["--image", "docs/fixtures/reference-frame.jpg"])

    assert code == 0
    assert err == ""
    assert out == (
        "Model      qwen3-vl-2b-instruct-cuda-gpu"
        " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
        "Frame      640x480 jpeg from docs/fixtures/reference-frame.jpg\n"
        "Load       1.250 s\n"
        "Capture    0.030 s\n"
        "Inference  2.500 s\n"
        "\n"
        "A wooden desk with a laptop, a coffee mug and an open notebook.\n"
    )


def test_reports_the_download_outside_the_three_latencies() -> None:
    model = FakeVisionModel(
        identity(),
        completion(),
        is_cached=False,
        download_progress=(0.0, 0.4, 50.0, 50.9, 100.0),
    )
    code, out, _ = run(
        ["--image", "frame.jpg"],
        model=model,
        readings=(100.0, 142.0, *CACHED_READINGS),
    )

    assert code == 0
    assert out.startswith(
        "Downloading qwen3-vl-2b-instruct-cuda-gpu   0%\n"
        "Downloading qwen3-vl-2b-instruct-cuda-gpu  50%\n"
        "Downloading qwen3-vl-2b-instruct-cuda-gpu 100%\n"
        "Downloaded in 42.000 s\n"
        "\n"
        "Model      qwen3-vl-2b-instruct-cuda-gpu"
    )
    assert "Load       1.250 s\n" in out


def test_labels_an_observation_cut_short_by_the_output_limit_as_truncated() -> None:
    model = FakeVisionModel(
        identity(),
        completion("A wooden desk with a laptop, a coffee mug and an", FinishReason.TRUNCATED),
    )
    code, out, _ = run(["--image", "frame.jpg"], model=model)

    assert code == 0
    assert out.endswith(
        "A wooden desk with a laptop, a coffee mug and an\n"
        "\n"
        "(truncated: the Observation hit the 128-token output limit)\n"
    )


def test_sends_the_fixed_prompt_and_the_captured_frame_to_the_model() -> None:
    model = FakeVisionModel(identity(), completion())
    camera = FakeCamera([frame(provenance="a.jpg")])
    run(["--image", "a.jpg"], model=model, camera=camera)

    assert camera.captures == 1
    assert model.loaded
    (observed_frame, prompt) = model.observed[0]
    assert observed_frame.provenance == "a.jpg"
    assert prompt == "Describe what you see in this image in two or three sentences."


def test_resolves_the_model_by_alias_by_default() -> None:
    foundry = FakeFoundry(FakeVisionModel(identity(), completion()))
    main(
        ["--image", "a.jpg"],
        camera=FakeCamera([frame()]),
        foundry=foundry,
        clock=FakeClock(CACHED_READINGS),
        out=io.StringIO(),
        err=io.StringIO(),
    )

    assert foundry.resolved == ["qwen3-vl-2b-instruct"]


def test_pins_a_variant_when_one_is_named() -> None:
    foundry = FakeFoundry(FakeVisionModel(identity(), completion()))
    main(
        ["--image", "a.jpg", "--model", "qwen3-vl-2b-instruct-generic-cpu"],
        camera=FakeCamera([frame()]),
        foundry=foundry,
        clock=FakeClock(CACHED_READINGS),
        out=io.StringIO(),
        err=io.StringIO(),
    )

    assert foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu"]


def test_refuses_a_model_that_cannot_see_a_frame() -> None:
    model = FakeVisionModel(
        identity(task="chat", variant="qwen3.5-2b-text-generic-cpu"), completion()
    )
    code, out, err = run(["--image", "a.jpg"], model=model)

    assert code == 1
    assert out == ""
    assert err == (
        "error: qwen3.5-2b-text-generic-cpu has task 'chat', not 'vision-language-chat',"
        " so it cannot see a Frame — pick a model whose task is vision-language-chat"
        " (run `foundry model list`)\n"
    )


def test_reports_a_missing_image_in_one_line_and_exits_non_zero(tmp_path: Path) -> None:
    missing = tmp_path / "nope.jpg"
    out, err = io.StringIO(), io.StringIO()
    code = main(
        ["--image", str(missing)],
        foundry=FakeFoundry(FakeVisionModel(identity(), completion())),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
    )

    assert code == 1
    assert (
        err.getvalue()
        == f"error: there is no image at {missing} — pass a path that exists to --image\n"
    )


def test_debug_restores_the_traceback() -> None:
    model = FakeVisionModel(identity(task="chat"), completion())
    with pytest.raises(Exception, match="cannot see a Frame"):
        run(["--image", "a.jpg", "--debug"], model=model)


def test_an_image_is_required_while_the_feed_does_not_exist_yet() -> None:
    out, err = io.StringIO(), io.StringIO()
    code = main(
        [],
        foundry=FakeFoundry(FakeVisionModel(identity(), completion())),
        clock=FakeClock(CACHED_READINGS),
        out=out,
        err=err,
    )

    assert code == 1
    assert err.getvalue() == (
        "error: --image is required — capturing from a live camera Feed is not built yet\n"
    )
