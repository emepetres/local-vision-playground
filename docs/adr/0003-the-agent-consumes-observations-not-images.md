# The Agent consumes Observations, never images

The C# Agent never receives a Frame. Vision happens entirely in `vision/` (Python), which
produces Observations as text; the Agent reads those Observations over the local endpoint
and decides on Actions. The boundary between the two halves of the playground carries
text, never pixels.

Two independent reasons put the line here.

**The domain says so.** `CONTEXT.md` already defines the Agent as the process that
*consumes* Observations and does not produce them. Handing it a Frame would make it an
Observer, collapsing a distinction the vocabulary depends on.

**The runtime makes it expensive.** Foundry Local's vision payload is not the OpenAI shape:
images go as `{"type": "input_image", "image_data": <base64>, "media_type": …}`, which the
OpenAI SDK does not type and the official Python sample smuggles through `extra_body`. The
community `IChatClient` adapter this project depends on ([ADR-0002](./0002-custom-ichatclient-adapter-for-foundry-local.md))
bridges chat, and there is no reason to expect it to carry that payload. Doing vision from
C# through MEAI would mean extending a non-first-party adapter on the project's most
load-bearing seam.

This is a cost, not a barrier — and since Foundry Local 2.0.1 it is avoidable. That release
gives C# a typed image item on `ChatSession`, natively, bypassing `IChatClient` entirely, so
a C# app could do vision on-device with no adapter at all. The line is therefore held by the
domain reason above: crossing it would make the Agent an Observer whatever the API allows.
The runtime cost is why the line was cheap to draw, not why it is where it is.

## Considered Options

- **Let the Agent do vision as well**, extending the adapter to carry `input_image`.
  Rejected: it takes on maintenance of a non-first-party adapter's most fragile part, and
  it erases the Observation as a concept — the Agent would be reasoning over pixels, and
  Triggers would have nothing stable to fire on.
- **Defer the decision until the Agent is built** (feature 7). Rejected: everything
  upstream — what an Observation carries, whether it is serialisable, whether Structured
  Observations exist at all — depends on the answer. Deciding late means deciding by
  accident.

## Consequences

An Observation must be self-sufficient: whatever a Trigger needs to fire on has to survive
the trip as text. This is what makes Structured Observations (backlog item 5) a
prerequisite for interesting Triggers rather than a nicety — prose is hard to write a
Trigger against.

It also means the two halves can be developed, run and demonstrated independently, and
that swapping the adapter for a first-party provider later touches only chat, not vision.
