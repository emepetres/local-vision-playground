"""The keyboard a running Watch is steered from: the rule pinned, the terminal left out.

Reading the real keyboard a key at a time is tied to a terminal, a platform and a daemon,
and those are the untested boundary here (ADR-0010). What is pinned is the rule around them:
``compose_a_question`` — what a sequence of keys composes to — is a pure function driven with
a scripted reader and a screen that only records, no terminal and no thread. The choice of
reader is tested through the factory that starts one, with the raw terminal stubbed so no
console is touched; the one test that exercises the daemon drives it through an injected
reader and asserts on the composition it hands back, never on timing.
"""

from __future__ import annotations

import io
import queue
from collections.abc import Callable

import pytest

from vision.keyboard import (
    RawKeyboard,
    _normalise,
    _utf8_continuation_bytes,
    compose_a_question,
    read_the_keyboard,
)
from vision.watch import Abandoned, Composed, NoQuestions

ENTER, ESCAPE, BACKSPACE = "\n", "\x1b", "\x08"


def keys(*sequence: str) -> Callable[[], str | None]:
    """A ``read_key`` over a fixed run of keys, then the end of the keyboard."""
    reader = iter(sequence)
    return lambda: next(reader, None)


class Screen:
    """An ``Echo`` that records what it was asked to draw rather than drawing it."""

    def __init__(self) -> None:
        self.drawn: list[str] = []

    def __call__(self, text: str) -> None:
        self.drawn.append(text)

    @property
    def text(self) -> str:
        return "".join(self.drawn)


def test_a_line_typed_and_entered_is_the_composed_question() -> None:
    screen = Screen()

    resolution = compose_a_question(keys("h", "i", ENTER), screen)

    assert resolution == Composed("hi")
    assert screen.text == "hi"


def test_escape_abandons_whatever_was_composed() -> None:
    """Escape is a different intention from an empty line: leave the standing question be."""
    resolution = compose_a_question(keys("h", "i", ESCAPE), Screen())

    assert resolution == Abandoned()


def test_an_empty_line_composes_an_empty_question() -> None:
    """Empty is composed as empty; that it *means* the way back is the Watch's to decide."""
    assert compose_a_question(keys(ENTER), Screen()) == Composed("")


def test_backspace_rubs_out_the_last_character_typed_and_the_one_on_screen() -> None:
    screen = Screen()

    resolution = compose_a_question(keys("h", "o", BACKSPACE, "i", ENTER), screen)

    assert resolution == Composed("hi")
    assert screen.text == "ho\b \bi"


def test_backspace_on_an_empty_line_does_nothing() -> None:
    screen = Screen()

    resolution = compose_a_question(keys(BACKSPACE, "h", "i", ENTER), screen)

    assert resolution == Composed("hi")
    assert screen.text == "hi"


def test_the_end_of_the_keyboard_submits_what_was_typed_rather_than_abandoning_it() -> None:
    """A ``stdin`` that closed mid-compose asked what had been typed — the forgiving reading,
    and the one an empty line turns into a return to describing anyway."""
    assert compose_a_question(keys("h", "i"), Screen()) == Composed("hi")


def test_a_key_with_nothing_to_do_about_it_is_dropped() -> None:
    """An arrow or function key arrives as the empty string once normalised; it neither joins
    the line nor moves the cursor, so reaching for one does not corrupt the question."""
    screen = Screen()

    resolution = compose_a_question(keys("h", "", "i", ENTER), screen)

    assert resolution == Composed("hi")
    assert screen.text == "hi"


@pytest.mark.parametrize(
    ("raw", "normalised"),
    [("\r", "\n"), ("\n", "\n"), ("\x7f", "\x08"), ("\x08", "\x08"), ("\x1b", "\x1b"), ("a", "a")],
)
def test_normalises_each_key_to_the_one_spelling_the_editor_knows(
    raw: str, normalised: str
) -> None:
    assert _normalise(raw) == normalised


@pytest.mark.parametrize(
    ("lead", "following"), [(0x41, 0), (0xC3, 1), (0xE2, 2), (0xF0, 3), (0x80, 0), (0xFF, 0)]
)
def test_counts_the_utf8_continuation_bytes_a_leading_byte_announces(
    lead: int, following: int
) -> None:
    assert _utf8_continuation_bytes(lead) == following


def test_there_is_no_keyboard_where_there_is_no_terminal() -> None:
    """A pipe, CI, output redirected to a file: no reader is started and the Watch runs on
    whatever ``--ask`` gave it (ADR-0010)."""
    reader = read_the_keyboard(io.StringIO("a question\n"), io.StringIO())

    assert isinstance(reader, NoQuestions)
    assert reader.interrupted() is False


def test_there_is_no_keyboard_where_there_is_no_stdin() -> None:
    """A process launched with no console at all — ``pythonw``, a detached or GUI-launched
    run — has no ``stdin`` to ask ``isatty`` of, which is still nobody typing and must
    degrade to ``NoQuestions`` rather than raising on ``None.isatty()``."""
    reader = read_the_keyboard(None, io.StringIO())

    assert isinstance(reader, NoQuestions)
    assert reader.interrupted() is False


def test_a_watch_nobody_can_steer_is_never_interrupted_and_composes_nothing() -> None:
    steerless = NoQuestions()

    assert steerless.interrupted() is False
    assert steerless.compose() == Abandoned()
    steerless.stop()


def test_a_terminal_is_read(monkeypatch: pytest.MonkeyPatch) -> None:
    """A stream that says it is a terminal gets a real reader, with the raw terminal stubbed
    so the test touches no console: the daemon parks on a reader that never returns a key."""
    parked: queue.Queue[str | None] = queue.Queue()

    def stub_raw_reader(lines: object) -> tuple[Callable[[], str | None], Callable[[], None]]:
        return parked.get, lambda: None

    monkeypatch.setattr("vision.keyboard._raw_reader", stub_raw_reader)
    reader = read_the_keyboard(_Terminal("x"), io.StringIO())

    try:
        assert isinstance(reader, RawKeyboard)
    finally:
        reader.stop()
        parked.put(None)


def test_a_space_press_interrupts_and_the_composed_line_is_handed_back() -> None:
    """The daemon exercised end to end through an injected reader: a Space press interrupts,
    ``compose`` suspends and reads the line, and the composed question is handed back. Driven
    through a blocking queue rather than wall-clock waits, so it asserts on the composition
    and not on timing."""
    typed: queue.Queue[str | None] = queue.Queue()
    screen = io.StringIO()
    keyboard = RawKeyboard(typed.get, screen, restore=lambda: None)
    keyboard.start()

    try:
        for key in (" ", "h", "i", ENTER):
            typed.put(key)
        resolution = keyboard.compose()

        assert resolution == Composed("hi")
        assert keyboard.interrupted() is False
        drawn = screen.getvalue()
        assert "⏸" in drawn
        assert "ask> " in drawn
        assert "hi" in drawn
    finally:
        keyboard.stop()
        typed.put(None)


class _Terminal(io.StringIO):
    """A stream that says it is a terminal, so the keyboard is read rather than ignored."""

    def isatty(self) -> bool:
        return True
