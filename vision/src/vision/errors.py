"""The one error the playground raises at its own boundaries."""

from __future__ import annotations


class VisionError(Exception):
    """A failure an Operator can act on.

    Its message is the whole of what the command prints: one line, saying what went wrong
    and what to do about it. Anything that cannot be phrased that way is a bug, not a
    ``VisionError``.
    """


def one_line(error: Exception) -> str:
    """A failure as the single line an Operator reads, whatever raised it.

    A ``VisionError`` is already that line, by construction. Anything else is a fault the
    project did not phrase — Foundry Local, OpenCV, the file system — and its type is part
    of what it says: ``the model server went away`` on its own does not tell an Operator
    whether they are looking at a runtime fault or a bug here.

    Written once because two places turn a failure into a line and they mean the same
    thing by it: the command that is about to end the process, and a Watch that is about
    to carry on past a failed Observation.
    """
    if isinstance(error, VisionError):
        return str(error)
    return f"{type(error).__name__}: {error}"
