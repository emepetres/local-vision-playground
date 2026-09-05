"""Tests for turning an image file into a Frame at the working resolution."""

from __future__ import annotations

import io
from pathlib import Path

import pytest
from PIL import Image

from vision.capture import WORKING_RESOLUTION, ImageFileCamera
from vision.errors import VisionError


def write_image(path: Path, size: tuple[int, int], mode: str = "RGB") -> Path:
    Image.new(mode, size, color=(20, 120, 200)).save(path)
    return path


def test_rescales_the_long_edge_down_to_the_working_resolution(tmp_path: Path) -> None:
    source = write_image(tmp_path / "wide.png", (1920, 1080))

    frame = ImageFileCamera(source).capture()

    assert (frame.width, frame.height) == (640, 360)
    assert frame.codec == "jpeg"
    assert frame.provenance == str(source)


def test_rescales_a_tall_frame_on_its_long_edge_too(tmp_path: Path) -> None:
    source = write_image(tmp_path / "tall.png", (1000, 4000))

    frame = ImageFileCamera(source).capture()

    assert (frame.width, frame.height) == (120, 480)


def test_never_crops(tmp_path: Path) -> None:
    source = write_image(tmp_path / "square.png", (2000, 2000))

    frame = ImageFileCamera(source).capture()

    assert (frame.width, frame.height) == (480, 480)


def test_leaves_a_frame_already_at_the_working_resolution_alone(tmp_path: Path) -> None:
    source = write_image(tmp_path / "exact.png", WORKING_RESOLUTION)

    frame = ImageFileCamera(source).capture()

    assert (frame.width, frame.height) == WORKING_RESOLUTION


def test_encodes_as_jpeg_whatever_went_in(tmp_path: Path) -> None:
    source = write_image(tmp_path / "transparent.png", (800, 600), mode="RGBA")

    frame = ImageFileCamera(source).capture()

    with Image.open(io.BytesIO(frame.data)) as decoded:
        assert decoded.format == "JPEG"
        assert decoded.size == (640, 480)


def test_says_what_to_do_when_the_file_is_not_an_image(tmp_path: Path) -> None:
    source = tmp_path / "notes.txt"
    source.write_text("not an image")

    with pytest.raises(VisionError, match="is not an image"):
        ImageFileCamera(source).capture()


def test_says_what_to_do_when_the_file_is_missing(tmp_path: Path) -> None:
    with pytest.raises(VisionError, match="there is no image at"):
        ImageFileCamera(tmp_path / "missing.jpg").capture()
