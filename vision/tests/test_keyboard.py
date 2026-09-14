"""The keyboard a running Watch is steered from: one reader, turned by hand.

The reader's loop is one call — ``read_once`` — and the thread is nothing but a loop over
it, which is the same seam the Feed's draining reader is split at (``capture.DrainingReader``)
and for the same reason: every rule a Watch is steered by is then pinned by turning the
loop by hand, with no thread and no wall-clock waiting. Only the choice of reader is tested
through the factory that starts one, and even there the thread is never what is asserted on.
"""

from __future__ import annotations

import io

from vision.keyboard import TypedLines, read_the_keyboard
from vision.watch import NoQuestions

QUESTION = "is anyone looking at the camera?"
REPLACEMENT = "how many people are there?"


def typed(*lines: str) -> io.StringIO:
    """A keyboard nobody is at any more: the lines that were typed, and then the end."""
    return io.StringIO("".join(f"{line}\n" for line in lines))


def test_a_line_typed_is_the_question_pending_at_the_next_poll() -> None:
    reader = TypedLines(typed(QUESTION))

    assert reader.read_once()
    assert reader.pending() == QUESTION


def test_a_question_answered_once_is_not_answered_again() -> None:
    """The poll takes the line: a Watch asked twice between two lines is asked about the
    keyboard, not about the question already standing, and a question that came back would
    be re-echoed as though the Operator had typed it a second time."""
    reader = TypedLines(typed(QUESTION))
    reader.read_once()

    assert reader.pending() == QUESTION
    assert reader.pending() is None


def test_the_last_line_typed_between_two_polls_is_the_one_that_survives() -> None:
    """The collapsing rule is the port's rather than the loop's (ADR-0009): whatever else
    was typed is discarded here, so the Watch never sees a queue and cannot grow one."""
    reader = TypedLines(typed(QUESTION, REPLACEMENT))
    reader.read_once()
    reader.read_once()

    assert reader.pending() == REPLACEMENT
    assert reader.pending() is None


def test_an_empty_line_is_a_line_and_not_the_absence_of_one() -> None:
    """Pressing Enter on an empty line is how an Operator stops asking, so it has to reach
    the Watch as something typed. What it then means is the Watch's (``_standing_question``)."""
    reader = TypedLines(typed(""))
    reader.read_once()

    assert reader.pending() == ""


def test_a_line_carries_none_of_the_newline_it_arrived_with() -> None:
    """Including the one a terminal on Windows sends, which would otherwise travel into the
    prompt and be echoed back at the Operator as part of their own question."""
    reader = TypedLines(io.StringIO(f"{QUESTION}\r\n"))
    reader.read_once()

    assert reader.pending() == QUESTION


def test_stops_reading_at_the_end_of_the_keyboard() -> None:
    """A stream that has ended answers every read with nothing, so a loop that went on
    turning would spin on it for as long as the Watch ran."""
    reader = TypedLines(typed(QUESTION))
    reader.read_once()

    assert not reader.read_once()


def test_a_stopped_reader_neither_reads_again_nor_answers_with_what_it_held() -> None:
    """Stopping is the Watch being over, and there is nothing left for a question to steer."""
    reader = TypedLines(typed(QUESTION, REPLACEMENT))
    reader.read_once()
    reader.stop()

    assert not reader.read_once()
    assert reader.pending() is None


def test_stopping_a_reader_nothing_ever_turned_is_not_an_error() -> None:
    """Which is the path the run-up fails on: the Watch's take-down stops the reader
    whether or not a thread was ever put on it."""
    TypedLines(typed(QUESTION)).stop()


def test_there_is_no_keyboard_where_there_is_no_terminal() -> None:
    """A pipe, CI, output redirected to a file: no reader is started at all and the Watch
    runs on whatever ``--ask`` gave it (ADR-0009)."""
    reader = read_the_keyboard(typed(QUESTION))

    assert isinstance(reader, NoQuestions)
    assert reader.pending() is None


def test_a_terminal_is_read() -> None:
    lines = _Terminal(f"{QUESTION}\n")
    reader = read_the_keyboard(lines)

    try:
        assert isinstance(reader, TypedLines)
    finally:
        reader.stop()


class _Terminal(io.StringIO):
    """A stream that says it is a terminal, so the keyboard is read rather than ignored."""

    def isatty(self) -> bool:
        return True
