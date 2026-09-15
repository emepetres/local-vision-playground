"""The Operator's keyboard, read while a Watch runs.

The `Questions` port (see ``watch.Questions``) has two implementations and this module
holds both ends of the choice between them: a reader on ``stdin`` where there is a terminal
to type at, and the Watch's own ``NoQuestions`` where there is not. It is the keyboard's
side of ADR-0010 — what a composed line *means* belongs to the Watch, which is where a
Scene Question stands; noticing that the Operator wants to ask something, and reading the
line they type once the Watch has stopped for them, belongs here.

Reading the real keyboard a key at a time is what steering by a single Space press needs,
and it is the one part of this that a terminal, a platform and a thread all have a say in.
So it is split the way the rest of the project splits its I/O: the rule — what a sequence
of keys composes to — is a pure function, ``compose_a_question``, pinned with no terminal
and no thread in the test suite at all; the raw terminal and the daemon turning it are the
untested boundary around it, as thin as the boundary can be made.
"""

from __future__ import annotations

import os
import signal
import sys
from collections.abc import Callable
from threading import Event, Lock, Thread
from typing import TextIO

from vision.watch import Abandoned, Composed, NoQuestions, Questions, Resolution

# What one key composes to, once the platform's spelling of it has been normalised away.
# The editor speaks these and nothing else, so it is the same editor on every terminal.
_ENTER = "\n"
_ESCAPE = "\x1b"
_BACKSPACE = "\x08"
_SPACE = " "
_ERASE = "\b \b"
"""Rub one character off the screen: back over it, a space to blank it, back again."""


ReadKey = Callable[[], str | None]
"""Reads one key, blocking for it, and answers ``None`` where the keyboard has ended.

A key is a single printable character, or one of the normalised control keys above, or the
empty string for a keystroke there is nothing to do about — a function key, an arrow, the
second half of a Windows key code. The empty string rather than ``None`` for those, because
``None`` is the end of the keyboard and a Watch that read an arrow as end-of-input would
stop being steerable the first time somebody reached for one.
"""

Echo = Callable[[str], None]
"""Puts what the Operator typed on the screen, because the terminal is not echoing it.

Reading a key at a time means the terminal's own echo is off, so a composed question is
invisible unless it is written back out as it is typed. This is that writing-back, kept out
of the pure editor so the rule the editor is can be pinned without a screen.
"""


def compose_a_question(read_key: ReadKey, echo: Echo) -> Resolution:
    """Read a line the Operator composes at a suspended Watch, and say how it ended.

    The rule and nothing but the rule: keys in, a ``Resolution`` out, the reading and the
    writing both handed in. A printable key joins the line and is echoed; Backspace rubs the
    last one out; Enter submits what stands as a ``Composed`` line, and Escape abandons the
    whole of it. The end of the keyboard is a submit rather than an abandon — a Watch whose
    ``stdin`` closed mid-compose asked what had been typed, which is the more forgiving of
    the two and the one an empty line then turns into a return to describing anyway.

    A key with nothing to do about it — an arrow, a function key — is dropped without
    joining the line or moving the cursor, so reaching for one does not quietly corrupt the
    question. What a submitted line *means*, empty or not, is not decided here: that is the
    Watch's (see ``watch._standing_question``); this only reads the line off the keyboard.
    """
    typed: list[str] = []
    while True:
        key = read_key()
        if key is None or key == _ENTER:
            return Composed("".join(typed))
        if key == _ESCAPE:
            return Abandoned()
        if key == _BACKSPACE:
            if typed:
                typed.pop()
                echo(_ERASE)
            continue
        if len(key) == 1 and key.isprintable():
            typed.append(key)
            echo(key)


class RawKeyboard:
    """The real keyboard, read a key at a time, so a Space press can suspend the Watch.

    One daemon thread reads the terminal for as long as the Watch runs. Until a Space press
    it is only watching for that Space; the Watch asks ``interrupted`` once an Observation
    and otherwise the thread's reading never touches the Watch. When Space is pressed the
    thread says so — an Operator wants to ask something — and then waits for the Watch to
    grant it the screen, so that the Observation in flight finishes printing before the
    prompt appears rather than tangling with it. ``compose`` is the Watch granting that: it
    releases the thread to run the editor and blocks until the line is done, which is the
    suspension the whole of ADR-0010 is about.

    The thread is a daemon and holds nothing, so a read still blocked when the Watch ends
    dies with the process rather than holding exit open until the next keystroke — the same
    bargain the Feed's draining reader strikes, and for the same reason.
    """

    def __init__(self, read_key: ReadKey, out: TextIO, *, restore: Callable[[], None]) -> None:
        self._read_key = read_key
        self._out = out
        self._restore = restore
        self._held = Lock()
        self._interrupted = False
        self._resolution: Resolution | None = None
        self._stopped = False
        self._grant = Event()
        self._done = Event()
        self._thread: Thread | None = None

    def start(self) -> None:
        """Put a daemon on the keyboard, so a blocked read cannot outlive exit."""
        self._thread = Thread(target=self._run, name="question-reader", daemon=True)
        self._thread.start()

    def _run(self) -> None:
        while not self._stopped:
            key = self._read_key()
            if key is None or self._stopped:
                return
            if key != _SPACE:
                continue
            # The Operator wants to ask something. Say so at once, before the in-flight
            # Observation has finished, so a Space press is acknowledged the instant it is
            # made rather than a whole inference later.
            self._write("\n⏸  composing a question (finishing this observation)…\n")
            with self._held:
                self._interrupted = True
            # Wait for the Watch to finish and print that Observation and hand the screen
            # over. Anything typed in the meantime waits in the terminal and is read, and
            # echoed, once the editor below starts — so no keystroke is lost and none lands
            # on top of the Observation still being printed.
            self._grant.wait()
            self._grant.clear()
            if self._stopped:
                return
            self._write("ask> ")
            resolution = compose_a_question(self._read_key, self._write)
            self._write("\n")
            with self._held:
                self._resolution = resolution
                self._interrupted = False
            self._done.set()

    def _write(self, text: str) -> None:
        self._out.write(text)
        self._out.flush()

    def interrupted(self) -> bool:
        with self._held:
            return self._interrupted

    def compose(self) -> Resolution:
        """Suspend the Watch: let the thread read the line, and block until it is done."""
        self._done.clear()
        self._grant.set()
        self._done.wait()
        with self._held:
            resolution, self._resolution = self._resolution, None
        return resolution if resolution is not None else Abandoned()

    def stop(self) -> None:
        """Come off the keyboard and put the terminal back the way it was found.

        Nothing is waited for: the thread is by construction sitting in a read that only a
        keystroke will end, and a stopping Watch has no reason to expect one. It is a daemon
        and holds nothing, so leaving it where it is costs the process nothing. The terminal
        is restored here rather than by the thread, because whoever ends the Watch must be
        able to end it without the Operator pressing a key — an interruption, a count met, a
        Feed that died — and the thread is not guaranteed to run again to do it.
        """
        with self._held:
            self._stopped = True
        # Release the thread if it is waiting to compose, so it does not sit on ``_grant``
        # forever once the Watch that would have granted it is gone.
        self._grant.set()
        self._restore()


def read_the_keyboard(lines: TextIO | None, out: TextIO) -> Questions:
    """A reader on the Operator's keyboard where there is one, and no reader where there is not.

    ``stdin`` that is not a terminal — a pipe, CI, a Watch whose output was redirected to a
    file — is nobody typing, and reading it would be reading a script rather than an
    Operator. So no reader is started at all and the Watch runs on whatever ``--ask`` gave
    it, in the same spirit as the progress bars taking themselves off when the output is
    not a terminal (ADR-0010).

    ``None`` is the same fact one step further along: a process launched without a console
    at all (``pythonw`` on Windows, a detached or GUI-launched run) has no ``stdin`` object
    to ask ``isatty`` of. That is still nobody typing, so it degrades to ``NoQuestions``
    rather than raising — a Watch with no keyboard runs, it just cannot be steered.
    """
    if lines is None or not lines.isatty():
        return NoQuestions()
    read_key, restore = _raw_reader(lines)
    keyboard = RawKeyboard(read_key, out, restore=restore)
    keyboard.start()
    return keyboard


def _raw_reader(lines: TextIO) -> tuple[ReadKey, Callable[[], None]]:
    """Open the terminal for a key at a time, and hand back how to read it and close it again.

    Two terminals, one interface. On Windows the console is read through ``msvcrt`` and needs
    no mode changed, so there is nothing to put back. On a POSIX terminal the tty is put into
    cbreak — no line buffering and no echo, but signals left on, so Ctrl+C still ends the
    Watch the way it always has — and the settings it had are restored when the Watch ends.
    """
    if sys.platform == "win32":
        return _windows_reader(), lambda: None
    return _posix_reader(lines)


def _windows_reader() -> ReadKey:
    """Read the Windows console a key at a time through ``msvcrt``.

    ``getwch`` does not raise on Ctrl+C — it hands back the character — so this raises the
    interrupt itself, on the main thread, which is where the Watch is waiting to catch it.
    A function or arrow key arrives as a two-character sequence led by a null or ``0xe0``;
    the second half is read and dropped, and the key comes back as one there is nothing to
    do about rather than as half of one that would corrupt the line.
    """
    import msvcrt

    def read_key() -> str | None:
        char = msvcrt.getwch()
        if char == "\x03":
            signal.raise_signal(signal.SIGINT)
            return ""
        if char in ("\x00", "\xe0"):
            msvcrt.getwch()
            return ""
        return _normalise(char)

    return read_key


def _posix_reader(lines: TextIO) -> tuple[ReadKey, Callable[[], None]]:
    """Read a POSIX terminal a key at a time, cbreak while the Watch runs, restored after.

    Signals are left on, so Ctrl+C reaches the Watch as it always did and is not something
    this has to spell out. An Escape that is the start of an arrow's escape sequence is not
    told apart from an Escape pressed alone: on this terminal an arrow abandons the
    composition, which is a known corner and the price of not reaching for a full terminal
    library to steer a demo by one key.
    """
    import termios
    import tty

    fd = lines.fileno()
    saved = termios.tcgetattr(fd)  # type: ignore[attr-defined]  # POSIX-only, never imported on Windows
    tty.setcbreak(fd)  # type: ignore[attr-defined]

    def read_key() -> str | None:
        data = os.read(fd, 1)
        if not data:
            return None
        char = data
        # A leading byte with the high bit set is the start of a UTF-8 character; read the
        # continuation bytes it announces so a non-ASCII key arrives whole.
        extra = _utf8_continuation_bytes(data[0])
        if extra:
            char += os.read(fd, extra)
        if char == b"\x03":
            signal.raise_signal(signal.SIGINT)
            return ""
        return _normalise(char.decode("utf-8", "replace"))

    def restore() -> None:
        termios.tcsetattr(fd, termios.TCSADRAIN, saved)  # type: ignore[attr-defined]

    return read_key, restore


def _utf8_continuation_bytes(lead: int) -> int:
    """How many bytes follow this UTF-8 leading byte, or none where it is not a leading one."""
    if lead < 0x80 or lead >= 0xF8:
        return 0
    if lead >= 0xF0:
        return 3
    if lead >= 0xE0:
        return 2
    if lead >= 0xC0:
        return 1
    return 0


def _normalise(char: str) -> str:
    """The one spelling of a key the editor knows, whatever the terminal called it.

    Carriage return and newline are both Enter; delete and backspace are both Backspace; a
    lone Escape is Escape. Everything else — every printable character and every control key
    there is nothing to do about — is handed on as it came, for the editor to keep or drop.
    """
    if char in ("\r", "\n"):
        return _ENTER
    if char in ("\x7f", "\x08"):
        return _BACKSPACE
    if char == "\x1b":
        return _ESCAPE
    return char
