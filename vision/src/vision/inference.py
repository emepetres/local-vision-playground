"""Turning a Frame into an Observation with a local vision-language model.

Inference does not know a camera exists: it takes a Frame from wherever it came. The call
is in-process through ``ChatSession`` and the image payload is 2.x-shaped — raw bytes plus
an IANA-style codec hint, not base64 and not a MIME type. See ADR-0004.

Two lifetime rules leak out of the native layer: a ``MessageItem`` borrows its parts, and
response items are only valid inside the response's scope. That is why an Observation
leaves this module with its text already copied out — nothing native escapes.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import TYPE_CHECKING, Protocol

from vision.capture import Frame
from vision.errors import VisionError

if TYPE_CHECKING:
    from foundry_local_sdk import ChatSession, IModel, Item, Response, Runtime

PROMPT = "Describe what you see in this image in two or three sentences."
"""The fixed workload's prompt. The length bound lives here; the token limit is a net."""

MAX_OUTPUT_TOKENS = 128
TEMPERATURE = 0.0

DEFAULT_MODEL = "qwen3-vl-2b-instruct"
"""Resolved as an alias, so Foundry Local picks the hardware. Name a variant to pin one."""

VISION_TASK = "vision-language-chat"
"""Match on the task, never on the alias prefix: qwen3.5-2b-text is a text-only sibling."""

APP_NAME = "local-vision-playground"


class FinishReason(StrEnum):
    """Why the model stopped, reduced to what an Operator needs to know."""

    COMPLETE = "complete"
    TRUNCATED = "truncated"
    OTHER = "other"


@dataclass(frozen=True)
class ModelIdentity:
    """Which model actually answered, and what it was built for."""

    alias: str
    variant: str
    task: str | None
    runtime: str | None


@dataclass(frozen=True)
class Completion:
    """What the model said, already copied out of the native response."""

    text: str
    finish_reason: FinishReason


@dataclass(frozen=True)
class Timings:
    """The three costs of an Observation, in seconds. Only the third is inference."""

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

    def observe(self, frame: Frame, prompt: str) -> Completion: ...


class Foundry(Protocol):
    """The port onto Foundry Local."""

    def resolve(self, name: str) -> VisionModel:
        """Resolve an alias (Foundry picks the hardware) or a variant id (pins it)."""
        ...


def require_vision_task(identity: ModelIdentity) -> None:
    """Refuse a model that cannot see a Frame, before anything expensive happens."""
    if identity.task != VISION_TASK:
        raise VisionError(
            f"{identity.variant} has task {identity.task!r}, not {VISION_TASK!r},"
            f" so it cannot see a Frame — pick a model whose task is {VISION_TASK}"
            " (run `foundry model list`)"
        )


class FoundryLocal:
    """The real Foundry Local, in-process. Constructed only by the entry point."""

    def __init__(
        self,
        *,
        app_name: str = APP_NAME,
        on_setup: Callable[[str], None] | None = None,
    ) -> None:
        from foundry_local_sdk import Configuration, FoundryLocalManager

        self._manager = FoundryLocalManager(Configuration(app_name=app_name))
        self._register_execution_providers(on_setup)

    def _register_execution_providers(self, on_setup: Callable[[str], None] | None) -> None:
        """One-off machine setup, not part of any latency this command reports.

        It is also the only thing that makes a GPU variant available at all — nothing
        selects an Execution Provider explicitly (see docs/stack.md, Constraint 3).
        Registration is per-process, so it happens on every run; only the first run pays
        to download an EP. An Operator is told it is happening and told when one fails —
        which one was ultimately chosen shows up on the Model line instead.
        """
        pending = [ep.name for ep in self._manager.discover_eps() if not ep.is_registered]
        if pending and on_setup is not None:
            on_setup("Preparing execution providers — the first run downloads them")

        result = self._manager.download_and_register_eps()

        if result.failed_eps and on_setup is not None:
            on_setup(
                f"Could not register {', '.join(result.failed_eps)}"
                " — Foundry Local will fall back to whatever remains"
            )

    def resolve(self, name: str) -> FoundryLocalModel:
        catalog = self._manager.catalog
        model = catalog.get_model(name) or catalog.get_model_variant(name)
        if model is None:
            raise VisionError(
                f"Foundry Local has no model called {name!r} — an alias has no version"
                " but a variant id does (qwen3-vl-2b-instruct-generic-cpu:2);"
                " run `foundry model list` to see what this machine is offered"
            )
        return FoundryLocalModel(model)

    def close(self) -> None:
        self._manager.close()


class FoundryLocalModel:
    """One resolved model, and the ChatSession held open across its Observations."""

    def __init__(self, model: IModel) -> None:
        self._model = model
        self._session: ChatSession | None = None

    @property
    def identity(self) -> ModelIdentity:
        info = self._model.info
        return ModelIdentity(
            alias=self._model.alias,
            variant=self._model.id,
            task=info.task,
            runtime=_runtime(info.runtime),
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

    def observe(self, frame: Frame, prompt: str) -> Completion:
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

        # parts stays referenced for the whole call: the MessageItem borrows their native
        # pointers without owning them, and releasing one would dangle the message.
        parts = [TextItem(prompt), ImageItem(frame.codec, frame.data)]
        message = MessageItem.user(parts)
        options = RequestOptions(
            search=SearchOptions(temperature=TEMPERATURE, max_output_tokens=MAX_OUTPUT_TOKENS)
        )

        with Request().add_item(message).set_options(options) as request:
            with self._session.process_request(request) as response:
                text = "".join(_text_of(item) for item in response)
                finish_reason = _finish_reason(response)

        return Completion(text=text.strip(), finish_reason=finish_reason)


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


def _runtime(runtime: Runtime | None) -> str | None:
    if runtime is None:
        return None
    if runtime.device_type is None:
        return runtime.execution_provider
    return f"{runtime.device_type} / {runtime.execution_provider}"
