"""Fakes for the ports the commands are given.

They encode our reading of the Foundry Local 2.x type signatures — see ADR-0004. They do
not prove the SDK behaves this way; only running against the real model does that. What
they do prove, through the assignments at the bottom of this module, is that they still
satisfy the ports the command declares.
"""

from __future__ import annotations

import io
from collections.abc import Callable, Iterable, Mapping, Sequence

from PIL import Image

from vision.capture import (
    Camera,
    DrainingReader,
    Feed,
    Frame,
    MakeReader,
    OnDemandReader,
    OpenFeed,
    Present,
    Reader,
)
from vision.errors import VisionError
from vision.inference import (
    FinishReason,
    FoundryLocal,
    ModelIdentity,
    RawObservation,
    VisionModel,
    Workload,
)
from vision.startup import Sleep


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

    Several images are several images already waiting, which is what a reader coming back
    after a pause is handed (CONTEXT.md, "Stale Frame"). ``gives_nothing`` is the camera
    that opens but never yields — what a camera held by another application looks like —
    and ``stops_after`` is the Feed that yields for a while and then dies, which ends a
    Watch rather than one Observation. The first is the second with nothing to yield at
    all, so they are one mechanism under two names worth telling apart.
    """

    def __init__(
        self,
        images: Iterable[Image.Image],
        *,
        gives_nothing: bool = False,
        stops_after: int | None = None,
    ) -> None:
        self._images = list(images)
        self._stops_after = 0 if gives_nothing else stops_after
        self.reads = 0
        self.closed = False

    def read(self) -> Image.Image | None:
        self.reads += 1
        if self._stops_after is not None and self.reads > self._stops_after:
            return None
        if self.reads > len(self._images):
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


class RecordingReader:
    """A Reader that answers from the Feed only when asked, and remembers being stopped.

    On demand rather than draining, because how the Feed is read and how often a Watch
    observes are two different questions: this reader answers the second with no thread in
    the test at all — one read, one image, no Stale Frames, which is the whole truth for a
    Watch that is keeping its Cadence. ``stopped`` is how a test pins that the reader came
    off the Feed before the camera was released.
    """

    def __init__(self, feed: Feed) -> None:
        self._reader = OnDemandReader(feed)
        self.stopped = False

    def latest(self) -> Present:
        return self._reader.latest()

    def stop(self) -> None:
        self.stopped = True
        self._reader.stop()


class FakeReaders:
    """Puts a RecordingReader on whatever Feed it is handed, and keeps hold of them.

    A factory rather than the reader itself, because the reader is made inside the Feed it
    reads: a test that wants to ask whether it was stopped has to be given it from here.
    """

    def __init__(self) -> None:
        self.readers: list[RecordingReader] = []

    def __call__(self, feed: Feed) -> RecordingReader:
        reader = RecordingReader(feed)
        self.readers.append(reader)
        return reader


class HandTurnedReader:
    """A Reader that really drains the Feed, with the test turning the loop instead of a thread.

    The reader a Watch runs on in production discards Stale Frames continuously (ADR-0006),
    and how many it discarded is the count the report rests on — so a test about that count
    has to be driven through the real counting rule rather than a fake of it. ``drain_once``
    is where that rule lives and it is one call, so turning it by hand is the whole loop:
    ``reads`` says how many images the Feed produced before each handout, and every one
    beyond the first is a Stale Frame the real reader really discarded.
    """

    def __init__(self, feed: Feed, reads: Sequence[int]) -> None:
        self._reader = DrainingReader(feed)
        self._reads = tuple(reads)
        self._handouts = 0
        self.stopped = False

    def latest(self) -> Present:
        arrived = self._reads[self._handouts] if self._handouts < len(self._reads) else 1
        self._handouts += 1
        for _ in range(arrived):
            if not self._reader.drain_once():
                break
        return self._reader.latest()

    def stop(self) -> None:
        self.stopped = True
        self._reader.stop()


class HandTurnedReaders:
    """Puts a HandTurnedReader on the Feed, told in advance what arrived between handouts.

    Several images between two handouts is what a machine short of its Cadence produces:
    the Feed goes on yielding while the model is busy, so the reader has Stale Frames to
    discard on the way to the present. Said as a schedule rather than as a rate so that no
    test has to wait for one.
    """

    def __init__(self, reads: Sequence[int] = ()) -> None:
        self._reads = tuple(reads)
        self.readers: list[HandTurnedReader] = []

    def __call__(self, feed: Feed) -> HandTurnedReader:
        reader = HandTurnedReader(feed, self._reads)
        self.readers.append(reader)
        return reader


class FakeSleep:
    """Records what it was asked to wait for and returns at once.

    What it recorded is how a Watch's Cadence is asserted: a grid of instants asks to wait
    for the distance to the next one, so an inference that took a second of a two-second
    Cadence is followed by a second — a Watch pausing for a fixed Cadence after each
    Observation would ask for two.

    ``interrupts_on`` is which call raises a ``KeyboardInterrupt``, which is how Ctrl+C is
    driven without signals and without wall-clock time.
    """

    def __init__(self, *, interrupts_on: int | None = None) -> None:
        self.waits: list[float] = []
        self._interrupts_on = interrupts_on

    def __call__(self, seconds: float) -> None:
        self.waits.append(seconds)
        if self._interrupts_on is not None and len(self.waits) == self._interrupts_on:
            raise KeyboardInterrupt


class FakeVisionModel:
    """A model whose task, runtime and Observations are all declared up front.

    The Observations are a sequence, one per call, so a test that asks for several can
    have them differ — in text, in finish reason or in completion tokens — which is what
    a repeated measurement needs. An entry that is an ``Exception`` is an inference that
    failed rather than an Observation: the Workload is recorded as asked for and the
    exception is raised, which is the one way a Watch's failed Observation can be driven
    without a model that really breaks. ``downloads`` counts the downloads that were started,
    which is what lets a test pin a refusal ahead of one rather than merely ahead of the
    Observation. ``load_error`` is the Variant that will not load on this machine, and
    ``download_error`` the one whose weights never arrive — the two ways a Variant fails to
    get onto the hardware at all.

    ``events`` is the journal the model writes what it was asked to do into. Handing the
    same list to a FakeFoundry puts registering the Execution Providers, loading and
    observing on one timeline, which is the only way to pin that the providers really were
    registered before any model went onto the hardware.
    """

    def __init__(
        self,
        identity: ModelIdentity,
        observations: Sequence[RawObservation | Exception],
        *,
        is_cached: bool = True,
        download_progress: Sequence[float] = (),
        download_error: Exception | None = None,
        load_error: Exception | None = None,
        events: list[str] | None = None,
    ) -> None:
        self.events = events if events is not None else []
        self.identity = identity
        self.is_cached = is_cached
        self._observations = tuple(observations)
        self._download_progress = tuple(download_progress)
        self._download_error = download_error
        self._load_error = load_error
        self.loaded = False
        self.downloads = 0
        self.unloads = 0
        self.observed: list[Workload] = []

    def download(self, on_progress: Callable[[float], None]) -> None:
        self.events.append("download")
        self.downloads += 1
        # Counted before it fails: a download that was started and then broke off is still
        # a download this Variant was allowed to begin, which is what `downloads` is asked.
        if self._download_error is not None:
            raise self._download_error
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
        answer = self._observations[index]
        if isinstance(answer, Exception):
            raise answer
        return answer


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
    execution_provider: str | None = "NvTensorRtRtxExecutionProvider",
    device_type: str | None = "GPU",
) -> ModelIdentity:
    return ModelIdentity(
        alias=alias,
        variant=variant,
        task=task,
        execution_provider=execution_provider,
        device_type=device_type,
    )


OBSERVED = "A wooden desk with a laptop, a coffee mug and an open notebook."
"""What the fake model says about a Frame when a test does not care what it said."""


def make_observation(
    text: str = OBSERVED,
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
_reader: Reader = RecordingReader(FakeFeed([]))
_hand_turned: Reader = HandTurnedReader(FakeFeed([]), ())
_make_reader: MakeReader = FakeReaders()
_make_hand_turned: MakeReader = HandTurnedReaders()
_sleep: Sleep = FakeSleep()
_model: VisionModel = FakeVisionModel(make_identity(), [make_observation()])
_foundry: FoundryLocal = FakeFoundry({"an-alias": FakeVisionModel(make_identity(), [])})
