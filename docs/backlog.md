# Backlog

The high-level thread of the demo. Each item is one demonstrable feature, small enough to
show in a single sitting. Issues are opened per item as it is picked up — they are not
mirrored here. An item's number identifies it — ADRs, issues and commits cite it — and
never changes; the list is in the order the items are worked.

How these items map onto the anchor scenario is in
[`business-value.md`](./business-value.md#how-the-backlog-maps-onto-the-scenario).

## Committed

- [x] **1. One Observation, on demand.** Capture a Frame from the camera (or take an
      image file), send it to the local model, print the Observation and the latency it
      took. Runs and exits.
- [x] **2. Benchmark Runs across Execution Providers.** The same fixed workload against
      the CUDA-GPU variant and the CPU variant, N times each, printed as a table and
      persisted to the repo so the numbers survive a demo that goes wrong. Each Benchmark
      Run is named against its Hardware Profile.
- [x] **3. A continuous series of Observations.** A Watch: Observations one after another
      over a live Feed, at a requested Cadence, and a deliberate answer to what happens
      when inference is slower than the Cadence — it skips the moments it has passed,
      discards the Stale Frames and says how many of each it lost
      ([ADR-0006](./adr/0006-a-watch-discards-it-never-queues.md)).
- [x] **4. Scene Questions.** Ask a natural-language question about the current Frame and
      get an answer from that Frame alone — no follow-ups, because nothing the model was
      told a moment ago is still there. Three surfaces: `observe --ask` replaces the fixed
      prompt for one Frame; `benchmark --ask` makes the question a Workload, so that a
      short answer and a description are measured as the different amounts of work they
      are; and a Watch accepts a question typed while it runs, without stopping. In a Watch
      the question is not an interruption — it takes effect at the next Cadence and stays
      in effect until it is replaced, so that a skipped Cadence goes on meaning _this
      machine could not keep up_ and nothing else
      ([ADR-0009](./adr/0009-a-scene-question-changes-what-a-watch-asks.md)).
- [x] **5. Structured Observations.** Ask the model for a fixed shape — the list of
      objects present in a Frame — instead of prose. See
      [the Structured Observations guide](./guide/structured.md).
- [x] **8. A second Runtime: the NPU and the Arc GPU via OpenVINO GenAI.** Foundry
      Local's vision path on the demo machine is CPU-only — `qwen3-vl` ships no GPU or NPU
      build there — so the machine's own accelerators are reached through a second Runtime,
      OpenVINO GenAI, running the same weights it exports once. That turns the Execution
      Provider axis into a Benchmark of four rows across two Runtimes (FL-CPU, OV-CPU,
      OV-GPU, OV-NPU), with the two CPU rows as the calibration between them. Built and
      specified behind
      [ADR-0012](./adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md) (two
      Runtimes) and
      [ADR-0013](./adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)
      (the second Runtime is an adapter behind an unchanged model port). On a model this
      small the NPU is **not** the throughput winner — it leads only on TTFT — so its story
      is a third Execution Provider with its own profile, not peak tokens/second. See
      [Reaching the NPU and the Arc GPU](./guide/runtimes.md) for how to run it.
- [ ] **10. Runs without a network once prepared.** Preparing the machine may use the
      network — downloading the model, exporting a Variant, caching the Foundry Local
      catalogue, benchmarking. Operating it may not: once prepared, `observe` and `watch`
      run with Wi-Fi off. Runtime telemetry is disabled by default (`ORT_TELEMETRY_DISABLED`,
      since Foundry Local otherwise sends a process event even with non-essential telemetry
      off), the demo pins its Variant id, and the airplane-mode rehearsal — including how
      long a start takes with no catalogue to reach — is documented as a moment of the
      demo script.
- [ ] **11. Spike: can the 2B model see the work cell?** Before any Trigger is promised,
      measure whether `qwen3-vl-2b` resolves the conditions of item 6 — a part missing from
      the tray, no gloves, a foreign object in the zone — through Structured Observations on
      real photos of the desk-scale work cell. It also settles whether the repetition loops
      the int4 OpenVINO Variants fell into on the demo laptop come from the model or from the
      export. The photos then become the Benchmark's fixed Workload, so that what is
      measured is the scenario's work rather than a generic room. A condition the 2B model
      cannot resolve is a finding, not a failure: it is the case for the 4B and 8B models
      (Exploratory).
- [ ] **6. Triggers.** Fire when a condition over Observations holds — the conditions of
      the [anchor scenario](./business-value.md#the-anchor-scenario-a-workstation-on-a-production-line),
      staged as a desk-scale work cell: a part is missing from the tray, someone is working
      the cell without gloves, a foreign object is in the zone — those of them the spike
      (item 11) found the model can resolve.
- [ ] **7. The Agent, in C#.** Microsoft Agent Framework consuming Observations over the
      local endpoint and invoking Actions when Triggers fire. The Agent never sees an
      image ([ADR-0003](./adr/0003-the-agent-consumes-observations-not-images.md)).
      Its Actions stay on the machine: a desktop notification — the supervisor finds out —
      and an entry in a local incident log holding the Trigger, the Observation that fired
      it and the time. Never a Frame: what is kept is a sentence, never a face.
- [ ] **9. Capacity and cost.** From a Benchmark and a requested Cadence, how many cameras
      a Hardware Profile could serve at most — ⌊Cadence / median inference latency⌋, one
      model serving the Feeds in series — next to what the same Observations would cost
      from a cloud vision API, priced per image from a versioned data file that cites each
      price and the date it was read. An upper bound per Hardware Profile, stated as one:
      concurrency on an NPU or GPU does not scale linearly, and no figure transfers to
      another machine. Nothing is requested from the cloud to produce it.

## Exploratory

Written down so it is not lost. Not promised.

- [ ] **Model comparison on fixed hardware.** `qwen3-vl` at 2B / 4B / 8B, and against
      other local VLMs (`qwen3.5-*`, `ministral-3-3b`, `gemma-4-e2b`) — the variable an
      Operator can actually change on their own machine.
- [ ] **The cloud comparison.** Phi-4-reasoning-vision in Microsoft Foundry, not to run
      it as part of the demo but to make "when does local actually compensate?" concrete.
- [ ] **Live transcription.** The Live Transcription API added in Foundry Local 1.1,
      putting vision and speech on the same laptop with nothing leaving it.
- [ ] **Phi-4-multimodal, compiled by hand** for Foundry Local — the path
      [ADR-0001](./adr/0001-qwen3-vl-as-the-local-vision-model.md) rejected as the
      primary route but kept as a comparison exercise.
