"""Fakes for the three ports the ``observe`` command is given.

They encode our reading of the Foundry Local 2.x type signatures — see ADR-0004. They do
not prove the SDK behaves this way; only running against the real model does that. What
they do prove, through the assignments at the bottom of this module, is that they still
satisfy the ports the command declares.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable, Sequence

from vision.capture import Camera, Frame
from vision.errors import VisionError
from vision.inference import (
    FinishReason,
    FoundryLocal,
    ModelIdentity,
    RawObservation,
    VisionModel,
)


class FakeCamera:
    """Yields a prepared sequence of Frames, one per capture."""

    def __init__(self, frames: Iterable[Frame]) -> None:
        self._frames = list(frames)
        self.captures = 0

    def capture(self) -> Frame:
        if self.captures >= len(self._frames):
            raise VisionError("the fake camera has no Frames left")
        frame = self._frames[self.captures]
        self.captures += 1
        return frame


class FakeVisionModel:
    """A model whose task, runtime and Observation are all declared up front."""

    def __init__(
        self,
        identity: ModelIdentity,
        observation: RawObservation,
        *,
        is_cached: bool = True,
        download_progress: Sequence[float] = (),
    ) -> None:
        self.identity = identity
        self.is_cached = is_cached
        self._observation = observation
        self._download_progress = tuple(download_progress)
        self.loaded = False
        self.observed: list[tuple[Frame, str]] = []

    def download(self, on_progress: Callable[[float], None]) -> None:
        for percent in self._download_progress:
            on_progress(percent)

    def load(self) -> None:
        self.loaded = True

    def observe(self, frame: Frame, prompt: str) -> RawObservation:
        self.observed.append((frame, prompt))
        return self._observation


class FakeFoundry:
    """Resolves every name to the one model it was given."""

    def __init__(self, model: FakeVisionModel) -> None:
        self.model = model
        self.resolved: list[str] = []

    def resolve(self, name: str) -> FakeVisionModel:
        self.resolved.append(name)
        return self.model


class FakeClock:
    """Hands out a prepared sequence of readings, so every latency is deterministic."""

    def __init__(self, readings: Iterable[float]) -> None:
        self._readings = list(readings)
        self._next = 0

    def __call__(self) -> float:
        if self._next >= len(self._readings):
            raise AssertionError("the command read the clock more times than the test prepared")
        reading = self._readings[self._next]
        self._next += 1
        return reading


def make_identity(
    *,
    alias: str = "qwen3-vl-2b-instruct",
    variant: str = "qwen3-vl-2b-instruct-cuda-gpu",
    task: str = "vision-language-chat",
    runtime: str | None = "GPU / NvTensorRtRtxExecutionProvider",
) -> ModelIdentity:
    return ModelIdentity(alias=alias, variant=variant, task=task, runtime=runtime)


def make_observation(
    text: str = "A wooden desk with a laptop, a coffee mug and an open notebook.",
    finish_reason: FinishReason = FinishReason.COMPLETE,
) -> RawObservation:
    return RawObservation(text=text, finish_reason=finish_reason)


def make_frame(
    *,
    provenance: str = "docs/fixtures/reference-frame.jpg",
    width: int = 640,
    height: int = 480,
) -> Frame:
    return Frame(
        data=b"\xff\xd8\xff\xdb-not-a-real-jpeg",
        codec="jpeg",
        provenance=provenance,
        width=width,
        height=height,
    )


# Each fake really does satisfy the port it stands in for. mypy checks these; a port that
# grows a member without its fake growing one fails here rather than at some later run.
_camera: Camera = FakeCamera([])
_model: VisionModel = FakeVisionModel(make_identity(), make_observation())
_foundry: FoundryLocal = FakeFoundry(FakeVisionModel(make_identity(), make_observation()))
