"""``watch --emit``: Observations crossing from ``vision/`` to ``agent/`` as JSON Lines.

This is the whole boundary between the two halves of the playground (ADR-0014, amending
ADR-0003): a Watch asked for ``--emit PATH`` writes every Cadence it reaches as one line of
JSON to that file, so that another process can act on what was observed without ever seeing
a Frame. Only a structured Watch may be asked for it — a Trigger acts on the objects
present, and prose has nothing in it for one to act on.

The file is deleted and recreated at the start of every Watch, so that one file always
holds exactly one Watch: a reader who notices the file's identity changed knows to re-arm
whatever it was keeping a streak over. Each line is written and flushed as its Cadence is
reported — nothing here buffers what it writes, because a reader following the file is
reading it live, in the other terminal pane.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, TextIO

from vision.errors import VisionError
from vision.inference import NoShape
from vision.watch import (
    FailedInference,
    Produced,
    Shortfall,
    WatchedStructuredObservation,
    WatchStart,
)


def require_structured_for_emit(emit: Path | None, *, structured: bool) -> None:
    """Refuse ``--emit`` without ``--structured``, before the camera opens or the model loads.

    A Trigger acts on the objects present in a Frame, and prose has nothing in it for one to
    act on — so an emitted file of prose would be a file nothing downstream could read.
    """
    if emit is not None and not structured:
        raise VisionError(
            "--emit needs --structured — a Trigger acts on the objects present, and prose"
            " has nothing in it for one to act on; pass --structured alongside --emit, or"
            " drop --emit"
        )


class EmittedWatch:
    """The open file a Watch writes its Observations to, one line per Cadence reached.

    Deletes and recreates the file on construction, which is what "each Watch starts" means
    for this file (issue #60): whoever is reading it sees a Watch line before anything that
    might be left over from a Watch it never knew about.
    """

    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.unlink(missing_ok=True)
        self._file: TextIO = path.open("w", encoding="utf-8")

    def write_start(self, start: WatchStart, *, at: datetime) -> None:
        """The first line: what this Watch was asked for and which Variant answers it."""
        self._write(
            {
                "type": "watch_start",
                "time": at.isoformat(),
                "variant": start.model.variant,
                "cadence": start.cadence,
            }
        )

    def write_cadence(self, produced: Produced, *, variant: str, at: datetime) -> None:
        """One line for a Cadence reached: its outcome, never a Frame or a path to one."""
        self._write(_cadence_line(produced, variant=variant, at=at))

    def close(self) -> None:
        self._file.close()

    def _write(self, payload: dict[str, Any]) -> None:
        self._file.write(json.dumps(payload) + "\n")
        self._file.flush()


def _cadence_line(produced: Produced, *, variant: str, at: datetime) -> dict[str, Any]:
    """The envelope every Cadence line shares, plus the one outcome it came to.

    Built from a ``Produced`` rather than only a ``WatchedStructuredObservation`` because a
    Cadence can also be a ``FailedInference`` — the Watch goes on past it exactly as the
    console report does (ADR-0006). A prose ``WatchedObservation`` never reaches here:
    ``--emit`` is refused without ``--structured``, so a Watch that is emitting never
    produces one.
    """
    line: dict[str, Any] = {
        "type": "cadence",
        "cadence": produced.order,
        "time": at.isoformat(),
        "variant": variant,
        "shortfall": _shortfall(produced.shortfall),
    }
    if isinstance(produced, FailedInference):
        line["outcome"] = "failed"
        line["error"] = produced.reason
        line["truncated"] = False
        return line
    if not isinstance(produced, WatchedStructuredObservation):
        raise AssertionError(
            "--emit only ever runs alongside --structured, so a Watch that is emitting"
            " never produces a prose Observation"
        )
    line["truncated"] = produced.truncated
    shape = produced.shape
    if isinstance(shape, NoShape):
        line["outcome"] = "no_shape"
        line["reason"] = shape.reason
    else:
        line["outcome"] = "objects"
        line["objects"] = [{"name": obj.name, "count": obj.count} for obj in shape.objects]
    return line


def _shortfall(shortfall: Shortfall) -> dict[str, int] | None:
    """The Shortfall as the reader sees it: nothing where the Cadence was reached on time."""
    if not shortfall.late:
        return None
    return {"skipped_cadences": shortfall.skipped_cadences, "stale_frames": shortfall.stale_frames}
