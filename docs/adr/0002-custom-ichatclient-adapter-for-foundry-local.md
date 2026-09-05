# A community adapter bridges Foundry Local to IChatClient in .NET

Agent Framework's documentation states that Foundry Local is not currently supported in
.NET — the `FoundryLocalClient` provider is Python-only — while Microsoft.Extensions.AI
and Agent Framework both expect an `IChatClient`. There is no first-party bridge. We take
Bruno Capuano's adapter (`elbruno/ElBruno.MAF.FoundryLocal`) rather than dropping the C#
orchestration, because the C# Agent is part of what the playground exists to demonstrate.

## Considered Options

- **Write the orchestration in Python**, where the first-party provider exists. Rejected:
  Microsoft Agent Framework in C# is one of the technologies being taught, not an
  implementation detail we are free to swap.
- **Wait for a first-party .NET provider.** Not an option on this timeline.

## Consequences

The adapter is a non-first-party dependency sitting on the load-bearing seam between the
runtime and the Agent. Keep it behind our own boundary so it can be swapped for a
first-party provider when one ships — that swap is the expected end state, not a
hypothetical.
