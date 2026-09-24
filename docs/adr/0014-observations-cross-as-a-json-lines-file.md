# Observations cross to the Agent as a JSON Lines file, not an endpoint

[#59](https://github.com/emepetres/local-vision-playground/issues/59) asked where the two
halves of the playground actually meet. [ADR-0003](./0003-the-agent-consumes-observations-not-images.md)
already said the Agent reads Observations rather than Frames, but it named the seam
loosely — "over the local endpoint" — leaning on the OpenAI-compatible endpoint Foundry
Local happens to serve, which is `vision/`'s seam with its model, not `vision/`'s seam with
the Agent. There was never an endpoint between the two halves; this ADR names what
actually is: **`watch --emit PATH` writes one JSON object per line to a plain file, and the
Agent reads that file.**

A `watch_start` line opens the file — the Variant answering and the Cadence asked for —
and one `cadence` line follows per Cadence reached, whichever outcome it came to: the
objects present, a "no shape", or a failed inference (issue #60 fixes the exact shape). The
file is deleted and recreated at the start of every Watch, so a reader mid-file always
knows which Watch it is reading.

## Considered Options

- **A local HTTP or WebSocket server in `vision/`, polled or subscribed to by the Agent.**
  Rejected: it is a second network seam beside the one ADR-0003 already drew between
  `vision/` and its model, for no gain a file does not already give — both halves still run
  on the same machine, in the same demo, and a server adds a port to bind, a lifecycle to
  keep in step with the Watch's own, and a protocol to version. A file has none of that: it
  exists exactly as long as the Watch that wrote it took to run.
- **A named pipe / FIFO.** Rejected: a pipe has no independent existence between reads — a
  reader that was not attached when a line went by has lost it, and a demo where the Agent
  is started a beat after the Watch (or restarted mid-run while debugging it) is exactly the
  case a teaching playground hits constantly. A plain file can be tailed from the moment it
  exists, opened late, and re-read from the top; `-f`-style following is what `agent/` is
  expected to do.
- **The Agent spawns `watch` as a child process and reads its stdout.** Rejected: it fuses
  the two halves' lifetimes together, so a Watch could no longer be run and watched on its
  own — the demo value of showing raw `vision/` output live in one pane while `agent/` reacts
  in another (the "local-first agents" pattern this project demonstrates) would be lost. It
  also puts a parsing burden on the Agent that stdout was never designed to carry: the human
  report already carries frame-by-frame formatting decisions (ADR-0006 among them) that JSON
  should not have to agree with.

## Consequences

**ADR-0003 and `CLAUDE.md` no longer say "endpoint".** Both are corrected to say what this
ADR fixes: the two halves meet at the JSON Lines file `--emit` writes, not at Foundry
Local's OpenAI-compatible endpoint — that endpoint remains `vision/`'s seam with its own
model (ADR-0002), never the seam with the Agent.

**`--emit` is only ever asked for alongside `--structured`.** A Trigger acts on the objects
present in a Frame; prose has nothing in it for one to act on, so `--emit` without
`--structured` is refused before the camera opens or the model loads (`vision/src/vision/emit.py`).

**The file is git-ignored**, exactly as `vision/frames/` is: it is a live artifact of one
run, not something the repository keeps. `docs/fixtures/watch-emit-contract.jsonl` is the
one example of it that _is_ checked in, so `agent/` has a fixture to develop against before
`vision/` and `agent/` are ever run side by side.
