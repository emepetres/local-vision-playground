"""The Router over the Runtimes: which one claims a name, and when EPs are registered.

Foundry Local is the only Runtime behind the Router today, so every name is claimed by it
and the registration guard is trivially met on the command path. These tests drive the
guard directly — a sitting that resolved a Foundry Local Variant against one that resolved
none — because that boundary is what the second Runtime will lean on, and it is invisible
while Foundry Local claims everything (ADR-0013).
"""

from __future__ import annotations

from tests.fakes import FakeFoundry, FakeVisionModel, make_identity
from vision.router import Router


def _announce(_: str) -> None:
    """A register announce callback that says nothing, for a test not about the lines."""


def test_resolves_each_variant_through_the_runtime_that_claims_it() -> None:
    model = FakeVisionModel(make_identity(), [])
    foundry = FakeFoundry({"qwen3-vl-2b-instruct-generic-cpu": model})
    router = Router(foundry)

    resolved = router.resolve("qwen3-vl-2b-instruct-generic-cpu")

    assert resolved is model
    assert foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu"]


def test_registers_the_execution_providers_once_a_foundry_local_variant_is_in_the_sitting() -> None:
    foundry = FakeFoundry.resolving_everything_to(FakeVisionModel(make_identity(), []))
    router = Router(foundry)

    router.resolve("qwen3-vl-2b-instruct")
    router.register_execution_providers(_announce)

    assert foundry.events == ["resolve", "register"]


def test_registers_nothing_when_no_foundry_local_variant_was_resolved() -> None:
    """The structural guard: a sitting that never touched Foundry Local registers no EPs.

    Unreachable through the commands while Foundry Local claims every name, and exactly the
    boundary the second Runtime makes real — an OpenVINO-only sitting has nothing to
    register (ADR-0013).
    """
    foundry = FakeFoundry.resolving_everything_to(FakeVisionModel(make_identity(), []))
    router = Router(foundry)

    router.register_execution_providers(_announce)

    assert foundry.events == []
