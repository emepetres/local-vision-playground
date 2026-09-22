"""The Router over the Runtimes: which one claims a name, and when EPs are registered.

Foundry Local is the only Runtime behind the Router today, so every name is claimed by it
and the registration guard is trivially met on the command path. These tests drive the
guard directly — a sitting that resolved a Foundry Local Variant against one that resolved
none — because that boundary is what the second Runtime will lean on, and it is invisible
while Foundry Local claims everything (ADR-0013).
"""

from __future__ import annotations

import pytest

from tests.fakes import (
    FakeFoundry,
    FakeOpenVINO,
    FakeVisionModel,
    make_identity,
    make_provenance_identity,
)
from vision.errors import VisionError
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


def test_sends_a_name_the_second_runtime_claims_to_the_second_runtime() -> None:
    """An OpenVINO Variant crosses to OpenVINO, not Foundry Local, by the name it claims."""
    ov_model = FakeVisionModel(make_provenance_identity(), [])
    fl_model = FakeVisionModel(make_identity(), [])
    openvino = FakeOpenVINO({"qwen3-vl-2b-instruct-int4-sym-npu": ov_model})
    foundry = FakeFoundry({"qwen3-vl-2b-instruct-generic-cpu": fl_model})
    router = Router(foundry, openvino)

    resolved = router.resolve("qwen3-vl-2b-instruct-int4-sym-npu")

    assert resolved is ov_model
    assert openvino.resolved == ["qwen3-vl-2b-instruct-int4-sym-npu"]
    assert foundry.resolved == []


def test_foundry_local_claims_the_names_the_second_runtime_does_not() -> None:
    """OpenVINO claims only what resolves to an IR; Foundry Local claims the rest."""
    ov_model = FakeVisionModel(make_provenance_identity(), [])
    fl_model = FakeVisionModel(make_identity(), [])
    openvino = FakeOpenVINO({"qwen3-vl-2b-instruct-int4-sym-npu": ov_model})
    foundry = FakeFoundry({"qwen3-vl-2b-instruct-generic-cpu": fl_model})
    router = Router(foundry, openvino)

    resolved = router.resolve("qwen3-vl-2b-instruct-generic-cpu")

    assert resolved is fl_model
    assert openvino.resolved == []
    assert foundry.resolved == ["qwen3-vl-2b-instruct-generic-cpu"]


def test_registers_no_execution_providers_for_an_openvino_only_sitting() -> None:
    """The acceptance the seam exists for: OpenVINO is told its device, so nothing registers.

    A sitting that resolved only an OpenVINO Variant has no Foundry Local Variant in it, so the
    router registers no Execution Providers — the ``providers`` figure is zero where Foundry
    Local was never touched (ADR-0013). The shared journal shows one resolve and no register.
    """
    events: list[str] = []
    openvino = FakeOpenVINO(
        {"qwen3-vl-2b-instruct-int4-sym-npu": FakeVisionModel(make_provenance_identity(), [])},
        events=events,
    )
    foundry = FakeFoundry({}, events=events)
    router = Router(foundry, openvino)

    router.resolve("qwen3-vl-2b-instruct-int4-sym-npu")
    router.register_execution_providers(_announce)

    assert events == ["resolve"]


def test_a_name_neither_runtime_claims_names_both_ways_in_one_refusal() -> None:
    """Claimed by neither: one line that names a Foundry Local Variant and an OpenVINO one."""
    openvino = FakeOpenVINO({})
    foundry = FakeFoundry({})
    router = Router(foundry, openvino)

    with pytest.raises(VisionError) as caught:
        router.resolve("neither-of-them")

    message = str(caught.value)
    assert "\n" not in message
    assert "For Foundry Local that is an alias" in message
    assert "For OpenVINO it is a provenance slug" in message
