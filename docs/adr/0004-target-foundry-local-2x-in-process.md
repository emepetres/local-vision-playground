# Target Foundry Local 2.x, in-process

Foundry Local 2.0.1 shipped on 2026-09-01 and replaced the in-process OpenAI-style clients
with a typed Session API. Microsoft Learn still documents 1.2.x, and the only first-party
vision sample (`samples/python/web-server-responses-vision`) is a 1.x sample that talks
OpenAI-Responses over HTTP with a hand-built base64 payload smuggled through `extra_body`.
We target **2.x**, and we call the model **in-process** through `ChatSession` rather than
over the local HTTP endpoint.

Two reasons. The 2.x path is typed end to end — an image is an `ImageItem` carrying raw
bytes and a codec hint, not an untyped dictionary the OpenAI SDK refuses to acknowledge —
so the most fragile part of the 1.x path simply does not exist. And 2.x is what ships: a
teaching playground that demonstrates the deprecated shape teaches the wrong thing, however
well documented that shape currently is.

In-process is the default the SDK itself describes ("No separate service, no HTTP hop");
`manager.start_web_service()` exists for multi-process access. That web service is still
where the C# Agent will meet us ([ADR-0003](./0003-the-agent-consumes-observations-not-images.md)),
but serving it is Foundry Local's job, not `vision/`'s — so nothing in the Python side needs
to speak HTTP to make the Agent possible.

## Considered Options

- **Target 1.2.x**, the documented path with a working vision sample to copy. Rejected: it
  is deprecated on arrival, it requires the `-winml` package split that 2.x merged away, and
  its untyped image payload is precisely the part most likely to break under us.
- **Call the local HTTP endpoint from Python** so the seam the Agent uses is exercised from
  feature 1. Rejected: it adds a network hop and a serialisation to the one number feature 1
  exists to measure, and the HTTP surface is the 1.x-shaped one we chose against.

## Consequences

**No first-party example composes `ChatSession` with `ImageItem`.** Every 2.x vision call in
this repo is assembled from type signatures, not copied from a working Microsoft sample. A
reader comparing this code against Learn will find Learn describing a different API; that is
expected, not a mistake.

**Two lifetime rules leak out of the native layer.** A `MessageItem` borrows its parts'
native pointers without owning them, and `Response` items borrow the response handle — both
must be read inside their scope. This is why nothing native escapes the inference module:
an Observation leaves it with its text already copied out.

**Execution Provider selection is automatic in 2.0.1, and nothing reports what was actually
used.** There is no EP accessor on `Session`, `Response` or the usage record;
`model.info.runtime` describes what the *selected variant* was built for, and
`manager.discover_eps()` describes what is registered on the machine. So a Benchmark Run
names its Execution Provider by pinning a variant id — which is why variant pinning is
available from the first feature, well before the benchmarking feature needs it.
