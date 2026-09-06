"""Fakes for the three ports the ``observe`` command is given.

They encode our reading of the Foundry Local 2.x type signatures — see ADR-0004. They do
not prove the SDK behaves this way; only running against the real model does that. What
they do prove, through the assignments at the bottom of this module, is that they still
satisfy the ports the command declares.
"""

from __future__ import annotations

import io
from collections.abc import Callable, Iterable, Sequence

from PIL import Image

from vision.capture import Camera, Feed, Frame, OpenFeed
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


class FakeFeed:
    """A Feed that hands out prepared images, one per read, and counts every read.

    ``gives_nothing`` is the camera that opens but never yields — what a camera held by
    another application looks like from here.
    """

    def __init__(self, images: Iterable[Image.Image], *, gives_nothing: bool = False) -> None:
        self._images = list(images)
        self._gives_nothing = gives_nothing
        self.reads = 0
        self.closed = False

    def read(self) -> Image.Image | None:
        self.reads += 1
        if self._gives_nothing or self.reads > len(self._images):
            return None
        return self._images[self.reads - 1]

    def close(self) -> None:
        self.closed = True


class FakeCameras:
    """Stands in for the machine's cameras: an index either has a Feed on it or does not."""

    def __init__(self, feeds: dict[int, FakeFeed]) -> None:
        self._feeds = feeds
        self.opened: list[int] = []

    def __call__(self, index: int) -> FakeFeed | None:
        self.opened.append(index)
        return self._feeds.get(index)


class FakeVisionModel:
    """A model whose task, runtime and Observation are all declared up front."""

    def __init__(
        self,
        identity: ModelIdentity,
        observation: RawObservation,
        *,
        is_cached: bool = True,
        download_progress: Sequence[float] = (),
        load_error: Exception | None = None,
    ) -> None:
        self.identity = identity
        self.is_cached = is_cached
        self._observation = observation
        self._download_progress = tuple(download_progress)
        self._load_error = load_error
        self.loaded = False
        self.observed: list[tuple[Frame, str]] = []

    def download(self, on_progress: Callable[[float], None]) -> None:
        for percent in self._download_progress:
            on_progress(percent)

    def load(self) -> None:
        if self._load_error is not None:
            raise self._load_error
        self.loaded = True

    def observe(self, frame: Frame, prompt: str) -> RawObservation:
        self.observed.append((frame, prompt))
        return self._observation


class FakeFoundry:
    """Resolves every name to the one model it was given.

    ``setup_lines`` are what registering the Execution Providers announces — an EP that
    could not be registered is the thing worth saying out loud. ``resolved`` keeps the
    names it was asked for; ``events`` keeps only the order the port was called in, which
    is how a test pins registration before a resolve.
    """

    def __init__(self, model: FakeVisionModel, *, setup_lines: Sequence[str] = ()) -> None:
        self.model = model
        self._setup_lines = tuple(setup_lines)
        self.events: list[str] = []
        self.resolved: list[str] = []

    def register_execution_providers(self, announce: Callable[[str], None]) -> None:
        self.events.append("register")
        for line in self._setup_lines:
            announce(line)

    def resolve(self, name: str) -> FakeVisionModel:
        self.events.append("resolve")
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
    variant: str = "qwen3-vl-2b-instruct-cuda-gpu:2",
    task: str = "vision-language-chat",
    runtime: str | None = "GPU / NvTensorRtRtxExecutionProvider",
) -> ModelIdentity:
    return ModelIdentity(alias=alias, variant=variant, task=task, runtime=runtime)


def make_observation(
    text: str = "A wooden desk with a laptop, a coffee mug and an open notebook.",
    finish_reason: FinishReason = FinishReason.COMPLETE,
) -> RawObservation:
    return RawObservation(text=text, finish_reason=finish_reason)


def make_images(colours: Sequence[tuple[int, int, int]]) -> list[Image.Image]:
    """One solid-colour image per colour, so a test can tell which Frame was taken."""
    return [Image.new("RGB", (640, 480), colour) for colour in colours]


SETTLING_COLOURS = ((10, 10, 10), (30, 30, 30), (50, 50, 50), (70, 70, 70), (90, 90, 90))
"""Five dark greys for the Frames the Feed discards while it settles."""

SETTLED_COLOUR = (200, 40, 40)
"""The red the Frame that is actually taken is made of."""


def settling_feed() -> FakeFeed:
    """A Feed that yields the Frames discarded while it settles, then the one worth taking."""
    return FakeFeed(make_images([*SETTLING_COLOURS, SETTLED_COLOUR]))


def colour_of(jpeg: bytes) -> tuple[int, ...]:
    """The colour an encoded Frame is made of — which says which image it was made from."""
    with Image.open(io.BytesIO(jpeg)) as decoded:
        pixel = decoded.convert("RGB").getpixel((0, 0))
    assert isinstance(pixel, tuple)
    return pixel


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
_feed: Feed = FakeFeed([])
_open_feed: OpenFeed = FakeCameras({})
_model: VisionModel = FakeVisionModel(make_identity(), make_observation())
_foundry: FoundryLocal = FakeFoundry(FakeVisionModel(make_identity(), make_observation()))
