"""Getting a Variant onto the hardware, and timing what that costs.

Everything both commands pay before the first Observation lives here: registering the
Execution Providers, fetching the weights, loading the model. It sits apart from either
command because the two of them measuring it differently is exactly the drift a Benchmark
cannot survive — ``observe`` reporting a Load that ``benchmark`` computes another way
would make the two sets of numbers incomparable while looking identical.

The three are separate functions rather than one because a Benchmark pays them at
different rates: accepting a Variant and bringing it up happen once per Variant, while
registering the Execution Providers happens once for the whole sitting. The order they are
paid in is not arbitrary, and the reason is on each function.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import TextIO

from tqdm import tqdm

from vision.errors import VisionError
from vision.formatting import format_seconds
from vision.inference import FoundryLocal, ModelIdentity, VisionModel, require_vision_task

Clock = Callable[[], float]
"""Reads a monotonic number of seconds. Injected so latencies are deterministic in tests."""


@dataclass(frozen=True)
class ReadyModel:
    """A Variant that is on the hardware, and what getting it there cost.

    Registering the Execution Providers is machine set-up rather than the price of this
    Variant, which is why it is not here: it is paid once per process, by whoever is
    measuring, and a Benchmark of several Variants pays it once for all of them.
    """

    model: VisionModel
    identity: ModelIdentity
    load: float


def accept_variant(foundry: FoundryLocal, model_name: str) -> VisionModel:
    """Resolve a Variant and refuse it if it cannot see a Frame.

    Kept apart from bringing the model up, and ahead of every download either can start —
    the Execution Providers are fetched on a first run too, and waiting for those in order
    to be told the model was never a vision-language model is the same failure the refusal
    exists to prevent. A caller measuring several Variants accepts all of them first, so a
    name that names nothing is caught before the first measurement rather than after it.
    """
    model = foundry.resolve(model_name)
    require_vision_task(model.identity)
    return model


def bring_up(model: VisionModel, *, clock: Clock, out: TextIO) -> ReadyModel:
    """Fetch the weights if they are not here, then load the model, timing the load."""
    download(model, clock=clock, out=out)
    _, load = timed(clock, lambda: load_model(model))
    return ReadyModel(model=model, identity=model.identity, load=load)


def register_execution_providers(
    foundry: FoundryLocal,
    *,
    clock: Clock,
    out: TextIO,
) -> float:
    """Register the Execution Providers, timing and announcing what the port reports.

    Timed apart from the latencies because it is not one of them: it is paid once per
    process, before a model is loaded. Why it is not optional is on the port.
    """
    announced = False

    def announce(line: str) -> None:
        nonlocal announced
        announced = True
        print(line, file=out, flush=True)

    _, seconds = timed(clock, lambda: foundry.register_execution_providers(announce))
    if announced:
        print(file=out)
    return seconds


def load_model(model: VisionModel) -> None:
    """Load the model, turning a native load failure into something to act on.

    A variant that will not load is not a rare accident: Foundry Local picks the hardware
    when the model is named by alias, and it can pick a variant this machine cannot run —
    including one whose ONNX graph is invalid as published. The only lever an Operator has
    is to name a different variant (see docs/stack.md, Constraint 3), so the message says
    that rather than leaving them with a native stack.
    """
    try:
        model.load()
    except VisionError:
        raise
    except Exception as error:
        identity = model.identity
        on = f" on {identity.runtime}" if identity.runtime is not None else ""
        raise VisionError(
            f"{identity.variant} would not load{on} — pin a different variant with"
            " --variant (run `foundry model list`; a -generic-cpu variant is the safe one)."
            f" Foundry Local said: {error}"
        ) from error


def download(model: VisionModel, *, clock: Clock, out: TextIO) -> None:
    """Fetch the weights on first run. Its cost is reported outside the latencies."""
    if model.is_cached:
        return

    # Foundry Local reports progress as a percentage, and calls back far more often than
    # a screen can usefully be redrawn; tqdm does the rate limiting, and takes itself off
    # when nothing is watching (`disable=None` means "disable when this is not a TTY"),
    # which is what keeps the rendered output assertable in the tests.
    with tqdm(
        total=100,
        desc=f"Downloading {model.identity.variant}",
        unit="%",
        bar_format="{desc} |{bar}| {n:.0f}% [{elapsed}<{remaining}]",
        file=out,
        disable=None,
    ) as bar:

        def on_progress(percent: float) -> None:
            bar.update(max(0.0, min(percent, 100.0) - bar.n))

        _, seconds = timed(clock, lambda: model.download(on_progress))

    print(f"Downloaded in {format_seconds(seconds)}\n", file=out, flush=True)


def timed[T](clock: Clock, work: Callable[[], T]) -> tuple[T, float]:
    start = clock()
    result = work()
    return result, clock() - start
