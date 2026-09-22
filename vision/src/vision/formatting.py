"""How one measured value is written down.

The smallest layer of the reporting: a number, a Frame, a model identity, rendered the
same way wherever they appear. It is separate from ``reporting`` so that a caller which
only needs a duration — the download line in ``startup``, say — does not have to reach
through a whole report to get one, and so that the two commands cannot write the same
number two different ways.
"""

from __future__ import annotations

from vision.capture import WORKING_RESOLUTION, Frame
from vision.inference import ModelIdentity


def format_seconds(seconds: float) -> str:
    return f"{seconds:.3f} s"


def format_tokens(tokens: float) -> str:
    """Whole tokens where the value is one, one decimal where it is a median of two.

    A median over an even number of Benchmark Runs falls between two samples, and writing
    it as a whole number would claim a precision the samples do not have.
    """
    return f"{tokens:.0f}" if float(tokens).is_integer() else f"{tokens:.1f}"


def format_tokens_per_second(rate: float) -> str:
    return f"{rate:.1f}"


def format_model(identity: ModelIdentity) -> str:
    """The Variant, and beside it what identifies it — the Alias and what it ran on.

    An OpenVINO Variant has no Alias (CONTEXT.md, "Alias"), so it is left out rather than
    printed as ``alias None``; the slug that names it and the device it ran on are the
    whole of what there is to say.
    """
    details = []
    if identity.alias is not None:
        details.append(f"alias {identity.alias}")
    if identity.ran_on is not None:
        details.append(identity.ran_on)
    if not details:
        return identity.variant
    return f"{identity.variant} ({', '.join(details)})"


def format_frame(frame: Frame) -> str:
    """Name the working resolution as well as this Frame's own.

    They only coincide for a 4:3 Frame — a 16:9 one fits the same box at 640x360 — and it
    is the working resolution that fixes the workload.
    """
    working = "x".join(str(edge) for edge in WORKING_RESOLUTION)
    return f"{frame.width}x{frame.height} {frame.codec}, fit to {working}, from {frame.provenance}"


def format_capture(seconds: float, frame: Frame) -> str:
    """Name the settling discards where their cost is, rather than beside it.

    They are not overhead around the capture: they are the capture, and the number the
    Operator is shown is the wait they actually sat through.
    """
    if frame.settling_discards == 0:
        return format_seconds(seconds)
    return (
        f"{format_seconds(seconds)} (including {frame.settling_discards} Frames discarded"
        " while the Feed settled)"
    )
