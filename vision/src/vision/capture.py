"""Frames, and where they come from.

Capture does not know a model exists. It produces Frames at a fixed working resolution so
that the workload downstream is fixed too — a Benchmark Run over a larger Frame measures
something else (see CONTEXT.md, "Benchmark Run").
"""

from __future__ import annotations

import hashlib
import io
import os
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from itertools import count
from pathlib import Path
from threading import Condition, Thread
from types import ModuleType
from typing import TYPE_CHECKING, Protocol

from PIL import Image, ImageOps, UnidentifiedImageError

from vision.errors import VisionError

if TYPE_CHECKING:
    import cv2

WORKING_RESOLUTION = (640, 480)
"""The box every Frame is rescaled to fit. Never cropped to."""

JPEG_CODEC = "jpeg"
"""The IANA-style codec hint Foundry Local 2.x wants alongside the raw bytes (ADR-0004)."""

JPEG_QUALITY = 90

SETTLING_FRAMES = 5
"""How many Frames a freshly opened Feed yields before what it reports is what is there.

A camera exposes and white-balances for a moment after it opens, so its first Frames are
dark or wrongly coloured (see CONTEXT.md, "Feed"). Discarding a fixed number of them is
part of taking a Frame, not a sleep hidden in front of it: the discards happen inside
``capture`` and so inside the capture time the Operator is told about.
"""

READER_SHUTDOWN_SECONDS = 2.0
"""How long closing a HeldFeed waits for its draining reader to come off the Feed.

Long enough for a read of a working camera to return many times over, short enough that a
camera which has stopped answering does not hold up the process that is shutting down.
"""

REFERENCE_FRAME = Path(__file__).resolve().parents[3] / "docs" / "fixtures" / "reference-frame.jpg"
"""The Frame a Benchmark measures when the Operator names no other.

It is in the repository rather than taken from the camera because a Benchmark Run is only
comparable to another when the Frame's exact bytes match (CONTEXT.md, "Workload") — and
two machines can only match bytes they both have.

Resolved from this module, like FRAMES_DIRECTORY, and with the same caveat: it walks out
past the package root into the checkout, so it only exists when the project is installed
in editable mode. That is what ``uv run`` gives us, and it is why a Benchmark says so
rather than reporting a missing file when it is not.
"""

FRAMES_DIRECTORY = Path(__file__).resolve().parents[2] / "frames"
"""Where camera Frames are kept when an Operator asks for them — ``vision/frames/``,
git-ignored. Nothing is written here unless they do.

Resolved from this module rather than the working directory so that ``observe`` writes to
the same place wherever it is run from. It relies on the project being installed in
editable mode, which is what ``uv run`` gives us.
"""


@dataclass(frozen=True)
class Frame:
    """A single still image the rest of the system reasons over."""

    data: bytes
    codec: str
    provenance: str
    width: int
    height: int
    settling_discards: int = 0
    """Frames the Feed discarded to settle before this one. Zero when there was no Feed."""

    @property
    def digest(self) -> str:
        """The SHA-256 of these exact bytes — what identifies this Frame to a later reader.

        A Workload is the Frame's bytes rather than its resolution (CONTEXT.md), so "the
        same Workload" is only a claim a reader can check if the bytes are named. A path
        and a resolution are not: two machines can hold different images under the same
        name, and the same camera at the same resolution gives different bytes every time.

        Computed rather than stored so that it cannot drift from the bytes it is about,
        and because it is read once per persisted Benchmark rather than per Benchmark Run.
        """
        return hashlib.sha256(self.data).hexdigest()


class Camera(Protocol):
    """The port every source of Frames plugs into — an image file, or a live Feed."""

    def capture(self) -> Frame:
        """Take the next Frame, already at the working resolution."""
        ...


class Feed(Protocol):
    """The live stream of images from one camera, opened for as long as it is read."""

    def read(self) -> Image.Image | None:
        """The next image, or nothing at all when the camera yields none."""
        ...

    def close(self) -> None:
        """Release the camera. A Feed left open holds it against every other application."""
        ...


OpenFeed = Callable[[int], "Feed | None"]
"""Opens the Feed on the camera at an index, or reports there is no camera at that index."""


@dataclass(frozen=True)
class Present:
    """What a held Feed hands out: the image now, and what was discarded to reach it.

    The two travel together because neither is worth having alone — an image with no count
    is an image that might be the past, and a count with no image is arithmetic about
    nothing. Named rather than a pair so that the Stale Frames cannot be read as a
    position (CONTEXT.md, "Stale Frame"), the way ``Frame.settling_discards`` is named.
    """

    image: Image.Image | None
    """Nothing at all when the Feed has stopped giving images."""

    stale_frames: int
    """Images the Feed produced while nobody was reading, discarded to reach this one."""

    def frame(self, *, provenance: str, settling_discards: int = 0) -> Frame | None:
        """This image as a Frame at the working resolution, or nothing where there is none.

        The encoding lives here rather than in whoever reads the Feed so that a single
        capture and a Watch produce Frames the same way — two callers rescaling and
        encoding a Feed's images their own way would be two working resolutions, and the
        Frame is the unit of work everything downstream operates on (CONTEXT.md, "Frame").

        The settling discards are the caller's to pass: they are paid once when the Feed
        was opened, so a single capture charges them to the one Frame it takes while a
        Watch reports them once at start-up and never again.
        """
        if self.image is None:
            return None
        return _to_frame(self.image, provenance=provenance, settling_discards=settling_discards)


class Reader(Protocol):
    """Whatever keeps the most recent image of a Feed available for the asking.

    A Feed does not wait for its reader (CONTEXT.md, "Feed"), so *how* it is read decides
    what a Stale Frame even is: a reader that only reads when asked never produces one,
    while a reader draining the Feed continuously produces exactly as many as it discarded.
    Both are real readers of the same Feed, which is why this is a port and not a class.
    """

    def latest(self) -> Present:
        """The present. No image and no discards when the Feed has stopped giving them."""
        ...

    def stop(self) -> None:
        """Stop consuming the Feed. Closing the Feed itself is the caller's business."""
        ...


MakeReader = Callable[["Feed"], Reader]
"""Puts a reader on an opened Feed."""


class LatestImage:
    """The most recent image a Feed produced, and the count of what it displaced.

    Not a reader: whoever reads the Feed offers images here, and whoever wants the present
    takes them. Holding is split from reading so that the counting rule is written once and
    can be driven either by a thread or by a test's own calls.

    Taking empties it. The next image handed out is therefore one the Feed produced after
    the last handout, which is what makes it the present rather than the last thing seen.
    """

    def __init__(self) -> None:
        self._image: Image.Image | None = None
        self._discarded = 0

    @property
    def is_empty(self) -> bool:
        return self._image is None

    def offer(self, image: Image.Image) -> None:
        """Keep this image, discarding as a Stale Frame whichever one it displaces."""
        if self._image is not None:
            self._discarded += 1
        self._image = image

    def take(self) -> Present:
        present = Present(image=self._image, stale_frames=self._discarded)
        self._image, self._discarded = None, 0
        return present


class OnDemandReader:
    """A Reader that touches the Feed only when the present is asked for.

    One read, one image, no Stale Frames — which is the whole truth for a single-shot
    capture, where nothing was buffered while nobody was reading because nobody was going
    to read again. ``read_once`` is the same read made without handing anything out, so
    that a test can put a Feed's images behind the reader without a thread to wait on.
    """

    def __init__(self, feed: Feed) -> None:
        self._feed = feed
        self._held = LatestImage()
        self._ended = False

    def read_once(self) -> bool:
        """Read one image, keeping it and discarding whatever it displaces.

        False when the Feed yielded nothing, which is the only signal that it is done —
        a Feed reports its own death by handing back no image.
        """
        if self._ended:
            return False
        image = self._feed.read()
        if image is None:
            self._ended = True
            return False
        self._held.offer(image)
        return True

    def latest(self) -> Present:
        if self._held.is_empty:
            self.read_once()
        return self._held.take()

    def stop(self) -> None:
        self._ended = True


class DrainingReader:
    """A Reader that keeps consuming the Feed, so that a Stale Frame is a counted fact.

    This is the reader a Watch needs, and the reason a Stale Frame is a count rather than
    an estimate (ADR-0006). OpenCV gives no way to ask whether a Feed has anything left —
    ``read()`` always returns something — so "discard whatever arrived meanwhile" cannot be
    discovered by reading until nothing comes back. Draining continuously and holding only
    the most recent image turns it into arithmetic: every image the held one displaced is
    one Stale Frame, counted as it happened.

    The draining is one call, ``drain_once``, and the thread is nothing but a loop over it
    (see ``drain_in_background``). That is where the boundary goes: the counting a Watch's
    honesty rests on is then the same code whether a thread is turning the loop or a test
    is, and no test has to wait on anything. A reader nothing is turning holds no images,
    so a Feed is only ever given one of these through the factory that starts its thread.
    """

    def __init__(self, feed: Feed) -> None:
        self._feed = feed
        self._held = LatestImage()
        self._arrived = Condition()
        self._stopped = False
        self._ended = False
        self._thread: Thread | None = None

    def start(self) -> None:
        """Put a thread on the draining. A daemon, so a wedged read cannot outlive exit."""
        self._thread = Thread(target=self._drain, name="feed-reader", daemon=True)
        self._thread.start()

    def drain_once(self) -> bool:
        """Read one image, keeping it and discarding as a Stale Frame whatever it displaces.

        False when there is no point reading again — the Feed handed back nothing, which is
        how it reports its own death, or the reader has been stopped.

        The read happens outside the lock: it is the one slow call here, and a caller
        asking for the present must never wait on the Feed's next image to be handed the
        one already held.
        """
        if self._stopped:
            return False
        image = self._feed.read()
        with self._arrived:
            if self._stopped:
                return False
            if image is None:
                self._ended = True
                self._arrived.notify_all()
                return False
            self._held.offer(image)
            self._arrived.notify_all()
            return True

    def _drain(self) -> None:
        while self.drain_once():
            pass

    def latest(self) -> Present:
        """The most recent image, waiting if the Feed has not produced one yet.

        Waiting is right rather than reporting nothing: the camera produces its next image
        in milliseconds, and "no image" is reserved for a Feed that has actually stopped
        giving them — which is what a caller turns into a failure. A stopped reader is that too,
        so that asking a closed HeldFeed for the present is answered rather than waited on.
        """
        with self._arrived:
            self._arrived.wait_for(lambda: not self._held.is_empty or self._ended or self._stopped)
            return self._held.take()

    def stop(self) -> None:
        """Come off the Feed, and wait for the thread to be off it too.

        The wait is bounded because the thread can be inside a ``read`` that never returns
        — a camera unplugged mid-Watch — and a demo that will not exit is worse than a
        thread left behind on a Feed that is already gone.
        """
        with self._arrived:
            self._stopped = True
            self._arrived.notify_all()
        if self._thread is not None:
            self._thread.join(timeout=READER_SHUTDOWN_SECONDS)


def drain_in_background(feed: Feed) -> Reader:
    """A DrainingReader with a thread already turning its loop — how a real Feed is read."""
    reader = DrainingReader(feed)
    reader.start()
    return reader


class HeldFeed:
    """A Feed opened once and held for as long as many Observations need it.

    ``LiveCamera`` opens one of these, takes a Frame and closes it; a Watch keeps the same
    one for its whole run. Either way this is where the two facts a held Feed has and a
    single read does not are kept apart: the Frames discarded once because the camera was
    not ready yet, and the Stale Frames discarded on the way to the present because nobody
    was reading (CONTEXT.md, "Stale Frame"). The first is reported once, here; the second
    on every handout.
    """

    def __init__(self, feed: Feed, reader: Reader, settling_discards: int) -> None:
        self._feed = feed
        self._reader = reader
        self._closed = False
        self.settling_discards = settling_discards
        """Frames discarded while the Feed settled — paid once, when it was opened."""

    @classmethod
    def open(cls, index: int, open_feed: OpenFeed, *, make_reader: MakeReader) -> HeldFeed | None:
        """Open the camera at ``index`` and settle it, or report there is none there.

        Reporting rather than raising, like the OpenFeed port it stands on: what to tell an
        Operator with no camera attached depends on what they were trying to do, and only
        the caller knows that.

        Settling reads the Feed directly, before any reader is put on it: the whole point
        of those reads is that nobody looks at what they returned, so a Feed that gives
        nothing while settling is not a failure here. It becomes one on the first handout —
        and a Feed that gave nothing discarded nothing, which is what is reported.
        """
        feed = open_feed(index)
        if feed is None:
            return None
        try:
            discards = sum(feed.read() is not None for _ in range(SETTLING_FRAMES))
            reader = make_reader(feed)
        except BaseException:
            feed.close()
            raise
        return cls(feed, reader, discards)

    def present(self) -> Present:
        """The image in front of the camera now, and the Stale Frames discarded to reach it.

        Nothing at all when the Feed yielded nothing: a camera another application is
        holding opens and then reads empty forever (see ``open_camera_feed``), and what to
        say about that is the caller's, as it is for a camera that was never there.
        """
        return self._reader.latest()

    def close(self) -> None:
        """Stop the reader and release the camera, in that order and only once.

        The reader goes first: a reader still consuming a released Feed is reading a device
        that is gone. But the camera is released whatever the reader did on the way down,
        because a Feed left open holds it against every other application. Idempotent, so
        that a caller closing on the way out of a failure it has already handled does not
        turn one problem into two.
        """
        if self._closed:
            return
        self._closed = True
        try:
            self._reader.stop()
        finally:
            self._feed.close()

    def __enter__(self) -> HeldFeed:
        return self

    def __exit__(self, *exception: object) -> None:
        self.close()


class ImageFileCamera:
    """A Camera that takes its Frame from an image file rather than from a Feed.

    A Feed is a camera's continuous stream (see CONTEXT.md); a file on disk is not one of
    those, it is simply another place a Frame comes from.
    """

    def __init__(self, path: Path) -> None:
        self._path = path

    def capture(self) -> Frame:
        try:
            with Image.open(self._path) as image:
                return _to_frame(image, provenance=str(self._path))
        except FileNotFoundError:
            raise VisionError(
                f"there is no image at {self._path} — pass a path that exists to --image"
            ) from None
        except UnidentifiedImageError:
            raise VisionError(
                f"{self._path} is not an image Pillow can read"
                " — pass a JPEG, PNG, BMP, GIF or WebP to --image"
            ) from None


class LiveCamera:
    """A Camera that takes its Frame from a Feed on a camera attached to the machine.

    A HeldFeed for the length of one Frame: open, settle, take the present, close. The
    reader is the on-demand one, because a capture that happens once has nothing to drain —
    no image arrived while nobody was reading, so no Stale Frame is discarded and the count
    it reports is honestly zero.

    It owns the two failures a live demo actually hits — no camera attached, and a camera
    another application is holding — because both are answered the same way whatever
    opened the Feed, and a fake Feed can then drive both.
    """

    def __init__(self, index: int, open_feed: OpenFeed) -> None:
        self._index = index
        self._open_feed = open_feed

    def capture(self) -> Frame:
        held = HeldFeed.open(self._index, self._open_feed, make_reader=OnDemandReader)
        if held is None:
            raise VisionError(
                f"there is no camera at index {self._index} — attach one, select another"
                " with --camera N, or observe an image file with --image <path>"
            )
        with held:
            frame = held.present().frame(
                provenance=camera_provenance(self._index),
                settling_discards=held.settling_discards,
            )
            if frame is None:
                raise VisionError(
                    f"camera {self._index} opened but gave no Frame — another application is"
                    " holding it; close that application, or observe an image file"
                    " with --image <path>"
                )
            return frame


def camera_provenance(index: int) -> str:
    """How a Frame taken from the machine's camera at ``index`` says where it came from.

    Written once because two commands read the same Feed: a Watch that named the camera
    differently from ``observe`` would have an Operator comparing two Frames and wondering
    whether they came from the same device.
    """
    return f"camera {index}"


def open_camera_feed(index: int) -> Feed | None:
    """Open the machine's camera at ``index`` with OpenCV, or report there is none there.

    OpenCV reports both live-demo failures through the same two calls, and it takes both
    to tell them apart: a camera that is not there does not open, while a camera another
    application is holding opens and then yields nothing. Checked against the development
    machine's camera on Windows — held by a second process, ``isOpened()`` is still true
    and every ``read`` comes back empty. That second half is not decided here: a Feed that
    reads nothing is what ``LiveCamera`` turns into the message.
    """
    cv2 = _cv2()
    device = cv2.VideoCapture(index)
    if not device.isOpened():
        device.release()
        return None
    # Ask the backend to keep one image rather than a queue of them, so that a reader
    # coming back after a pause has less of the past to discard. Backends are free to
    # ignore it and several do, which is why nothing depends on it: the Stale Frames are
    # counted by the reader that discards them, not deduced from this depth.
    device.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return OpenCVFeed(device)


def _cv2() -> ModuleType:
    """Import OpenCV with the two settings that have to be in place around it.

    Single-sited because both of them are easy to lose: the FFMPEG priority is read when
    ``cv2`` is first imported, so it has to be set before the import — which is why the
    import is deferred rather than at module scope — and the log level has to be lowered
    however the module is reached. Both are idempotent, so every caller goes through here.
    """
    # FFMPEG is not a camera backend, but OpenCV probes it anyway and prints a warning
    # saying so. Taking it out of the running is what stops the warning.
    os.environ.setdefault("OPENCV_VIDEOIO_PRIORITY_FFMPEG", "0")

    import cv2

    # OpenCV narrates its backend probing on stderr — a wall of native warnings in front
    # of the one line the Operator is meant to read. A failure here has its own message.
    cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_SILENT)
    return cv2


class OpenCVFeed:
    """A Feed backed by an open ``cv2.VideoCapture``, handing out RGB images."""

    def __init__(self, device: cv2.VideoCapture) -> None:
        self._device = device

    def read(self) -> Image.Image | None:
        ok, array = self._device.read()
        if not ok or array is None:
            return None
        cv2 = _cv2()
        return Image.fromarray(cv2.cvtColor(array, cv2.COLOR_BGR2RGB))

    def close(self) -> None:
        self._device.release()


def save_frame(frame: Frame, directory: Path) -> Path:
    """Write a Frame where it can be looked at after the process is gone.

    Called only for a Frame an Operator asked to keep — whether any Frame is kept at all
    is the caller's decision, not this function's. Every Frame it is handed gets its own
    file rather than overwriting the last: a run that kept two Frames to explain an
    Observation with has two to look at.
    """
    directory.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    # The Windows clock is coarse enough that two Frames in a row can share a stamp, and
    # a Frame that overwrites another is a Frame that cannot be looked at. "x" refuses to
    # overwrite, so the loop lands on a name nothing holds.
    for attempt in count():
        suffix = "" if attempt == 0 else f"-{attempt}"
        path = directory / f"frame-{stamp}{suffix}.jpg"
        try:
            with path.open("xb") as file:
                file.write(frame.data)
        except FileExistsError:
            continue
        return path
    raise AssertionError("unreachable")


def _to_frame(image: Image.Image, *, provenance: str, settling_discards: int = 0) -> Frame:
    """Rescale on the long edge to fit the working resolution and encode as JPEG."""
    resized = ImageOps.contain(image.convert("RGB"), WORKING_RESOLUTION)
    buffer = io.BytesIO()
    resized.save(buffer, format="JPEG", quality=JPEG_QUALITY)
    return Frame(
        data=buffer.getvalue(),
        codec=JPEG_CODEC,
        provenance=provenance,
        width=resized.width,
        height=resized.height,
        settling_discards=settling_discards,
    )
