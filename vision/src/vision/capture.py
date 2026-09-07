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
"""Where camera Frames are kept — ``vision/frames/``, git-ignored.

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

    It owns the two failures a live demo actually hits — no camera attached, and a camera
    another application is holding — because both are answered the same way whatever
    opened the Feed, and a fake Feed can then drive both.
    """

    def __init__(self, index: int, open_feed: OpenFeed) -> None:
        self._index = index
        self._open_feed = open_feed

    def capture(self) -> Frame:
        feed = self._open_feed(self._index)
        if feed is None:
            raise VisionError(
                f"there is no camera at index {self._index} — attach one, select another"
                " with --camera N, or observe an image file with --image <path>"
            )
        try:
            for _ in range(SETTLING_FRAMES):
                self._read(feed)
            image = self._read(feed)
            return _to_frame(
                image,
                provenance=f"camera {self._index}",
                settling_discards=SETTLING_FRAMES,
            )
        finally:
            feed.close()

    def _read(self, feed: Feed) -> Image.Image:
        image = feed.read()
        if image is None:
            raise VisionError(
                f"camera {self._index} opened but gave no Frame — another application is"
                " holding it; close that application, or observe an image file"
                " with --image <path>"
            )
        return image


def open_camera_feed(index: int) -> Feed | None:
    """Open the machine's camera at ``index`` with OpenCV, or report there is none there.

    OpenCV reports both live-demo failures through the same two calls, and it takes both
    to tell them apart: a camera that is not there does not open, while a camera another
    application is holding opens and then yields nothing. Checked against the development
    machine's camera on Windows — held by a second process, ``isOpened()`` is still true
    and every ``read`` comes back empty. That second half is not decided here: a Feed that
    reads nothing is what ``LiveCamera`` turns into the message.
    """
    device = _cv2().VideoCapture(index)
    if not device.isOpened():
        device.release()
        return None
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

    A surprising Observation is only explainable if the Frame behind it outlives the run,
    so every Frame the camera takes is kept rather than the last one overwritten.
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
