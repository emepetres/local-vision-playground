# A Watch discards, it never queues

A Watch produces Observations over a live Feed at a requested Cadence, and on any machine
worth demonstrating there will be moments when one inference takes longer than the Cadence
allows. The obvious answer is to queue: keep every Frame the Feed produced and observe them
all, late but complete. This project does the opposite. **When a Watch cannot keep its
Cadence it skips the moments it has already passed, discards the Stale Frames the Feed
buffered meanwhile, and observes the present** — and it says how many of each it lost.

The reason is that lateness here is not a delay, it is a lie. An Observation describes what
is in front of the camera; an Observation of a queued Frame describes what *was* in front of
it, while presenting itself in exactly the same words. Queuing does not slow a Watch down by
a fixed amount either — it slows it down by an amount that grows without bound for as long
as the machine is short of the Cadence, so a Watch left running through a demo drifts from
seconds behind to minutes behind. The whole point of the playground is what local inference
*feels like*, and a stream of confident descriptions of a room somebody left ninety seconds
ago is the wrong lesson taught convincingly.

Discarding makes the shortfall finite and, more importantly, **countable**. Because the
Cadence is a fixed grid — capture at `t0`, `t0 + N`, `t0 + 2N` — and not a sleep after each
Observation, the moments a Watch missed are a number rather than an impression. That number
is the honest report of what the hardware could not do, and it is the same fact `benchmark`
reports as a latency, seen from the side the Operator actually experiences: pin the CPU
variant and the Cadence starts being skipped, in front of the audience, without a table.

## Considered Options

- **Queue every Frame and observe them all.** Rejected above: lossless, unbounded lag, and
  a failure mode that is invisible in the output because a late Observation looks exactly
  like a timely one.
- **Queue with a bounded buffer, dropping the oldest when it fills.** Rejected: it is
  discarding, with a constant delay of the buffer's depth added on top and a knob nobody
  can choose a value for. Skipping to the newest Frame is this option with the buffer set
  to one, which is the only depth with a defensible justification.
- **No Cadence at all — capture as soon as the model is free.** Not rejected: it is what
  `--every 0` does, and under it the question cannot arise. It is not the default because
  it removes the very tension the Watch exists to demonstrate, and because a machine asked
  for every Observation it can produce is a machine whose thermal behaviour is measuring
  itself rather than the model.

## Consequences

**A Feed held open needs a vocabulary the single-shot path did not.** Settling discards and
Stale Frames are the same call and different facts (`CONTEXT.md`), and a Watch reports them
separately: the first is paid once at start-up, the second on any Observation that ran late.

**The count is a count, not an estimate.** OpenCV offers no way to read a Feed until it is
empty — `read()` always returns something — so discarding "whatever arrived meanwhile" cannot
be discovered by reading until nothing comes back, and inferring it from elapsed time would be
a guess presented as a measurement. A Watch therefore keeps a reader draining the Feed
continuously and holding only the most recent image, which is what makes the number of Stale
Frames exact. That is real complexity — a thread and its orderly shutdown — accepted because
the count is the concrete half of this decision's argument, and an estimated one would not
support it.

**Two failures stop meaning the same thing.** A failed inference is one line and the Watch
continues, because the next Cadence can still produce something. A Feed that dies ends the
Watch, because it cannot. Only the second is an error the process exits non-zero on.

**Nothing a Watch produces is comparable to anything else.** Every Observation runs against
a different Frame by construction, so a Watch is not a measurement and its numbers never
become a Benchmark. That separation is deliberate; `benchmark` exists for the other
question.
