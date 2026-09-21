"""The router a command holds over the Runtimes, in place of a single Foundry Local.

A command does not hold a Runtime; it holds a Router over however many the project has
(CONTEXT.md, "Runtime"). The Router sends each Variant to the Runtime that *claims* its
name, and registers the Execution Providers once for the whole sitting — and only when a
Foundry Local Variant is among the Variants, because registering them is Foundry Local's
alone (ADR-0013).

Foundry Local is the only Runtime behind the Router today; the second one arrives later.
So every name is claimed by Foundry Local here, and the guard on registration is trivially
met on the command path — it is structural, exercised for real once a Runtime that
registers nothing sits beside Foundry Local.
"""

from __future__ import annotations

from collections.abc import Callable

from vision.inference import FoundryLocal, VisionModel


class Router:
    """Resolves each Variant through the Runtime that claims it; registers EPs once."""

    def __init__(self, foundry: FoundryLocal) -> None:
        self._foundry = foundry
        self._foundry_in_the_sitting = False

    def resolve(self, name: str) -> VisionModel:
        """Send the name to the Runtime that claims it.

        Foundry Local claims every name in this ticket — an alias, a Variant name or a
        Variant id — so the second Runtime does not exist to discriminate against yet. What
        resolving one records is that a Foundry Local Variant is in the sitting, which is
        what the registration below is guarded on (ADR-0013).
        """
        self._foundry_in_the_sitting = True
        return self._foundry.resolve(name)

    def register_execution_providers(self, announce: Callable[[str], None]) -> None:
        """Register the machine's Execution Providers, once, for a sitting that needs them.

        Registering them is Foundry Local's alone (ADR-0013): it downloads and registers
        every Execution Provider because Foundry Local picks one and nothing selects it
        explicitly, while the second Runtime is told its device and has nothing to register.
        So a sitting that never resolved a Foundry Local Variant has nothing to register —
        which is what keeps the Benchmark's ``providers`` figure meaning what it means, zero
        where Foundry Local was never touched. Trivially always registered here, because
        Foundry Local claims everything; the guard is structural until the second Runtime
        lands.
        """
        if self._foundry_in_the_sitting:
            self._foundry.register_execution_providers(announce)
