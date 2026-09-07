"""Unit tests for the pieces of the inference port that hold no native handle."""

from __future__ import annotations

from vision.inference import _version_key


def test_orders_catalogue_versions_numerically() -> None:
    """The day the catalogue reaches double digits, a string comparison picks version 9 over
    version 10 — an older build, silently, with nothing to say it happened."""
    assert max(["9", "10"], key=_version_key) == "10"
    assert max([9, 10], key=_version_key) == 10


def test_sorts_a_version_it_cannot_read_below_the_ones_it_can() -> None:
    """The SDK ships as a native extension with no stubs to say what a version really is, so
    an unnumbered one loses to any number rather than deciding the answer."""
    assert max(["2", "preview"], key=_version_key) == "2"
    assert max(["preview", "release"], key=_version_key) == "release"
