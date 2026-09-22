"""The router a command holds over the Runtimes, in place of a single Foundry Local.

A command does not hold a Runtime; it holds a Router over however many the project has
(CONTEXT.md, "Runtime"). The Router sends each Variant to the Runtime that *claims* its
name, and registers the Execution Providers once for the whole sitting — and only when a
Foundry Local Variant is among the Variants, because registering them is Foundry Local's
alone (ADR-0013).

Two Runtimes sit behind it: Foundry Local, and OpenVINO GenAI for the Variants Foundry
Local's catalogue does not serve here. OpenVINO claims a name that resolves to an on-disk IR
directory carrying a ``provenance.json`` — a provenance slug under the IR cache, or a path to
such a directory — and Foundry Local claims the rest: aliases, Variant names and ids. A name
neither claims is one refusal that names both ways to name a Variant.
"""

from __future__ import annotations

from collections.abc import Callable

from vision.errors import VisionError
from vision.inference import FoundryLocal, OpenVINO, VisionModel


class Router:
    """Resolves each Variant through the Runtime that claims it; registers EPs once."""

    def __init__(self, foundry: FoundryLocal, openvino: OpenVINO | None = None) -> None:
        self._foundry = foundry
        self._openvino: OpenVINO = openvino if openvino is not None else _ClaimsNothing()
        self._foundry_in_the_sitting = False

    def resolve(self, name: str) -> VisionModel:
        """Send the name to the Runtime that claims it.

        OpenVINO claims a name that resolves to an on-disk IR directory; Foundry Local claims
        the rest. Resolving a Foundry Local Variant records that one is in the sitting, which
        is what the registration below is guarded on (ADR-0013) — an OpenVINO Variant records
        nothing, because it has no Execution Providers to register. A name neither claims comes
        back from Foundry Local as a failure, which is turned into the one refusal that names
        both ways to name a Variant.
        """
        if self._openvino.claims(name):
            return self._openvino.resolve(name)
        try:
            model = self._foundry.resolve(name)
        except VisionError as error:
            raise self._named_by_neither(name) from error
        self._foundry_in_the_sitting = True
        return model

    def register_execution_providers(self, announce: Callable[[str], None]) -> None:
        """Register the machine's Execution Providers, once, for a sitting that needs them.

        Registering them is Foundry Local's alone (ADR-0013): it downloads and registers
        every Execution Provider because Foundry Local picks one and nothing selects it
        explicitly, while OpenVINO is told its device and has nothing to register. So a
        sitting that never resolved a Foundry Local Variant has nothing to register — which
        is what keeps the Benchmark's ``providers`` figure meaning what it means, zero where
        Foundry Local was never touched: an ``observe`` or a Benchmark of only OpenVINO
        Variants registers no Execution Providers at all.
        """
        if self._foundry_in_the_sitting:
            self._foundry.register_execution_providers(announce)

    def _named_by_neither(self, name: str) -> VisionError:
        """The one refusal for a name that resolves to neither Runtime, naming both ways.

        A Foundry Local failure to resolve is the second half of "neither claims it" — OpenVINO
        already declined by not claiming — so it is answered here with both ways to name a
        Variant rather than with Foundry Local's own message, which knows only its own.
        """
        return VisionError(
            f"no Variant is named {name!r}. For Foundry Local that is an alias"
            " (qwen3-vl-2b-instruct), a variant name (qwen3-vl-2b-instruct-generic-cpu) or a"
            " variant id, which carries a version (qwen3-vl-2b-instruct-generic-cpu:2); run"
            " `foundry model list` to see what this machine is offered. For OpenVINO it is a"
            " provenance slug resolved under the IR cache (qwen3-vl-2b-instruct-int4-sym-npu)"
            " or a path to an IR directory carrying a provenance.json; export one with"
            " tools/convert/convert.py"
        )


class _ClaimsNothing:
    """The stand-in OpenVINO Runtime for a Router built without one: it claims no name.

    A Router is given both Runtimes on the real path; a caller that hands it only Foundry
    Local — a test about Foundry Local, or a sitting that cannot reach the second Runtime —
    gets one that leaves every name to Foundry Local. ``resolve`` is unreachable, because the
    router only resolves through a Runtime that has claimed the name first.
    """

    def claims(self, name: str) -> bool:
        return False

    def resolve(self, name: str) -> VisionModel:
        raise AssertionError("the null OpenVINO Runtime claims no name, so it resolves none")
