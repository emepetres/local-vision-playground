"""Tests for turning an image file or a live Feed into a Frame at the working resolution."""

from __future__ import annotations

import io
from pathlib import Path

import pytest
from PIL import Image

import vision.capture
from tests.fakes import SETTLED_COLOUR, FakeCameras, FakeFeed, colour_of, settling_feed
from vision.capture import (
    SETTLING_FRAMES,
    WORKING_RESOLUTION,
    ImageFileCamera,
    LiveCamera,
    save_frame,
)
from vision.errors import VisionError


class FrozenClock:
    """A stand-in for ``datetime`` that always reports the same instant."""

    @staticmethod
    def now() -> FrozenClock:
        return FrozenClock()

    def strftime(self, fmt: str) -> str:
        return "fixed"


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


def live_camera(feeds: dict[int, FakeFeed], *, index: int = 0) -> LiveCamera:
    return LiveCamera(index, FakeCameras(feeds))


def test_discards_the_settling_frames_and_takes_the_next_one() -> None:
    feed = settling_feed()

    frame = live_camera({0: feed}).capture()

    assert feed.reads == SETTLING_FRAMES + 1
    assert colour_of(frame.data) == SETTLED_COLOUR


def test_counts_the_frames_it_discarded_while_the_feed_settled() -> None:
    frame = live_camera({0: settling_feed()}).capture()

    assert frame.settling_discards == SETTLING_FRAMES


def test_names_the_camera_it_took_the_frame_from() -> None:
    frame = live_camera({3: settling_feed()}, index=3).capture()

    assert frame.provenance == "camera 3"


def test_closes_the_feed_it_opened() -> None:
    feed = settling_feed()

    live_camera({0: feed}).capture()

    assert feed.closed


def test_points_at_an_image_file_when_no_camera_is_attached() -> None:
    with pytest.raises(VisionError, match="no camera at index 1"):
        live_camera({0: settling_feed()}, index=1).capture()


def test_says_what_to_do_when_another_application_is_holding_the_camera() -> None:
    feed = FakeFeed([], gives_nothing=True)

    with pytest.raises(VisionError, match="another application"):
        live_camera({0: feed}).capture()

    assert feed.closed


def test_writes_the_frame_it_took_where_it_can_be_looked_at_afterwards(tmp_path: Path) -> None:
    frame = live_camera({0: settling_feed()}).capture()

    path = save_frame(frame, tmp_path / "frames")

    assert path.parent == tmp_path / "frames"
    assert path.suffix == ".jpg"
    assert path.read_bytes() == frame.data


def test_writes_every_frame_to_its_own_file(tmp_path: Path) -> None:
    frame = live_camera({0: settling_feed()}).capture()

    first, second = save_frame(frame, tmp_path), save_frame(frame, tmp_path)

    assert first != second
    assert first.read_bytes() == second.read_bytes() == frame.data


def test_keeps_both_frames_when_the_clock_hands_out_the_same_stamp(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The Windows clock is coarse enough that this is the ordinary case, not a corner."""
    monkeypatch.setattr(vision.capture, "datetime", FrozenClock)
    frame = live_camera({0: settling_feed()}).capture()

    first, second = save_frame(frame, tmp_path), save_frame(frame, tmp_path)

    assert {first.name, second.name} == {"frame-fixed.jpg", "frame-fixed-1.jpg"}
