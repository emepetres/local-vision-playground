"""Turning a Frame into an Observation with a local vision-language model.

Inference does not know a camera exists: it takes a Frame from wherever it came. The call
is in-process through ``ChatSession`` and the image payload is 2.x-shaped — raw bytes plus
an IANA-style codec hint, not base64 and not a MIME type. See ADR-0004.

Two lifetime rules leak out of the native layer: a ``MessageItem`` borrows its parts, and
response items are only valid inside the response's scope. That is why an Observation
leaves this module with its text already copied out — nothing native escapes.
"""

from __future__ import annotations

import json
import os
from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import TYPE_CHECKING, Any, Protocol

from vision.capture import Frame
from vision.errors import VisionError

if TYPE_CHECKING:
    from foundry_local_sdk import (
        ChatSession,
        Configuration,
        FoundryLocalManager,
        IModel,
        Item,
        Response,
    )

PROMPT = "Describe what you see in this image in two or three sentences."
"""The prompt a Workload carries when the Operator asks no Scene Question of their own.

The length bound lives here; the token limit is a net. It is the default value of ``--ask``
rather than *the* prompt: a command that is handed a Scene Question puts that on the
Workload in the same one place, and nothing else about the request moves.
"""

STRUCTURED_PROMPT = (
    "This is a work bench seen from above. The work zone is the green cutting mat. The tray"
    " is the white mesh tray beside it. List every distinct object you can see, and where it"
    ' is: "tray" if it lies in the white tray, "zone" if it lies on the green mat, "hand" if a'
    ' hand is holding it, "elsewhere" for anything else. Hands are objects too: name each'
    ' visible hand "bare hand" (skin showing) or "gloved hand". Reply with ONLY a JSON array,'
    ' where each element is an object {"name": <string>, "count": <integer >= 1>, "where":'
    ' <one of "tray", "zone", "hand", "elsewhere">}. Example: [{"name": "cup", "count": 1,'
    ' "where": "zone"}, {"name": "bare hand", "count": 1, "where": "zone"}]. If nothing is'
    " there, reply with []."
)
"""The fixed shape a Structured Observation asks for, put in the prompt and parsed back.

Not a Scene Question and not the Operator's to change: ``--structured`` sends *this*, which
is why it overrides ``--ask``. ADR-0011 first reached the shape by a forced tool call; the
spike behind issue #30 found `qwen3-vl-2b-instruct` never honours one and instead answers a
JSON-in-prompt request exactly, so the shape is spelled out here — ``name``, ``count`` and
``where`` with a worked example, because the model defaults to an array of bare strings
without it — and read back out of the reply (see ``parse_objects_present``).

This is the spike behind issue #58/#64's ``described`` prompt, verbatim: it names the demo's
own Work Cell — the green cutting mat, the white mesh tray — rather than staying scenario-
agnostic, because that is what got the 4B model naming hands correctly and answering with a
valid ``where`` (docs/research/2026-09-24-work-cell-spike.md, A1/A3). Naming this project's
own fixture in a prompt every Operator's Frame is sent through is a deliberate, recorded
debt: ADR-0016 has the reasoning and the way out (a future ``--scene TEXT``), not built now.
"""

# The generation limits a Workload takes when a caller does not say otherwise. They are
# defaults on the Workload rather than constants read inside the model, so that the caller
# measuring one Workload against another can see — and record — what it ran under (ADR-0005).
MAX_OUTPUT_TOKENS = 128
TEMPERATURE = 0.0

STRUCTURED_MAX_OUTPUT_TOKENS = 256
"""The output limit a structured Workload runs under, rather than the prose ``MAX_OUTPUT_TOKENS``.

Prose stays at 128 — the length bound the ``PROMPT`` above already asks for two or three
sentences within. A Structured Observation's reply is longer: it names every object *and*
places each one, and the 4B Variant's replies mostly do not fit in 128 — the spike found only
12 of 32 4B replies closed the array at 128 tokens, against 29 of 32 at 256, with the
remaining 3 truncated and salvaged rather than lost outright
(docs/research/2026-09-24-work-cell-spike.md, A1).
"""

DEFAULT_ALIAS = "qwen3-vl-2b-instruct"
"""Resolved when no variant is pinned, so Foundry Local picks the hardware."""

DEFAULT_VARIANTS = (f"{DEFAULT_ALIAS}-cuda-gpu", f"{DEFAULT_ALIAS}-generic-cpu")
"""The two Variants a Benchmark measures when the Operator names none: CUDA-GPU and CPU.

That pair is the Execution Provider axis this project can actually demonstrate (see
docs/stack.md, Constraint 3) — and it is the comparison the demo exists to make.

These are Variant *names*, carrying no version suffix, and the version is whatever the
catalogue offers on the day. Writing `-cuda-gpu:2` here instead would break the command
the morning the catalogue publishes `:3`, and would quietly measure a build nobody chose.
The exact Variant id that was resolved is reported, so the Benchmark still says which
build produced its numbers.
"""

VISION_TASK = "vision-language-chat"
"""Match on the task, never on the alias prefix: qwen3.5-2b-text is a text-only sibling."""

APP_NAME = "local-vision-playground"


class RuntimeName(StrEnum):
    """The domain name of each Runtime a Variant can be loaded by (CONTEXT.md, "Runtime").

    The record carries the Runtime per row so that a reader months later can tell FL-CPU from
    OV-CPU — two Benchmark Runs on the same CPU through different Runtimes are the calibration
    between them, not one measurement (CONTEXT.md, "Hardware Profile"). That grouping is only
    as good as the spelling, so the Runtimes are one closed set here rather than a string
    constant beside each adapter: a row spelled a third way would split the calibration in two
    without saying so.
    """

    FOUNDRY_LOCAL = "Foundry Local"
    OPENVINO_GENAI = "OpenVINO GenAI"


class FinishReason(StrEnum):
    """Why the model stopped, reduced to what an Operator needs to know."""

    COMPLETE = "complete"
    TRUNCATED = "truncated"
    OTHER = "other"


class Where(StrEnum):
    """The one closed set of places a present object can be, per the Work Cell prompt.

    Exactly the four words ``STRUCTURED_PROMPT`` asks the model to answer with — spelled
    lower-case as the prompt spells them, because the model is asked to reply with these
    words verbatim rather than something this adapter maps onto them. A model that returns
    anything else names no member of this set and is not coerced onto the nearest one: see
    ``_present_object``, where a value outside this set makes that element invalid rather
    than guessed at. Whether an object being present *matters* is a Trigger's question, not
    this one's (CONTEXT.md, "Structured Observation") — this only says where it was.
    """

    TRAY = "tray"
    ZONE = "zone"
    HAND = "hand"
    ELSEWHERE = "elsewhere"


_WHERE_VALUES = {member.value for member in Where}
"""The four bare strings ``Where`` accepts, checked before the enum is even constructed.

A plain set of ``str`` rather than a ``try/except ValueError`` around ``Where(where)``: the
parsing this guards is on the hot path of every Structured Observation, and checking
membership first keeps ``_present_object`` reading as one flat set of guard clauses rather
than mixing early returns with a caught exception for the same kind of failure.
"""


@dataclass(frozen=True)
class ModelIdentity:
    """Which model actually answered, and what it was built for.

    The Execution Provider and the device type are kept apart rather than as the one
    string they are printed as. They are two facts — *CUDA* is not *GPU* — and a persisted
    Benchmark has to carry each of them on its own, so that a later reader can group by
    Execution Provider without parsing a slash out of a display string.

    It carries either shape a Variant's identity can take. A Foundry Local Variant is
    identified by its catalogue id and named by its ``alias``; an OpenVINO Variant we
    exported has neither — its identity is read from its ``provenance.json`` (CONTEXT.md,
    "Provenance"), the ``variant`` is the provenance slug that carries no ``:version``, and
    ``alias`` is ``None`` because an Alias is a Foundry Local concept only (CONTEXT.md,
    "Alias"). The Execution Provider it was built for stands in ``execution_provider`` with
    no ``device_type`` beside it: OpenVINO is told a device — NPU, GPU or CPU — where
    Foundry Local splits a Windows ML Execution Provider from the device it dispatched to.

    ``runtime`` is the domain Runtime that loaded it (CONTEXT.md, "Runtime") — which is what
    lets a persisted Benchmark keep FL-CPU and OV-CPU apart, the one pair a Benchmark most
    needs to (CONTEXT.md, "Hardware Profile") — and ``None`` only for the identity of a
    Variant no Runtime claimed, which ``unresolved_identity`` below builds. ``provenance`` is
    the structured manifest an OpenVINO Variant is identified by — the weights, the recipe and
    the Execution Provider it was exported for — and ``None`` for a Foundry Local Variant,
    which its resolved id already identifies.
    """

    alias: str | None
    variant: str
    task: str | None
    execution_provider: str | None
    device_type: str | None
    runtime: RuntimeName | None
    provenance: dict[str, Any] | None = None

    @property
    def dispatched_execution_provider(self) -> str | None:
        """The bare hardware backend — NPU, GPU or CPU — this Variant was dispatched to.

        The Execution Provider the domain means (CONTEXT.md, "Execution Provider"), reduced
        to the one token that authorises a comparison: for Foundry Local it is the
        ``device_type`` it split off the Windows ML Execution Provider, and for OpenVINO it
        is the ``execution_provider`` device it was told to run on. It is what the derived
        Hardware Profile triple carries so that FL-CPU and OV-CPU read as the same CPU
        through two Runtimes — the row's full ``execution_provider`` and ``device_type``
        stay its identity, this only groups it.
        """
        return self.device_type or self.execution_provider

    @property
    def ran_on(self) -> str | None:
        """The pair as one phrase, which is how a report names what a Variant ran on.

        The device and Execution Provider a Variant was dispatched to, not the domain
        Runtime that loaded it (CONTEXT.md, "Runtime"): the two read alike in a report but
        are different facts, so this carries the display phrase under a name that leaves
        ``Runtime`` free for the port a command resolves through.
        """
        if self.execution_provider is None:
            return None
        if self.device_type is None:
            return self.execution_provider
        return f"{self.device_type} / {self.execution_provider}"


def unresolved_identity(name: str) -> ModelIdentity:
    """The identity of a Variant no Runtime claimed: the name it was asked for, and nothing else.

    A Benchmark reports such a Variant as a row rather than ending on it (ADR-0007), and a row
    needs an identity to be laid out under. There is none to read — no Runtime claimed the
    name, so there is neither a catalogue entry nor a provenance manifest behind it — so every
    field but the name stands empty, and ``runtime`` is ``None`` rather than a guess: naming
    one here would say a Runtime owned a name neither of them did.
    """
    return ModelIdentity(
        alias=None,
        variant=name,
        task=None,
        execution_provider=None,
        device_type=None,
        runtime=None,
    )


@dataclass(frozen=True)
class Workload:
    """Everything that has to be identical for two Benchmark Runs to be comparable.

    The prompt, the exact Frame — its bytes, not merely its resolution — and the limits
    the model generates under. The limits live here rather than inside the Foundry Local
    implementation so that the caller who measures a Workload is the caller who fixed it
    (ADR-0005).
    """

    prompt: str
    frame: Frame
    max_output_tokens: int = MAX_OUTPUT_TOKENS
    temperature: float = TEMPERATURE


@dataclass(frozen=True)
class RawObservation:
    """What the model reports about a Frame, already copied out of the native response.

    An Observation without the provenance and the timings the command wraps around it.
    ``completion_tokens`` is what the model generated, which is what makes two latencies
    comparable: a Variant that generated twice as much text is not twice as slow.
    """

    text: str
    finish_reason: FinishReason
    completion_tokens: int


@dataclass(frozen=True)
class PresentObject:
    """One object the model reports present in a Frame: what it is, how many, and where.

    The count is a whole number of at least one — a Structured Observation lists what is
    *present*, so an object with a count of zero is not present and has no row. ``where`` is
    one of the closed ``Where`` set the prompt asks for, never guessed at: an element whose
    ``where`` is missing or names something outside that set is not a ``PresentObject`` at
    all (see ``_present_object``), because a Trigger that reads ``where`` needs the field to
    mean what it says or to not be there. A name, a count and a place together, because any
    one alone is nothing an Operator — or a Trigger — can act on.
    """

    name: str
    count: int
    where: Where


@dataclass(frozen=True)
class ObjectsPresent:
    """The list of objects present in a Frame, already copied out of the native response.

    The list is the shape the model was asked for, in the order it gave them. An **empty**
    list is a valid success, not a failure: it is the model saying nothing is present, which
    is a different fact from its declining to answer in the shape at all (see ``NoShape``).
    """

    objects: tuple[PresentObject, ...]


@dataclass(frozen=True)
class NoShape:
    """The model did not return a well-formed list of objects, and why it did not.

    An ordinary outcome, not a fall-back and not a crash (ADR-0011): the model answered in
    prose, wrapped a truncated array it never closed, or returned something that does not
    validate as a list of ``{name, count, where}``. It carries its reason as one line an
    Operator reads, and it never silently degrades to a prose Observation — a Watch or a
    Benchmark that quietly mixed shapes would report a comparison it cannot vouch for.
    """

    reason: str


Shape = ObjectsPresent | NoShape
"""What a Structured Observation came to: the objects present, or the reason there is no shape.

One type with two cases rather than an ``ObjectsPresent`` whose fields go optional, so that
the ``observe_structured`` port method has exactly one return type and neither case's fields
have to become optional to carry the other.
"""


@dataclass(frozen=True)
class RawStructuredObservation:
    """A Structured Observation as it leaves the model, before the command wraps it.

    The sibling of ``RawObservation``: where that carries the prose ``text``, this carries the
    ``shape``. ``completion_tokens`` is measured over the arguments the model produced, which
    is what a Benchmark compares (ADR-0011); ``finish_reason`` says whether the output limit,
    rather than the model, decided where the shape ended.
    """

    shape: Shape
    finish_reason: FinishReason
    completion_tokens: int


@dataclass(frozen=True)
class Timings:
    """What one run cost, in seconds, in the order the costs are paid.

    Registering the Execution Providers is machine setup rather than part of the
    Observation, which is why it is a fourth number and not folded into the load. Of the
    other three, only inference is the latency of the Observation.
    """

    providers: float
    load: float
    capture: float
    inference: float


@dataclass(frozen=True)
class Observation:
    """What the model reports about a Frame, and what reporting it cost."""

    text: str
    model: ModelIdentity
    finish_reason: FinishReason
    timings: Timings

    @property
    def truncated(self) -> bool:
        return self.finish_reason is FinishReason.TRUNCATED


@dataclass(frozen=True)
class StructuredObservation:
    """A Structured Observation, and what reporting it cost.

    The sibling of ``Observation`` — a fixed shape asked of a Frame rather than prose (see
    CONTEXT.md, "Structured Observation"). It carries a ``shape`` where the prose Observation
    carries ``text``; neither field is made optional to accommodate the other, which is what
    makes them siblings rather than one overloaded type. The provenance and timings the
    command wraps around it are the same, because getting the Frame onto the hardware cost the
    same whichever shape was asked of it.
    """

    shape: Shape
    model: ModelIdentity
    finish_reason: FinishReason
    timings: Timings

    @property
    def truncated(self) -> bool:
        return self.finish_reason is FinishReason.TRUNCATED


class VisionModel(Protocol):
    """A resolved model, before and after it is on the machine."""

    @property
    def identity(self) -> ModelIdentity: ...

    @property
    def is_cached(self) -> bool:
        """True when the weights are already on disk and no download is needed."""
        ...

    def download(self, on_progress: Callable[[float], None]) -> None:
        """Fetch the weights, reporting progress as a percentage between 0 and 100.

        Foundry Local calls back several hundred times over a 2B model, so a caller that
        renders every callback renders far too much.
        """
        ...

    def load(self) -> None:
        """Bring the model up on whichever Execution Provider it resolves to."""
        ...

    def observe(self, workload: Workload) -> RawObservation:
        """Answer this Workload, and answer it from its own Frame alone.

        Every Observation is independent of the last. That is what an Observation is —
        what the model reports about *a* Frame — and it is also what makes N Benchmark
        Runs of one Workload N executions of the same work rather than a conversation
        that grows by one image and one answer each time.
        """
        ...

    def observe_structured(self, workload: Workload) -> RawStructuredObservation:
        """Answer this Workload as a fixed shape rather than as prose, from its Frame alone.

        The sibling of ``observe``: a Structured Observation crosses the same port through
        its own method so that each shape has exactly one return type. It answers with the
        objects present, or with a ``NoShape`` carrying its reason — a model that declines the
        shape is an ordinary outcome, not an exception to catch (ADR-0011). The Workload
        carries the fixed-shape request as its prompt; there is no free-text Scene Question in
        structured mode.
        """
        ...

    def unload(self) -> None:
        """Take the model back off the hardware, so the next one can have it.

        Measuring two Variants in one process is the reason this is on the port: two
        loaded models compete for the same device, and a Benchmark that leaves the first
        one resident is measuring the second one under conditions it cannot report.
        """
        ...


class Runtime(Protocol):
    """The common resolution port over the project's Runtimes: it resolves, nothing more.

    A Runtime is what loads a model onto the machine and runs it on an Execution Provider
    (CONTEXT.md, "Runtime"). This project has two — Foundry Local and OpenVINO GenAI — and
    what they share, and all a command holds a router over them for, is turning a name into
    a model. ``register_execution_providers`` is deliberately *not* here: it is Foundry
    Local's alone, because Foundry Local picks the Execution Provider and nothing selects
    one explicitly, while the second Runtime is told its device and has nothing to register
    (ADR-0013). The Runtime that lacks the method is the one that proves the boundary.
    """

    def resolve(self, name: str) -> VisionModel:
        """Resolve a name this Runtime claims into a model, before it is on the machine."""
        ...


class FoundryLocal(Runtime, Protocol):
    """The port onto Foundry Local: a Runtime that also registers the Execution Providers.

    It answers the common ``resolve`` and, unlike the other Runtime, owns
    ``register_execution_providers`` — the one member that does not lift onto the shared
    ``Runtime`` port (ADR-0013).
    """

    def register_execution_providers(self, announce: Callable[[str], None]) -> None:
        """Make this machine's Execution Providers available, reporting what is worth saying.

        Start-up work, not part of any Observation — but it is what makes a GPU variant
        loadable at all, so it happens before a model is loaded and is timed on its own.
        It is not the first thing the command does: on a first run this downloads the
        providers, and nothing may be downloaded before the model is known to be one that
        can see a Frame.
        """
        ...


class OpenVINO(Runtime, Protocol):
    """The port onto OpenVINO GenAI: the Runtime that picks no Execution Provider.

    It answers the common ``resolve`` and, unlike Foundry Local, has **no**
    ``register_execution_providers`` — it is told its device and has nothing to register
    (ADR-0013). The Runtime that lacks that method is the one a test reads the seam off.

    It adds ``claims``, by which the router discriminates the two Runtimes. OpenVINO claims
    a name that resolves to an on-disk IR directory carrying a ``provenance.json`` — the
    provenance slug under the IR cache location, or a path to such a directory — and Foundry
    Local claims the rest (CONTEXT.md, "Variant"). Claiming is kept off the common ``Runtime``
    port for the same reason registration is: it is this Runtime's own concern, not a member
    every Runtime has to grow.
    """

    def claims(self, name: str) -> bool:
        """Whether this name resolves to an IR directory this Runtime can run.

        True for a provenance slug found under the IR cache, or a path to a directory
        carrying a ``provenance.json``. False for everything else — which is what leaves it
        to Foundry Local, and a name neither claims is one refusal naming both ways to name
        a Variant.
        """
        ...


def require_a_scene_question(question: str) -> str:
    """Refuse a Scene Question that asks nothing, and return the one that was asked.

    ``--ask ""`` is a shell-quoting mistake rather than an intention — an Operator who
    wanted the Frame described would have left the flag off — and a Workload built from it
    would send the model an empty prompt and report whatever came back as an Observation.
    A silent answer to a question nobody asked is the worst thing this could do in front of
    an audience, so it is said out loud instead.

    The question is returned with its surrounding whitespace removed, and that is the value
    the commands go on to use: it is the same normalisation a typed line gets in the Watch
    (``watch._standing_question``), so ``--ask "cups "`` and a keystroke of ``cups`` stand
    for one question and not two. For ``benchmark`` that is what keeps two operators' runs
    of the same question comparable (docs/benchmarks/); for ``watch`` it keeps retyping the
    standing question from being read as a change.

    It lives here, beside the prompt it stands in for, because it is a fact about a Scene
    Question rather than about the flag that carries one — which is also why it is asked
    before Foundry Local is started, as the other commands ask their own invariants.
    """
    asked = question.strip()
    if asked:
        return asked
    raise VisionError(
        "--ask was given no question — pass one in quotes"
        ' (--ask "is anyone looking at the camera?"), or leave --ask off to have the'
        " Frame described"
    )


def require_vision_task(identity: ModelIdentity) -> None:
    """Refuse a model that cannot see a Frame, before anything expensive happens.

    A model that declares no task at all gets its own refusal. It is the same outcome —
    nothing here will send a Frame to a model that has not said it can see one — but a
    different fault: the catalogue entry is incomplete on Foundry Local's side, and
    `foundry model list` failing to process nine entries on 0.8.119 (docs/stack.md) is
    the same gap seen from the CLI. Saying so keeps an Operator from hunting for a bug in
    this command that is not there.
    """
    if identity.task is None:
        raise VisionError(
            f"{identity.variant} declares no task in the Foundry Local catalogue,"
            " so nothing says whether it can see a Frame — the incomplete entry is"
            " Foundry Local's, not this command's; pick a model that declares"
            f" {VISION_TASK} (run `foundry model list`)"
        )
    if identity.task != VISION_TASK:
        raise VisionError(
            f"{identity.variant} has task {identity.task!r}, not {VISION_TASK!r},"
            f" so it cannot see a Frame — pick a model whose task is {VISION_TASK}"
            " (run `foundry model list`)"
        )


def _disable_runtime_telemetry() -> None:
    """Silence ONNX Runtime's own telemetry event, which Foundry Local's own setting cannot.

    ``disable_nonessential_telemetry`` on ``Configuration`` (below) covers Foundry Local's
    own telemetry, but its docstring says plainly that Foundry Local "may still send a
    minimal ProcessInfo event" regardless — that one is ONNX Runtime's, sent from underneath
    Foundry Local, and ``ORT_TELEMETRY_DISABLED`` is the only lever over it (backlog item 10).
    ``setdefault`` so an Operator's own environment, set before this process started, is never
    overridden by it.
    """
    os.environ.setdefault("ORT_TELEMETRY_DISABLED", "1")


def _foundry_configuration(app_name: str) -> Configuration:
    """The ``Configuration`` every ``FoundryLocalManager`` in this process is built from.

    ``disable_nonessential_telemetry=True`` is not a flag an Operator chooses: Local-First
    means no request leaves the machine while it is operating, and that is literal about
    telemetry too (CONTEXT.md, "Local-First"). Kept apart from ``_manager`` so a test can
    build one without starting the Foundry Local service that constructing a
    ``FoundryLocalManager`` would.
    """
    from foundry_local_sdk import Configuration

    return Configuration(app_name=app_name, disable_nonessential_telemetry=True)


class InProcessFoundryLocal:
    """The real Foundry Local, called in-process (ADR-0004). Built by the entry point only.

    The manager is started on first use rather than in the constructor, because starting it
    starts the Foundry Local service: a command that names only OpenVINO Variants never touches
    this Runtime, and it must pay nothing for the router holding it (ADR-0013). That is the
    same figure the ``providers`` zero reports from the other side.
    """

    def __init__(self, *, app_name: str = APP_NAME) -> None:
        # Set ahead of every lazy import below, not inside them: ONNX Runtime reads this at
        # native init, which the first of those imports triggers, and a variable set after
        # that point is already too late (CONTEXT.md, "Local-First" — no request leaves the
        # machine while operating, telemetry included; backlog item 10).
        _disable_runtime_telemetry()
        self._app_name = app_name
        self._started: FoundryLocalManager | None = None

    @property
    def _manager(self) -> FoundryLocalManager:
        if self._started is None:
            from foundry_local_sdk import FoundryLocalManager

            self._started = FoundryLocalManager(_foundry_configuration(self._app_name))
        return self._started

    def register_execution_providers(self, announce: Callable[[str], None]) -> None:
        """Register every Execution Provider this machine can offer.

        This is the only thing that makes a GPU variant available at all — nothing
        selects an Execution Provider explicitly (see docs/stack.md, Constraint 3).
        Registration is per-process, so it happens on every run; only the first run pays
        to download an EP, which is why it waits until the model has been accepted. An
        Operator is told it is happening and told when one fails —
        which one was ultimately chosen shows up on the Model line instead.
        """
        pending = [ep.name for ep in self._manager.discover_eps() if not ep.is_registered]
        if pending:
            announce("Registering Execution Providers — the first run also downloads them")

        result = self._manager.download_and_register_eps()

        if result.failed_eps:
            announce(
                f"Could not register {', '.join(result.failed_eps)}"
                " — Foundry Local will fall back to whatever remains"
            )

    def resolve(self, name: str) -> FoundryLocalModel:
        """Resolve an alias, an exact variant id, or a variant name with no version.

        The third is what lets a Variant be named in source without a version suffix
        being written there with it: `qwen3-vl-2b-instruct-cuda-gpu` is answered with
        whatever version the catalogue offers today. It is tried last, so an Operator who
        pinned `…-cuda-gpu:2` gets that build and not the newest one.
        """
        catalog = self._manager.catalog
        model = catalog.get_model(name) or catalog.get_model_variant(name)
        if model is None:
            model = self._latest_named(name)
        if model is None:
            raise VisionError(
                f"Foundry Local has no model called {name!r} — that is an alias"
                " (qwen3-vl-2b-instruct), a variant name (qwen3-vl-2b-instruct-generic-cpu)"
                " or a variant id, which carries a version (qwen3-vl-2b-instruct-generic-cpu:2);"
                " run `foundry model list` to see what this machine is offered"
            )
        return FoundryLocalModel(model)

    def _latest_named(self, variant_name: str) -> IModel | None:
        """The newest catalogue version of the Variant with this name, if there is one.

        Every alias is asked for its variants rather than the name being taken apart: a
        variant name looks like its alias with a hardware suffix, but nothing guarantees
        that, and a Variant resolved by pattern-matching a string is not resolved through
        the catalogue at all.

        ``list_models`` is used rather than the two calls that look purpose-built for this,
        because on 2.0.1 neither answers **[verified 2026-09-06]**. `get_model_versions`,
        the documented "every version for an alias", returned `[]` for
        `qwen3-vl-2b-instruct-cuda-gpu` and only the CPU Variant for the bare alias, on a
        machine where `get_model_variant("…-cuda-gpu:2")` resolves that exact build.
        `get_latest_version` needs an `IModel` to start from, which is the thing being
        looked for. `list_models` is the one call that reports every Variant of every alias
        — asking an alias directly answers with the single Variant Foundry Local would pick
        for it. What the catalogue lists varies with which region serves it, so this is a
        best effort against a moving target, not a guarantee.
        """
        versions = [
            variant
            for model in self._manager.catalog.list_models()
            for variant in model.variants
            if variant.info.name == variant_name
        ]
        if not versions:
            return None
        return max(versions, key=lambda variant: _version_key(variant.info.version))

    def close(self) -> None:
        """Close the manager, if anything ever started one."""
        if self._started is not None:
            self._started.close()


class FoundryLocalModel:
    """One resolved model, and the ChatSession held open across its Observations."""

    def __init__(self, model: IModel) -> None:
        self._model = model
        self._session: ChatSession | None = None

    @property
    def identity(self) -> ModelIdentity:
        info = self._model.info
        runtime = info.runtime
        return ModelIdentity(
            alias=self._model.alias,
            variant=self._model.id,
            task=info.task,
            execution_provider=runtime.execution_provider if runtime is not None else None,
            device_type=runtime.device_type if runtime is not None else None,
            runtime=RuntimeName.FOUNDRY_LOCAL,
        )

    @property
    def is_cached(self) -> bool:
        return self._model.is_cached

    def download(self, on_progress: Callable[[float], None]) -> None:
        self._model.download(progress_callback=on_progress)

    def load(self) -> None:
        from foundry_local_sdk import ChatSession

        self._model.load()
        self._session = ChatSession(self._model)

    def unload(self) -> None:
        """Release the session, then take the model off the hardware.

        In that order, and deterministically: the session holds a native handle onto the
        loaded model, and unloading underneath a live session leaves that handle pointing
        at a model that is no longer there. ``Session`` exposes its release as ``__exit__``
        rather than as a ``close``, and dropping the reference alone would leave the
        release to whenever the last one goes — a traceback frame is enough to delay it
        past the unload.
        """
        session, self._session = self._session, None
        if session is not None:
            session.__exit__()
        self._model.unload()

    def observe(self, workload: Workload) -> RawObservation:
        from foundry_local_sdk import (
            ImageItem,
            MessageItem,
            Request,
            RequestOptions,
            SearchOptions,
            TextItem,
        )

        if self._session is None:
            raise VisionError(f"{self._model.id} was asked for an Observation before it was loaded")

        # A ChatSession is a conversation, not a stateless endpoint: it accumulates turns,
        # and the SDK offers `turn_count`/`undo_turns` precisely because it does. Left
        # alone, the second Observation would carry the first Frame and the first answer
        # as context — the prompt would grow with every call, and N Benchmark Runs of one
        # Workload would silently become N different, ever-larger Workloads. Forgetting
        # the turns before the request rather than after also drops whatever a call that
        # failed part-way left behind. The session is kept open rather than rebuilt so
        # that only the inference itself falls inside the measured time.
        _forget_previous_turns(self._session)

        frame = workload.frame
        # parts stays referenced for the whole call: the MessageItem borrows their native
        # pointers without owning them, and releasing one would dangle the message.
        parts = [TextItem(workload.prompt), ImageItem(frame.codec, frame.data)]
        message = MessageItem.user(parts)
        options = RequestOptions(
            search=SearchOptions(
                temperature=workload.temperature,
                max_output_tokens=workload.max_output_tokens,
            )
        )

        with Request().add_item(message).set_options(options) as request:
            with self._session.process_request(request) as response:
                text = "".join(_text_of(item) for item in response)
                finish_reason = _finish_reason(response)
                # Read inside the response's scope, like the text: nothing native escapes.
                completion_tokens = response.get_usage().completion_tokens

        return RawObservation(
            text=text.strip(),
            finish_reason=finish_reason,
            completion_tokens=completion_tokens,
        )

    def observe_structured(self, workload: Workload) -> RawStructuredObservation:
        from foundry_local_sdk import (
            ImageItem,
            MessageItem,
            Request,
            RequestOptions,
            SearchOptions,
            TextItem,
        )

        if self._session is None:
            raise VisionError(f"{self._model.id} was asked for an Observation before it was loaded")

        # Cleared before the request for the same reason the prose path clears it: a
        # ChatSession accumulates turns, and a Structured Observation answers its own Frame
        # alone (ADR-0004).
        _forget_previous_turns(self._session)

        frame = workload.frame
        parts = [TextItem(workload.prompt), ImageItem(frame.codec, frame.data)]
        message = MessageItem.user(parts)
        options = RequestOptions(
            search=SearchOptions(
                temperature=workload.temperature,
                max_output_tokens=workload.max_output_tokens,
            )
        )

        with Request().add_item(message).set_options(options) as request:
            with self._session.process_request(request) as response:
                # Copied out inside the response's scope, exactly as the prose path copies
                # its text: nothing native escapes (ADR-0004). The shape is parsed here, so
                # that a reply that does not carry one becomes a NoShape rather than raising.
                text = "".join(_text_of(item) for item in response)
                finish_reason = _finish_reason(response)
                completion_tokens = response.get_usage().completion_tokens

        return RawStructuredObservation(
            shape=parse_objects_present(text, truncated=finish_reason is FinishReason.TRUNCATED),
            finish_reason=finish_reason,
            completion_tokens=completion_tokens,
        )


def parse_objects_present(text: str, *, truncated: bool = False) -> Shape:
    """Read the objects present out of a model's reply, or say why there is no shape.

    The fall-back the spike behind issue #30 landed on: `qwen3-vl-2b-instruct` never honours
    a forced tool call but answers a JSON-in-prompt request in the exact ``{name, count, where}``
    shape, wrapped in a markdown code fence and sometimes truncated mid-array when the output
    limit stops generation. So the fence is stripped, the first complete JSON array is decoded
    from the opening ``[`` — anything the model runs on with past the closing ``]`` is ignored
    rather than dragging a stray bracket into the span and defeating the parse (a trailing
    ``:]`` or a second ``[end]`` used to discard a well-formed answer) — and anything that then
    fails to parse or to validate is a ``NoShape`` carrying its reason rather than an exception
    (ADR-0011).

    A **mostly-valid** array is repaired rather than discarded, whether the output limit cut it
    off or a single element simply did not match: the objects that closed before the first bad
    one are real, so they are salvaged and only the tail is dropped (the repair the spike
    named), and the two paths agree on it rather than one salvaging while the other throws the
    lot away. What comes back is the recovered list — the caller's ``finish_reason`` still says
    whether it was truncated, which is what has the report note it may be short. Nothing
    salvageable is a ``NoShape``: the limit named where truncation left an empty prefix, the
    ``{name, count, where}`` shape named where a complete reply's every element missed it —
    an element whose ``where`` is missing or names something outside the closed ``Where`` set
    is exactly as non-conforming as one with no ``name`` or a bad ``count``, and is never
    coerced onto the nearest member of that set (see ``_present_object``).
    """
    cut_off = "the model's list of objects was cut off by the output limit before it closed"

    start = text.find("[")
    if start == -1:
        # No array opened at all, so there is nothing to read and nothing to salvage; both the
        # truncated and the complete case say what is wrong rather than raise.
        if truncated:
            return NoShape(cut_off)
        return NoShape(
            "the model answered in prose instead of the list of objects the shape asks for"
        )

    try:
        # From the opening ``[`` only, so prose trailing the closed array — or a stray ``]`` in
        # it — is left out of the span rather than pulled in by a last-``]`` search.
        parsed, _ = json.JSONDecoder().raw_decode(text, start)
    except json.JSONDecodeError:
        # The array did not decode whole: the output limit cut it off mid-element, or a ``]``
        # inside a string value left brackets that will not parse. Under truncation salvage the
        # complete objects at its front; otherwise it is ordinary malformed JSON.
        if truncated:
            return _salvage(text, start, cut_off)
        return NoShape("the model's reply was not the well-formed JSON the shape asks for")

    if not isinstance(parsed, list):
        return NoShape("the model did not return a list of objects")

    objects: list[PresentObject] = []
    for element in parsed:
        present = _present_object(element)
        if present is None:
            break
        objects.append(present)
    else:
        return ObjectsPresent(tuple(objects))

    # A non-conforming element stopped the read. The objects that closed before it are real and
    # are shown — the same salvage the truncated path makes — and only when none closed is there
    # no shape: the limit's doing under truncation, a reply that never matched it otherwise.
    if objects:
        return ObjectsPresent(tuple(objects))
    if truncated:
        return NoShape(cut_off)
    return NoShape("the model's reply did not match the expected {name, count, where} shape")


def _salvage(text: str, start: int, cut_off: str) -> Shape:
    """The objects a truncated array had finished before the output limit cut it off.

    An array the limit stopped mid-object still carries the objects it closed before that,
    and those are worth showing rather than throwing away with the incomplete tail (ADR-0011,
    and the repair the #30 spike named). Nothing salvageable — the limit cut in before the
    first object closed, or there was no array at all — names the limit instead.
    """
    if start == -1:
        return NoShape(cut_off)
    objects = _salvage_present(text[start + 1 :])
    if objects:
        return ObjectsPresent(tuple(objects))
    return NoShape(cut_off)


def _salvage_present(fragment: str) -> list[PresentObject]:
    """Decode the complete ``{name, count, where}`` objects at the front of a truncated array.

    One value at a time from just after the opening ``[``, skipping the commas and whitespace
    between them, and stopping at the first thing that will not decode or does not match the
    shape — which is the object the output limit cut off, or the missing closing ``]``.
    """
    decoder = json.JSONDecoder()
    objects: list[PresentObject] = []
    index = 0
    while index < len(fragment):
        while index < len(fragment) and fragment[index] in " \t\r\n,":
            index += 1
        if index >= len(fragment):
            break
        try:
            value, index = decoder.raw_decode(fragment, index)
        except json.JSONDecodeError:
            break
        present = _present_object(value)
        if present is None:
            break
        objects.append(present)
    return objects


def _present_object(element: object) -> PresentObject | None:
    """One element of the parsed array as a PresentObject, or ``None`` if it is not one.

    A whole-number count of at least one is part of the shape, not a nicety: a bool is an
    ``int`` in Python and is rejected here so that ``true`` cannot be read as a count of one.
    ``where`` is checked the same strict way: it must be a string matching one of the closed
    ``Where`` values exactly as the prompt spells them, or the element is not a PresentObject
    at all — a missing or unrecognised ``where`` is never guessed at or coerced onto the
    nearest member of the set, it simply fails to match the shape like a missing name would.
    """
    if not isinstance(element, dict):
        return None
    name = element.get("name")
    count = element.get("count")
    where = element.get("where")
    if not isinstance(name, str) or not name:
        return None
    if isinstance(count, bool) or not isinstance(count, int) or count < 1:
        return None
    if not isinstance(where, str) or where not in _WHERE_VALUES:
        return None
    return PresentObject(name=name, count=count, where=Where(where))


def _version_key(version: object) -> tuple[int, int, str]:
    """Order catalogue versions numerically, so that ``10`` beats ``9``.

    The version is the ``:N`` suffix of a Variant id, and the SDK ships as a native
    extension with no stubs to say whether it hands that over as a number or as the string
    it was parsed from **[unverified]**. Under the string reading a plain comparison picks
    version 9 over version 10 the day the catalogue reaches double digits, which is a
    silently older build rather than a failure. Numeric first, with anything unparseable
    sorted below and broken by its own text, so the answer is the same either way.
    """
    try:
        return (1, int(str(version)), "")
    except ValueError:
        return (0, 0, str(version))


def _forget_previous_turns(session: ChatSession) -> None:
    """Take the session back to an empty conversation, so the next Frame stands alone."""
    turns = session.turn_count
    if turns:
        session.undo_turns(turns)


def _text_of(item: Item) -> str:
    """Copy an output item's text into a Python str, before the response is released."""
    from foundry_local_sdk import MessageItem, TextItem

    if isinstance(item, TextItem):
        return item.text
    if isinstance(item, MessageItem):
        return "".join(_text_of(part) for part in item.parts)
    return ""


def _finish_reason(response: Response) -> FinishReason:
    from foundry_local_sdk import FinishReason as NativeFinishReason

    match response.finish_reason:
        case NativeFinishReason.STOP:
            return FinishReason.COMPLETE
        case NativeFinishReason.LENGTH:
            return FinishReason.TRUNCATED
        case _:
            return FinishReason.OTHER
