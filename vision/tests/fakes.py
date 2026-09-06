"""Fakes for the three ports the ``observe`` command is given.

They encode our reading of the Foundry Local 2.x type signatures — see ADR-0004. They do
not prove the SDK behaves this way; only running against the real model does that. What
they do prove, through the assignments at the bottom of this module, is that they still
satisfy the ports the command declares.
"""

from __future__ import annotations

import io
from collections.abc import Callable, Iterable, Mapping, Sequence

from PIL import Image

from vision.capture import Camera, Feed, Frame, OpenFeed
from vision.errors import VisionError
from vision.inference import (
    FinishReason,
    FoundryLocal,
    ModelIdentity,
    RawObservation,
    VisionModel,
    Workload,
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
    """A model whose task, runtime and Observations are all declared up front.

    The Observations are a sequence, one per call, so a test that asks for several can
    have them differ — in text, in finish reason or in completion tokens — which is what
    a repeated measurement needs. ``downloads`` counts the downloads that were started,
    which is what lets a test pin a refusal ahead of one rather than merely ahead of the
    Observation. ``load_error`` is the Variant that will not load on this machine.

    ``events`` is the journal the model writes what it was asked to do into. Handing the
    same list to a FakeFoundry puts registering the Execution Providers, loading and
    observing on one timeline, which is the only way to pin that the providers really were
    registered before any model went onto the hardware.
    """

    def __init__(
        self,
        identity: ModelIdentity,
        observations: Sequence[RawObservation],
        *,
        is_cached: bool = True,
        download_progress: Sequence[float] = (),
        load_error: Exception | None = None,
        events: list[str] | None = None,
    ) -> None:
        self.events = events if events is not None else []
        self.identity = identity
        self.is_cached = is_cached
        self._observations = tuple(observations)
        self._download_progress = tuple(download_progress)
        self._load_error = load_error
        self.loaded = False
        self.downloads = 0
        self.unloads = 0
        self.observed: list[Workload] = []

    def download(self, on_progress: Callable[[float], None]) -> None:
        self.events.append("download")
        self.downloads += 1
        for percent in self._download_progress:
            on_progress(percent)

    def load(self) -> None:
        if self._load_error is not None:
            raise self._load_error
        self.events.append("load")
        self.loaded = True

    def unload(self) -> None:
        self.events.append("unload")
        self.unloads += 1
        self.loaded = False

    def observe(self, workload: Workload) -> RawObservation:
        index = len(self.observed)
        if index >= len(self._observations):
            raise AssertionError(
                "the fake model was asked for more Observations than the test prepared"
            )
        self.events.append("observe")
        self.observed.append(workload)
        return self._observations[index]


class FakeFoundry:
    """Resolves each name to the model registered under it.

    A mapping is the honest shape: a caller that measures two Variants asks for two names
    and has to get two different models back. ``resolving_everything_to`` is the one
    exception, for a test that does not care which name its single model answers to.

    ``setup_lines`` are what registering the Execution Providers announces — an EP that
    could not be registered is the thing worth saying out loud. ``resolved`` keeps the
    names it was asked for; ``events`` keeps the order the port was called in, which is how
    a test pins registration before a resolve. Handing the same list to a FakeVisionModel
    puts the model's own loads and Observations on that timeline too.
    """

    def __init__(
        self,
        models: Mapping[str, FakeVisionModel],
        *,
        every_name: FakeVisionModel | None = None,
        setup_lines: Sequence[str] = (),
        events: list[str] | None = None,
    ) -> None:
        self.models = dict(models)
        self._every_name = every_name
        self._setup_lines = tuple(setup_lines)
        self.events: list[str] = events if events is not None else []
        self.resolved: list[str] = []

    @classmethod
    def resolving_everything_to(
        cls,
        model: FakeVisionModel,
        *,
        setup_lines: Sequence[str] = (),
        events: list[str] | None = None,
    ) -> FakeFoundry:
        """One model under every name, for a caller that only ever resolves one."""
        return cls({}, every_name=model, setup_lines=setup_lines, events=events)

    def register_execution_providers(self, announce: Callable[[str], None]) -> None:
        self.events.append("register")
        for line in self._setup_lines:
            announce(line)

    def resolve(self, name: str) -> FakeVisionModel:
        self.events.append("resolve")
        self.resolved.append(name)
        if self._every_name is not None:
            return self._every_name
        model = self.models.get(name)
        if model is None:
            raise VisionError(f"Foundry Local has no model called {name!r}")
        return model


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
    task: str | None = "vision-language-chat",
    runtime: str | None = "GPU / NvTensorRtRtxExecutionProvider",
) -> ModelIdentity:
    return ModelIdentity(alias=alias, variant=variant, task=task, runtime=runtime)


def make_observation(
    text: str = "A wooden desk with a laptop, a coffee mug and an open notebook.",
    finish_reason: FinishReason = FinishReason.COMPLETE,
    completion_tokens: int = 24,
) -> RawObservation:
    return RawObservation(
        text=text, finish_reason=finish_reason, completion_tokens=completion_tokens
    )


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
_model: VisionModel = FakeVisionModel(make_identity(), [make_observation()])
_foundry: FoundryLocal = FakeFoundry({"an-alias": FakeVisionModel(make_identity(), [])})
