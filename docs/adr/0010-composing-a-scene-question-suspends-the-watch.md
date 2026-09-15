# Composing a Scene Question suspends the Watch

[ADR-0009](./0009-a-scene-question-changes-what-a-watch-asks.md) had a Scene Question reach a
running Watch without ever stopping it: a line typed on `stdin` took effect at the next
Cadence, the Watch never paused, and typing was never counted against the machine. The
argument was sound and half of it still stands. The other half did not survive a real room.
When the Observations arrive every couple of seconds — and faster on hardware worth
demonstrating — the terminal is scrolling as the Operator types, their half-written question
interleaving with answers to the question before it, and by the time they have a line typed
the moment they meant it for is three Observations gone. The feature that existed to let an
Operator ask what the audience just asked was, in practice, the one thing they could not do.

So the interaction is split in two, and only one half changes. **A Scene Question that is
already standing still steers the Watch exactly as ADR-0009 described** — it takes effect at
the next Cadence, stands until it is replaced, is echoed once, and is never a skipped Cadence
or a Stale Frame. **Composing a new question, on the other hand, suspends the Watch.** The
Operator presses **Space**; the Watch finishes and prints the Observation in flight, then
stops producing them and reads the line a key at a time until **Enter** submits it or
**Escape** abandons it; and only then does it resume, on the composed question from its next
Cadence. The Watch stops so the Operator can type against a still screen, which is the whole
of what ADR-0009 got wrong.

## The suspension is not a Shortfall

ADR-0006 makes a skipped Cadence mean one thing — *this machine could not keep up* — and
ADR-0009's refusal to interrupt was built to protect that meaning. Suspending the Watch would
seem to break it: the grid marches on while the Operator types, and every instant it passes
is a Cadence the Watch did not observe. It does not break it, because those instants are not
counted. When the Watch resumes it **re-anchors the grid to the moment composing ended** — a
fresh `t0`, as though the Watch had just started — so the resumed Observation is due at once,
nothing the Operator spent typing is a skipped Cadence, and the Stale Frames the Feed piled
up while it was suspended are discarded unremarked. A skipped Cadence still means exactly what
it meant: the machine, not the keyboard. The perceived cost of composing is the seconds the
Operator themselves spent typing, which is not a number about the hardware and is not reported
as one.

## Space, and a terminal read a key at a time

The trigger is a single **Space** press, and the cost of that is that the keyboard is now read
a key at a time rather than a line at a time. ADR-0009 could read `stdin` with `readline`,
letting the terminal do the line editing and the echo; detecting a lone Space with no Enter
after it cannot. So the terminal is put into a mode where each key arrives on its own, and the
Watch does the small amount of line editing a composed question needs — printable keys, and
Backspace — and echoes what is typed itself. This is more than ADR-0009's second thread did,
and it is deliberately no more than it has to be: no history, no cursor movement, no arrows.
It is still a terminal in a talk, not a TUI. On a POSIX terminal the mode chosen leaves
signals on, so Ctrl+C ends the Watch exactly as it always has; on Windows the console reader
raises the interrupt itself so that it reaches the Watch the same way.

The rule — what a run of keys composes to — is a pure function with no terminal and no thread
behind it, so it is pinned in the tests directly. The raw terminal and the daemon reading it
are the boundary around that rule, kept as thin as it can be and left to the real machine, the
way the Feed's draining reader is.

## Composing ends two ways, and an empty line is neither of them

A composition ends by being **submitted** or **abandoned**, and the two are different
intentions that the Watch must not confuse. **Enter** submits the line: a question now stands,
or — where the line was empty — the Watch goes back to the plain description, which is the way
back ADR-0009 already gave an empty line. **Escape** abandons the whole composition: whatever
was standing before the Operator interrupted goes on standing, unechoed, as though they had
never pressed Space. An empty line is a deliberate *return to describing*; Escape is *I
changed my mind, leave it alone*. A Watch that treated them the same would hand an Operator
who thought better of retyping their question the plain description they were trying to keep.

## Considered Options

- **Keep ADR-0009 unchanged (never stop the Watch).** Rejected by experience: the thing it was
  built to enable cannot be done while the screen is moving. The reasoning was right about the
  cost of interrupting and wrong about the cost of not.
- **Answer the composed question the instant Enter is pressed, then resume the old grid.**
  Rejected for ADR-0009's own reason: it spends inference time the grid had committed, so it
  makes composing cost a skipped Cadence — the number that must only ever be the machine's.
  Re-anchoring the grid is what lets the suspension cost the count nothing.
- **A full-screen prompt or a TUI.** Rejected: it hides the very thing the Watch exists to
  show — the answers arriving and changing — behind a modal, and it is far more machinery than
  steering a demo by one key is worth.
- **A hotkey other than Space, or any key at all as the trigger.** Space is the one key an
  Operator can find without looking while talking, and it is not a character they lose from the
  front of a question — the trigger is discarded, and composing starts empty. Triggering on
  *any* key would mean a stray keystroke suspends the Watch mid-answer for no reason the
  audience can see.

## Consequences

**The `Questions` port is two acts, not one.** It grows an `interrupted` — has Space been
pressed — that the Watch asks once an Observation has been shown, and a `compose` that blocks,
reads the line, and hands back what it composed to. `pending`, the one-line poll of ADR-0009,
is gone. Where there is no terminal the port is still `NoQuestions`: never interrupted, so
never composing, and the Watch runs on whatever `--ask` gave it exactly as before.

**The echo is unchanged.** A question that comes to stand is still echoed once, above the first
Observation to answer it, and a return to the plain description is still named rather than
quoted. Only the moment it is composed is new; where it is announced, and that it is announced
exactly once, is what ADR-0009 settled and this keeps.

**A Watch is still not a measurement.** Everything ADR-0009 said here still holds: the
Observations before and after a composed question were not produced under one Workload, and
that is no loss, because nothing a Watch produces is comparable to anything else. `benchmark
--ask` is where a question becomes a Workload worth measuring.
