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

There is a second way out, and we are not taking it. Foundry Local 2.0.1 ships a native
typed Session API for C# (`Microsoft.AI.Foundry.Local`), which removes the need for any
adapter — but it is an SDK, not an `IChatClient`, so using it means leaving MEAI and Agent
Framework behind. Those are the technologies the playground exists to teach, so the exit we
are waiting for remains a first-party `IChatClient` provider, not the native SDK.
