"""The one error the playground raises at its own boundaries."""

from __future__ import annotations


class VisionError(Exception):
    """A failure an Operator can act on.

    Its message is the whole of what the command prints: one line, saying what went wrong
    and what to do about it. Anything that cannot be phrased that way is a bug, not a
    ``VisionError``.
    """
