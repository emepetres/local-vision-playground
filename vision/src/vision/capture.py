"""Frames, and where they come from.

Capture does not know a model exists. It produces Frames at a fixed working resolution so
that the workload downstream is fixed too — a Benchmark Run over a larger Frame measures
something else (see CONTEXT.md, "Benchmark Run").
"""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from PIL import Image, ImageOps, UnidentifiedImageError

from vision.errors import VisionError

WORKING_RESOLUTION = (640, 480)
"""The box every Frame is rescaled to fit. Never cropped to."""

JPEG_CODEC = "jpeg"
"""The IANA-style codec hint Foundry Local 2.x wants alongside the raw bytes (ADR-0004)."""

JPEG_QUALITY = 90


@dataclass(frozen=True)
class Frame:
    """A single still image the rest of the system reasons over."""

    data: bytes
    codec: str
    provenance: str
    width: int
    height: int


class Camera(Protocol):
    """The port every source of Frames plugs into — a file today, a live Feed later."""

    def capture(self) -> Frame:
        """Take the next Frame, already at the working resolution."""
        ...


class ImageFileCamera:
    """A Camera whose Feed is one image on disk."""

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


def _to_frame(image: Image.Image, *, provenance: str) -> Frame:
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
    )
