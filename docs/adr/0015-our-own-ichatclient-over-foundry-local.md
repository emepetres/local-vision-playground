> **Supersedes [ADR-0002](./0002-custom-ichatclient-adapter-for-foundry-local.md).**

# Our own `IChatClient` over Foundry Local 2.0.1's typed Session API

ADR-0002 took Bruno Capuano's adapter (`elbruno/ElBruno.MAF.FoundryLocal`) because there was
no first-party bridge from Foundry Local to `IChatClient` in .NET, and named the native
Session API Foundry Local 2.0.1 shipped as "the exit we are waiting for" — a first-party
provider, not this. [#62](https://github.com/emepetres/local-vision-playground/issues/62)
found no first-party provider has shipped, and three reasons not to keep waiting on the
adapter for the Agent that #59 specifies:

- **Local-First telemetry.** The adapter has no telemetry switch. This playground disables
  non-essential telemetry unconditionally (backlog item 10); an adapter that cannot honour
  that is not a Local-First dependency, whatever else it gets right.
- **The SDK version.** The adapter pins Foundry Local 1.2.1. `vision/` already targets 2.x
  in-process ([ADR-0004](./0004-target-foundry-local-2x-in-process.md)); an Agent pinned a
  major version behind it is two SDKs to reason about instead of one.
- **Tool calls lost when streaming.** The adapter drops tool calls on the streaming path —
  fatal for an Agent whose whole job is calling `notify_supervisor` and `log_incident`
  through tool calls, per item 47 of #59's spec.

So `agent/Agent/FoundryLocal/FoundryLocalChatClient.cs` implements `IChatClient` directly
over `Microsoft.AI.Foundry.Local` 2.0.1's typed `ChatSession`, `Request`, `Response` and
`Item` types. Bruno Capuano's adapter is credited as the pattern followed — an `IChatClient`
sitting in front of Foundry Local, so Agent Framework's function invocation works unchanged
— even though the adapter itself is not a dependency.

## What it does

- Maps `ChatOptions.Tools` (`AIFunctionDeclaration` schemas) to
  `ChatSession.AddToolDefinition` calls, tool-call items to `FunctionCallContent`, and
  `FunctionResultContent` to `ToolResultItem`s, so Agent Framework's automatic function
  invocation works against it unchanged.
- Serves streaming from the non-streaming path (`GetStreamingResponseAsync` wraps one
  `GetResponseAsync` call and replays it as updates), since tool calls must never be lost in
  a stream.
- Opens a fresh `ChatSession` on every call and replays the whole message history Agent
  Framework hands it as one `Request`: the native session never carries turns from one
  request into the next, the same trap `docs/stack.md` records for `vision/`'s own use of
  `ChatSession`.
- Sets `ORT_TELEMETRY_DISABLED` before the native library loads and
  `DisableNonessentialTelemetry` on `Configuration`, mirroring backlog item 10.
- Resolves the model by a pinned Variant id (`FoundryLocalChatClient.DefaultVariantId`) by
  default, so starting needs no catalogue and no network once it is cached; `--variant`
  names another one.
- Shares `vision/`'s Foundry Local model cache directory by using the same `Configuration.AppName`
  (`"local-vision-playground"`) — Foundry Local derives the per-app cache path from the name,
  so there is no separate cache-directory setting to point at.
- Is the only type in `agent/` that references `Microsoft.AI.Foundry.Local`. Every other type
  talks to the Agent through `IChatClient`, so a first-party provider — the exit ADR-0002
  actually named — still only touches this one class.
- Registers a Variant's Execution Provider before loading it
  (`EnsureExecutionProviderRegisteredAsync`, checking `FoundryLocalManager.DiscoverEps()` and
  calling `DownloadAndRegisterEpsAsync` if needed) — found necessary during the measurement
  below: the `openvino-gpu` and `openvino-npu` Variants otherwise fail to load with "requires
  OpenVINOExecutionProvider which is not registered."

Confirmed while building this: `IModel.GetChatClientAsync()` in 2.0.1 returns an
`OpenAIChatClient` that implements no interfaces — not `Microsoft.Extensions.AI.IChatClient`.
ADR-0002's "no first-party bridge exists" still holds in this version.

## The measurement

A repeatable measurement (`dotnet run --project agent/Agent -- measure --full`) runs 10
synthetic Incidents through a `ChatClientAgent` over `FoundryLocalChatClient`, with
`notify_supervisor` and `log_incident` as its two tools, for each candidate text model on
each Execution Provider Foundry Local offers on this machine (the Zenbook, an ASUS Zenbook
S14 with an Intel Core Ultra 7 258V — `Intel(R) AI Boost` NPU, `Intel Arc 140V` iGPU):

| Candidate | Execution Provider | Variant | Reliable | Total |
| --- | --- | --- | --- | --- |
| qwen3-1.7b | CPU | `qwen3-1.7b-generic-cpu:2` | 0 | 10 |
| qwen3-1.7b | GPU | `qwen3-1.7b-generic-gpu:2` | 0 | 10 (load failure) |
| qwen2.5-1.5b-instruct | CPU | `qwen2.5-1.5b-instruct-generic-cpu:4` | **10** | 10 |
| qwen2.5-1.5b-instruct | GPU | `qwen2.5-1.5b-instruct-openvino-gpu:2` | 0 | 10 |
| qwen2.5-1.5b-instruct | NPU | `qwen2.5-1.5b-instruct-openvino-npu:5` | 0 | 10 |
| qwen3-4b | CPU | `qwen3-4b-generic-cpu:3` | 0 | 10 |
| qwen3-4b | GPU | `qwen3-4b-generic-gpu:2` | 0 | 10 (load failure) |

Full detail, including every run's elapsed time and error text, is recorded in
`docs/benchmarks/tool-call-reliability-zenbook-20260924-175747.md` and `.json`.

Three distinct failure shapes showed up, not one:

- **`generic-gpu` does not load on this machine.** Both `qwen3-1.7b-generic-gpu` and
  `qwen3-4b-generic-gpu` failed every run with `WebGPU execution provider is not supported in
  this build` — a load-time error, not a reliability finding. The `generic-gpu` Variants use
  Foundry Local's WebGPU path, which this Foundry Local build does not carry; the Arc iGPU is
  still reachable, but only through the `openvino-gpu` Variants, and only `qwen2.5-1.5b-instruct`
  publishes one.
- **`qwen3-1.7b` and `qwen3-4b` write the sentence instead of calling the tools, on CPU.**
  Both ran (no load error) and both scored 0/10. `qwen3-1.7b` returned empty assistant text on
  every run — it consumed the turn without emitting a tool call or a reply. `qwen3-4b` wrote
  its reasoning as prose ("Okay, let's see. The user provided a scenario where a part is
  missing…") and never reached a tool call — the exact "written as text" failure item 47 of
  #59 names, and slow besides: 50–100s per Incident against qwen2.5-1.5b-instruct's 15–25s.
- **`qwen2.5-1.5b-instruct` calls exactly one of the two tools, consistently, on both
  accelerated Execution Providers.** `openvino-gpu` called `log_incident` on all 10 runs and
  `notify_supervisor` on none. `openvino-npu` was the mirror image: `notify_supervisor` on all
  10, `log_incident` on none. This is not noise — every run, in both directions — so it reads
  as the accelerated runtime's handling of a second sequential tool call in the same turn, not
  a model failure. Only the plain CPU build called both tools, every time.

**Result:** `qwen2.5-1.5b-instruct-generic-cpu:4` is the only reliable candidate found on this
machine, at 10/10. It is the new `DefaultVariantId`. No accelerated Execution Provider —
NPU or GPU, either family — carried both tool calls reliably; each one silently dropped
exactly one of the two, every time. This is the "no candidate reaches about 8 in 10 anywhere
[accelerated]" case #59 anticipated, one level more specific: the model does not just write
the sentence — one accelerated candidate does reach 10/10, but only unaccelerated.

## Execution Providers

Per #59, the Watch and the Agent never share an Execution Provider by default. The prior
default put the Watch on the Arc iGPU through OpenVINO GenAI and the Agent on the NPU
through Foundry Local's `openvino-npu` text Variants, pending this measurement.

The measurement found the NPU does not carry reliable tool calls (`openvino-npu` scored
0/10), so that prior default does not stand. The pairing does not flip to "Agent on iGPU"
either — `openvino-gpu` also scored 0/10, for the same reason as the NPU (one tool call
dropped, every run). The reliable candidate runs unaccelerated: **the Agent's default is
`qwen2.5-1.5b-instruct` on plain CPU**, and the Watch keeps its own prior default, the Arc
iGPU through OpenVINO GenAI — the two processes still never share an Execution Provider, now
trivially, since the Agent uses none. Item 48 makes the CPU choice a fair trade rather than a
compromise: the Agent's model runs only when a Trigger fires, never per Observation, so it
never competes with the Watch's per-Frame throughput — reliability, not raw speed, decided
this, exactly as anticipated.

## Considered Options

- **Keep Bruno Capuano's adapter, accepting its telemetry and streaming gaps.** Rejected:
  the gaps are exactly what #59's Agent cannot tolerate — a tool call silently lost in a
  stream is an Incident silently lost.
- **Wait for a first-party `IChatClient` provider.** Rejected on this timeline, as ADR-0002
  already found; nothing has shipped since.
- **Write the orchestration against the native Session API directly**, dropping `IChatClient`
  and Agent Framework. Rejected: Microsoft Agent Framework in C# is one of the technologies
  this playground exists to teach, not an implementation detail free to drop — the same
  reasoning ADR-0002 gave for not moving the orchestration to Python.

## Consequences

`FoundryLocalChatClient` is production code, not a throwaway: it ships, and the measurement
above is its verification, not a unit test suite — the same stance `vision/`'s own fakes
take toward the SDK they encode a reading of rather than prove (per #59's testing
decisions). If a first-party `IChatClient` provider ships later, only this one class is
touched to adopt it.
