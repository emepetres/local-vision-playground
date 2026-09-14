"""The Operator's keyboard, read while a Watch runs.

The `Questions` port (see ``watch.Questions``) has two implementations and this module
holds both ends of the choice between them: a reader on ``stdin`` where there is a terminal
to type at, and the Watch's own ``NoQuestions`` where there is not. It is the keyboard's
side of ADR-0009 — what a typed line *means* belongs to the Watch, which is where a Scene
Question stands; getting the line off the keyboard without the Watch ever waiting for one
belongs here.

Shaped after the Feed's draining reader (``capture.DrainingReader``) because it is the same
problem: something arrives on its own schedule and the Watch reads it on the grid. Both
hold only the most recent thing that arrived, both are turned by a daemon thread, and both
split the loop from the thread turning it — the reading is one call, ``read_once``, so that
the rules a Watch is steered by are pinned with no thread in the test suite at all.
"""

from __future__ import annotations

from threading import Lock, Thread
from typing import TextIO

from vision.watch import NoQuestions, Questions


class TypedLines:
    """Whatever the Operator typed at a running Watch, one line at a time, never waiting.

    The most recent line typed since the last poll and nothing else: a poll takes the line
    it answers with, and a line that arrives while an earlier one is still held displaces
    it unread. That is the last-question-wins rule of ADR-0009, and it lives here so that
    the Watch's loop never sees a queue and cannot grow one.

    A line is answered with as the Operator typed it, minus the newline that ended it —
    an empty line included, because pressing Enter on an empty line is how they stop asking
    and the absence of a line is a different fact from a line with nothing in it.
    """

    def __init__(self, lines: TextIO) -> None:
        self._lines = lines
        self._typed: str | None = None
        self._held = Lock()
        self._stopped = False
        self._thread: Thread | None = None

    def start(self) -> None:
        """Put a thread on the reading. A daemon, so a blocked read cannot outlive exit."""
        self._thread = Thread(target=self._read, name="question-reader", daemon=True)
        self._thread.start()

    def read_once(self) -> bool:
        """Read one line, displacing unread whatever line is still being held.

        False when there is no point reading again — the keyboard has ended, which is what
        a stream with nothing left answers with, or the reader has been stopped.

        The read happens outside the lock: it is the one call here that waits, and a Watch
        asking what is pending must never wait on the Operator's next keystroke.
        """
        if self._stopped:
            return False
        line = self._lines.readline()
        with self._held:
            if self._stopped or not line:
                return False
            self._typed = line.rstrip("\r\n")
            return True

    def _read(self) -> None:
        while self.read_once():
            pass

    def pending(self) -> str | None:
        """The most recent line typed since the last poll, or nothing where none was."""
        with self._held:
            typed, self._typed = self._typed, None
            return typed

    def stop(self) -> None:
        """Come off the keyboard. The stream itself is the caller's to close.

        Nothing is waited for, which is where this parts company with the Feed's reader:
        that one can be woken by the read it is inside returning, and this one is by
        construction sitting in a ``readline`` that only a keystroke will end. Waiting for
        a thread that a stopping Watch has no reason to expect a keystroke for would add
        the timeout to every exit. The thread is a daemon and holds nothing, so leaving it
        where it is costs the process nothing and ends it with the process.

        What it costs is one line: a read already blocked when the Watch ended will come
        back with whatever is typed next and discard it unread. That is the last line of a
        demo that is already over, and the alternative — a Watch that will not exit until
        somebody presses Enter — is the worse one.
        """
        with self._held:
            self._stopped = True
            self._typed = None


def read_the_keyboard(lines: TextIO) -> Questions:
    """A reader on the Operator's keyboard where there is one, and no reader where there is not.

    ``stdin`` that is not a terminal — a pipe, CI, a Watch whose output was redirected to a
    file — is nobody typing, and reading it would be reading a script rather than an
    Operator. So no reader is started at all and the Watch runs on whatever ``--ask`` gave
    it, in the same spirit as the progress bars taking themselves off when the output is
    not a terminal (ADR-0009).
    """
    if not lines.isatty():
        return NoQuestions()
    reader = TypedLines(lines)
    reader.start()
    return reader
