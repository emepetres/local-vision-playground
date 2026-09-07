"""Tests for the capture abstraction a Watch holds open, driven through a fake Feed.

Nothing here waits. A reader is a port, and draining is one call rather than a loop
(ADR-0006), so the code a thread turns in production is turned here by the tests instead —
the same counting, no thread to wait on and no clock to read.
"""

from __future__ import annotations

import pytest
from PIL import Image

from tests.fakes import (
    SETTLED_COLOUR,
    SETTLING_COLOURS,
    FakeCameras,
    FakeFeed,
    make_images,
    settling_feed,
)
from vision.capture import (
    SETTLING_FRAMES,
    DrainingReader,
    Feed,
    HeldFeed,
    MakeReader,
    OnDemandReader,
    Present,
    drain_in_background,
)
from vision.errors import VisionError


def colour_of_image(image: Image.Image) -> tuple[int, ...]:
    """The colour an image is made of — which says which of a Feed's images it is."""
    pixel = image.convert("RGB").getpixel((0, 0))
    assert isinstance(pixel, tuple)
    return pixel


def open_held(feed: FakeFeed, *, index: int = 0) -> tuple[HeldFeed, OnDemandReader]:
    """The abstraction over one Feed, alongside the reader these tests drive by hand.

    The reader comes back out because it went in: putting a reader on the Feed is a port,
    so a test can hold the one it supplied and read the Feed through it deliberately.
    """
    readers: list[OnDemandReader] = []

    def make_reader(opened_feed: Feed) -> OnDemandReader:
        readers.append(OnDemandReader(opened_feed))
        return readers[-1]

    opened = HeldFeed.open(index, FakeCameras({index: feed}), make_reader=make_reader)
    assert opened is not None
    return opened, readers[0]


def test_reports_no_camera_at_an_index_that_has_none() -> None:
    cameras = FakeCameras({})

    assert HeldFeed.open(0, cameras, make_reader=OnDemandReader) is None
    assert cameras.opened == [0]


def test_settles_the_feed_once_and_says_how_many_frames_that_discarded() -> None:
    feed = settling_feed()

    opened, _ = open_held(feed)

    assert feed.reads == SETTLING_FRAMES
    assert opened.settling_discards == SETTLING_FRAMES


def test_hands_out_the_first_frame_after_settling_with_no_stale_frames() -> None:
    feed = settling_feed()

    opened, _ = open_held(feed)

    present = opened.present()

    assert present.image is not None
    assert colour_of_image(present.image) == SETTLED_COLOUR
    assert present.stale_frames == 0
    assert feed.reads == SETTLING_FRAMES + 1


def test_hands_out_the_most_recent_image_and_counts_the_stale_frames_it_discarded() -> None:
    waiting = make_images([(1, 1, 1), (2, 2, 2), *SETTLING_COLOURS, SETTLED_COLOUR])
    feed = FakeFeed(waiting)
    opened, reader = open_held(feed)

    # Three images arrived while nobody was asking. Two of them are Stale Frames.
    for _ in range(3):
        assert reader.read_once()
    present = opened.present()

    assert present.image is not None
    assert colour_of_image(present.image) == SETTLED_COLOUR
    assert present.stale_frames == 2


def test_hands_out_nothing_when_the_feed_yields_nothing() -> None:
    opened, _ = open_held(FakeFeed([], gives_nothing=True))

    assert opened.present() == Present(image=None, stale_frames=0)


def test_hands_out_nothing_once_the_feed_stops_yielding_partway_through() -> None:
    feed = FakeFeed(make_images([*SETTLING_COLOURS, SETTLED_COLOUR]), stops_after=SETTLING_FRAMES)
    opened, _ = open_held(feed)

    assert opened.present() == Present(image=None, stale_frames=0)


def test_closing_releases_the_camera_and_stops_the_reader() -> None:
    feed = settling_feed()
    opened, reader = open_held(feed)

    opened.close()

    assert feed.closed
    assert reader.read_once() is False


def test_closing_twice_is_not_an_error() -> None:
    feed = settling_feed()
    opened, _ = open_held(feed)

    opened.close()
    opened.close()

    assert feed.closed


def test_leaves_the_feed_closed_when_what_it_was_held_for_fails() -> None:
    feed = settling_feed()
    opened, _ = open_held(feed)

    with pytest.raises(VisionError, match="something went wrong"):
        with opened:
            raise VisionError("something went wrong")

    assert feed.closed


def test_closes_the_feed_when_putting_a_reader_on_it_fails() -> None:
    feed = settling_feed()

    def make_reader(opened_feed: Feed) -> OnDemandReader:
        raise VisionError("no reader for you")

    with pytest.raises(VisionError, match="no reader for you"):
        HeldFeed.open(0, FakeCameras({0: feed}), make_reader=make_reader)

    assert feed.closed


def test_a_draining_reader_counts_every_image_the_present_displaced() -> None:
    """The counting rule ADR-0006 rests on, driven through the loop the thread runs."""
    feed = FakeFeed(make_images([*SETTLING_COLOURS, SETTLED_COLOUR]))
    reader = DrainingReader(feed)

    while reader.drain_once():
        pass
    present = reader.latest()

    assert present.image is not None
    assert colour_of_image(present.image) == SETTLED_COLOUR
    assert present.stale_frames == len(SETTLING_COLOURS)


def test_a_draining_reader_stops_when_the_feed_stops_yielding() -> None:
    feed = FakeFeed(make_images([SETTLED_COLOUR]), stops_after=1)
    reader = DrainingReader(feed)

    assert reader.drain_once() is True
    assert reader.drain_once() is False
    assert feed.reads == 2


def test_a_draining_reader_hands_out_nothing_once_the_feed_is_done() -> None:
    reader = DrainingReader(FakeFeed([], gives_nothing=True))

    assert reader.drain_once() is False
    assert reader.latest() == Present(image=None, stale_frames=0)


def test_a_stopped_draining_reader_neither_reads_nor_waits() -> None:
    """Asking a closed HeldFeed for the present is answered, not waited on."""
    feed = settling_feed()
    reader = DrainingReader(feed)

    reader.stop()

    assert reader.drain_once() is False
    assert reader.latest() == Present(image=None, stale_frames=0)
    assert feed.reads == 0


def test_settling_discards_only_the_frames_the_feed_actually_gave() -> None:
    """A camera another application is holding discards nothing while it settles."""
    opened, _ = open_held(FakeFeed([], gives_nothing=True))

    assert opened.settling_discards == 0


_readers: tuple[MakeReader, MakeReader] = (OnDemandReader, drain_in_background)
"""Both readers really do satisfy the port a HeldFeed puts on a Feed.

mypy checks this, the way the assignments at the bottom of ``tests.fakes`` check the fakes.
The draining one is only ever a MakeReader through the factory that starts its thread, so
that a Feed cannot be handed a reader that nothing is draining.
"""
