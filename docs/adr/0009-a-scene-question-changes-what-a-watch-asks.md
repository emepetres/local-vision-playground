# A Scene Question changes what a Watch asks, it does not interrupt it

A Watch produces Observations over a live Feed on a fixed grid of Cadences, and an Operator
watching one will want to ask it something without stopping it — that is the whole of item 4
seen from the live camera. The obvious answer is to treat the question as an event: take a
Frame the moment it is typed, answer it there and then, and let the Watch pick its rhythm
back up. This project does not. **A Scene Question is accepted while the Watch runs, takes
effect at the next Cadence, and stays in effect until the Operator replaces it** — it changes
what the Watch asks rather than interrupting what it was doing.

The reason is that answering immediately would spend inference time that the grid has already
committed, so a question would make the Watch skip a Cadence. Skipped Cadences are the number
[ADR-0006](./0006-a-watch-discards-it-never-queues.md) exists to make countable, and they mean
exactly one thing: *this machine could not keep up*. A count that also goes up when somebody
types is no longer that number, and the demo would have to explain, in front of an audience,
which of the skips were the hardware's fault. Waiting for the next Cadence costs the Operator
up to one interval of perceived latency and costs the report nothing.

A question therefore does not produce its own kind of Observation. There is no interjected
answer sitting between two descriptions: from the next Cadence onward, every Observation the
Watch produces answers the standing Scene Question, on its own Frame, exactly as before. The
Watch's output stays one series of Observations over one Feed, which is what lets a Trigger
be a condition over that series at all.

**The last question wins.** A question typed and then replaced before the next Cadence is
discarded unanswered, rather than queued to be answered a tick later. This is ADR-0006's
argument arriving from the other side of the keyboard: that ADR discards Frames because an
answer about a moment the Operator has already left is a lie told in the same words as a
timely one, and an answer to a question they have already retyped is the same lie. Queuing
questions would also reintroduce the unbounded drift that ADR chose discarding to avoid.

## Considered Options

- **Capture and answer the instant the question is typed.** Rejected above: it buys at most
  one Cadence of responsiveness and pays for it by making the skipped-Cadence count mean two
  different things.
- **Queue the questions and answer them on successive Cadences.** Rejected: lossless, and
  wrong for the same reason queuing Frames is wrong. It also makes the Watch's prompt lag
  behind the keyboard by however many questions are outstanding.
- **Pause the Watch, prompt for the question, resume.** Rejected: a Watch that stops is not
  a Watch, and pausing the grid is precisely what ADR-0006 refuses to do. It would also hide
  the one thing worth showing — the answer changing tick by tick as the scene changes.
- **One-shot questions: answer once, then go back to describing.** Rejected: a single answer
  lost in a column of descriptions demonstrates nothing, and a Trigger (backlog item 6) is a
  condition over a *series* of Observations, which only exists if the question persists.

## Consequences

**A second thread, on the terms the first one was accepted.** ADR-0006 already keeps a reader
draining the Feed; this adds a reader on `stdin`. Typed characters interleave with the
Observations being printed, which is accepted: this is a terminal in a talk, not a TUI.

**Without a terminal there is no reader.** When `stdin` is not a TTY — a pipe, CI, output
redirected to a file — the reader is not started and the Watch runs on whatever `--ask` gave
it, the same way the progress bars take themselves off when the output is not a terminal.

**A changed question is printed, and nothing else about it is counted.** The question is
echoed once, when it takes effect, and the Watch's summary reports what the machine did —
Observations produced, Cadences skipped, Stale Frames discarded — with no tally of how often
the Operator typed. How many questions were asked is not a property of the hardware.

**A Watch is still not a measurement.** A standing question changes the prompt mid-run, so
the Observations before and after it were not produced under one Workload. That is no loss:
ADR-0006 already established that nothing a Watch produces is comparable to anything else.
`benchmark --ask` is where a question becomes a Workload worth measuring.
