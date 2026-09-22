"""The second Runtime: OpenVINO GenAI, behind the unchanged ``VisionModel`` port.

Foundry Local's catalogue on the demo machine publishes no vision build beyond CPU, so the
NPU and the Arc iGPU are reached through OpenVINO GenAI instead (ADR-0012). It enters as a
second adapter behind the model port, which does not change (ADR-0013): ``VLMPipeline.generate``
is stateless, so there is no conversation to clear; the Workload crosses unchanged; and a
``RawObservation`` is answerable in full from ``VLMDecodedResults``.

Everything OpenVINO-specific lives behind the port and none of it crosses it — the lazy
``openvino_genai`` import, the ``CACHE_DIR`` that collapses the NPU's ~32 s first compile to
~2 s (#45), and the clean-env defence against the system-wide OpenVINO 2025.3 archive that
shadows the pip build (#38). The load/observe path is verified live on the Zenbook, not in
the suite: the tests run with no NPU and no ``openvino`` install, against the pure seams —
resolving a slug or a path to an IR directory, and reading a Variant's identity from its
``provenance.json``.
"""

from __future__ import annotations

import io
import json
import os
import sys
from collections.abc import Callable, Iterable
from pathlib import Path
from typing import TYPE_CHECKING, Any

from PIL import Image

from vision.errors import VisionError
from vision.inference import (
    VISION_TASK,
    FinishReason,
    ModelIdentity,
    RawObservation,
    RawStructuredObservation,
    Workload,
    parse_objects_present,
)

if TYPE_CHECKING:
    import openvino_genai

PROVENANCE_FILE = "provenance.json"
"""The manifest an IR carries beside its bytes, written by the conversion step (#48).

Its presence in a directory is what makes that directory an OpenVINO Variant this Runtime
claims, and its contents are the identity that Variant carries (ADR-0013).
"""

# The clean-env defence against the system-wide OpenVINO 2025.3 archive (#38). The archive's
# setupvars leave these variables and PATH markers permanent in the environment, and they
# shadow the pip/uv-installed openvino this adapter must import. The convert step defends a
# child it spawns; this adapter imports openvino_genai *in this process*, so it scrubs this
# process's own sys.path and PATH before the import. The markers mirror
# ``tools/convert/convert.py`` deliberately rather than sharing them: that module holds a
# stdlib-only invariant and must not import ``vision``, and this one must not import a tool.
_SHADOW_ENV_VARS = ("PYTHONPATH", "INTEL_OPENVINO_DIR", "OpenVINO_DIR")
_SHADOW_PATH_MARKERS = ("openvino_2025", os.path.join("Intel", "openvino"))


def ir_cache_root() -> Path:
    """Where IRs are kept, outside the repository: ``$LVP_IR_CACHE`` or the per-user default.

    The same location the conversion step writes to (``tools/convert/convert.py``): the
    convention is shared between the step that produces an IR and the Runtime that runs it,
    not either one's private choice (ADR-0013). Reimplemented here rather than imported from
    the tool, for the reason the markers above are.
    """
    override = os.environ.get("LVP_IR_CACHE")
    if override:
        return Path(override)
    base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~/.cache")
    return Path(base) / "local-vision-playground" / "ir"


def resolve_ir_directory(name: str) -> Path | None:
    """The IR directory a name names, or ``None`` when it names none this Runtime can run.

    Two ways to name an OpenVINO Variant (CONTEXT.md, "Variant"), tried in that order: a path
    to a directory that carries a ``provenance.json``, or a provenance slug resolved under the
    IR cache location. A name that is neither is not this Runtime's — which is what leaves it
    to Foundry Local. The manifest must be present either way: a directory of IR bytes with no
    ``provenance.json`` has no identity to carry (ADR-0013), so it is not a Variant this
    Runtime will claim.
    """
    as_path = Path(name)
    if _is_ir_directory(as_path):
        return as_path
    under_cache = ir_cache_root() / name
    if _is_ir_directory(under_cache):
        return under_cache
    return None


def _is_ir_directory(candidate: Path) -> bool:
    return candidate.is_dir() and (candidate / PROVENANCE_FILE).is_file()


def read_provenance(ir_dir: Path) -> dict[str, Any]:
    """The IR's ``provenance.json`` as data, or a refusal naming the file that is wrong.

    A manifest that will not parse is not a crash to hand an Operator a traceback for: it is
    an IR that was not written whole, and the lever is to export it again (see
    ``tools/convert/convert.py``).
    """
    path = ir_dir / PROVENANCE_FILE
    try:
        parsed = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise VisionError(
            f"{path} could not be read as a provenance manifest — the IR names itself by it,"
            f" so re-export it with tools/convert/convert.py. It said: {error}"
        ) from error
    if not isinstance(parsed, dict):
        raise VisionError(f"{path} is not a provenance manifest — re-export the IR")
    return parsed


def identity_from_provenance(provenance: dict[str, Any]) -> ModelIdentity:
    """The Variant's identity, read from its manifest and never from where it was found.

    A path on disk is not an identity, and a Benchmark is read back months later (CONTEXT.md,
    "Provenance"). So the ``variant`` is the provenance slug — which carries no ``:version``,
    an IR having no catalogue behind it — and there is no Alias, an Alias being a Foundry Local
    concept only (CONTEXT.md, "Alias"). The task is fixed rather than read: we exported a
    Qwen3-VL vision-language model, so it can always see a Frame, and stating that is what lets
    the same ``require_vision_task`` gate the two Runtimes alike.
    """
    return ModelIdentity(
        alias=None,
        variant=str(provenance.get("slug", "")),
        task=VISION_TASK,
        execution_provider=provenance.get("execution_provider"),
        device_type=None,
    )


def device_of(provenance: dict[str, Any]) -> str:
    """The OpenVINO device the IR is told to run on: the Execution Provider it was built for.

    OpenVINO GenAI never chooses a device (CONTEXT.md, "OpenVINO GenAI"); it is told one, and
    NPU / GPU / CPU are already its own device strings. The slug and the manifest name the same
    Execution Provider, so the ``-npu`` Variant runs on the NPU and the ``-gpu`` one on the Arc
    iGPU, which is how an Operator picks the hardware by naming a Variant.
    """
    return str(provenance.get("execution_provider") or "CPU").upper()


def without_shadow(entries: Iterable[str]) -> list[str]:
    """The path entries with the OpenVINO 2025.3 archive's removed (#38).

    Pure, so the decision is testable without mutating this process: it drops any entry that
    carries an archive marker and keeps the rest, which is what makes ``import openvino_genai``
    resolve the pip build rather than the shadowing archive.
    """
    return [
        entry
        for entry in entries
        if not any(marker.lower() in entry.lower() for marker in _SHADOW_PATH_MARKERS)
    ]


def _defend_against_shadow() -> None:
    """Scrub this process's ``sys.path`` and ``PATH`` of the archive before importing OpenVINO.

    Called once, immediately before the lazy import. ``PYTHONPATH`` has already been consumed
    into ``sys.path`` by the interpreter, so both are scrubbed; the archive's variables are
    dropped too, so nothing this process spawns re-adds it. A clean machine — the dev box — has
    no markers, so this changes nothing there.
    """
    sys.path[:] = without_shadow(sys.path)
    for var in _SHADOW_ENV_VARS:
        os.environ.pop(var, None)
    if "PATH" in os.environ:
        os.environ["PATH"] = os.pathsep.join(without_shadow(os.environ["PATH"].split(os.pathsep)))


class InProcessOpenVINO:
    """The real OpenVINO GenAI Runtime. Built by the entry point only.

    It satisfies the common ``Runtime`` port — it resolves — and adds ``claims`` by which the
    router discriminates it from Foundry Local (ADR-0013). It has, deliberately, no
    ``register_execution_providers``: it is told its device and has nothing to register, and
    the Runtime that lacks that method is the one the seam is read off.
    """

    def claims(self, name: str) -> bool:
        """Whether this name resolves to an IR directory carrying a ``provenance.json``."""
        return resolve_ir_directory(name) is not None

    def resolve(self, name: str) -> OpenVINOModel:
        """Resolve a provenance slug or an IR path into a model, before it is on the hardware.

        Only reached for a name this Runtime claims — the router asks ``claims`` first — but it
        resolves the name again rather than trusting a hand-off, because the identity is read
        from the manifest either way and the directory is where the manifest lives.
        """
        ir_dir = resolve_ir_directory(name)
        if ir_dir is None:
            raise VisionError(
                f"{name!r} is not an OpenVINO Variant — name a provenance slug found under the"
                " IR cache, or a path to an IR directory carrying a provenance.json"
            )
        provenance = read_provenance(ir_dir)
        return OpenVINOModel(
            ir_dir=ir_dir,
            identity=identity_from_provenance(provenance),
            device=device_of(provenance),
        )


class OpenVINOModel:
    """One resolved IR, and the ``VLMPipeline`` held open across its Observations.

    The pipeline is stateless — ``generate`` carries no turns — so nothing is cleared between
    Observations the way Foundry Local's ``ChatSession`` is (ADR-0013): an Observation answers
    its own Frame alone because there is nothing else it could answer.
    """

    def __init__(self, *, ir_dir: Path, identity: ModelIdentity, device: str) -> None:
        self._ir_dir = ir_dir
        self._identity = identity
        self._device = device
        self._pipeline: openvino_genai.VLMPipeline | None = None

    @property
    def identity(self) -> ModelIdentity:
        return self._identity

    @property
    def is_cached(self) -> bool:
        """True: an IR this Runtime resolved is one already on disk (ADR-0013)."""
        return True

    def download(self, on_progress: Callable[[float], None]) -> None:
        """A refusal: nothing fetches an IR at run time.

        The conversion step produces the IR out of band (ADR-0012, ADR-0013), so a Variant
        that is not already on disk is not one this Runtime ever downloads — it is one to
        export. Reaching here at all means ``is_cached`` was ignored, which it is not.
        """
        raise VisionError(
            f"{self._identity.variant} is an OpenVINO IR — it is exported out of band, not"
            " downloaded; run tools/convert/convert.py to produce it"
        )

    def load(self) -> None:
        """Bring the IR up on its device, importing OpenVINO GenAI only now.

        The import is lazy so the suite — and the demo path, when no OpenVINO Variant is named
        — never pays for it, and it is preceded by the clean-env defence so the pip build is
        the one that loads (#38). ``CACHE_DIR`` caches the compiled blob beside the IR, which
        collapses the NPU's first-compile from ~32 s to ~2 s on every later start (#45).
        """
        _defend_against_shadow()

        import openvino_genai

        cache = self._ir_dir / "ov-cache"
        cache.mkdir(parents=True, exist_ok=True)
        self._pipeline = openvino_genai.VLMPipeline(
            str(self._ir_dir), self._device, CACHE_DIR=str(cache)
        )

    def unload(self) -> None:
        """Drop the pipeline, taking the IR off the device so the next model can have it."""
        self._pipeline = None

    def observe(self, workload: Workload) -> RawObservation:
        """Answer this Workload as prose, from its own Frame alone.

        The Frame's bytes are decoded to the RGB tensor OpenVINO wants and ``temperature ==
        0.0`` is read as greedy decoding (ADR-0013); the tokens generated and the finish reason
        are copied out of ``VLMDecodedResults``, which is all a ``RawObservation`` is.
        """
        result = self._generate(workload)
        return RawObservation(
            text=_text_of(result).strip(),
            finish_reason=_finish_reason(result),
            completion_tokens=result.perf_metrics.get_num_generated_tokens(),
        )

    def observe_structured(self, workload: Workload) -> RawStructuredObservation:
        """Answer this Workload as the fixed shape, reusing ``parse_objects_present`` untouched.

        The same Qwen3-VL weights answer the same JSON-in-prompt request the Foundry Local
        adapter sends (ADR-0011), so only the generate call is this adapter's — the parse is
        shared, and a reply that does not carry the shape is a ``NoShape`` rather than a raise.
        """
        result = self._generate(workload)
        finish_reason = _finish_reason(result)
        return RawStructuredObservation(
            shape=parse_objects_present(
                _text_of(result), truncated=finish_reason is FinishReason.TRUNCATED
            ),
            finish_reason=finish_reason,
            completion_tokens=result.perf_metrics.get_num_generated_tokens(),
        )

    def _generate(self, workload: Workload) -> openvino_genai.VLMDecodedResults:
        import openvino_genai

        if self._pipeline is None:
            raise VisionError(
                f"{self._identity.variant} was asked for an Observation before it was loaded"
            )
        config = openvino_genai.GenerationConfig()
        config.max_new_tokens = workload.max_output_tokens
        # temperature 0.0 is greedy: do_sample stays off, and nothing samples (ADR-0013).
        config.do_sample = workload.temperature > 0.0
        if config.do_sample:
            config.temperature = workload.temperature
        return self._pipeline.generate(
            workload.prompt, images=[_to_tensor(workload)], generation_config=config
        )


def _to_tensor(workload: Workload) -> Any:
    """The Frame's bytes decoded to the RGB tensor OpenVINO GenAI wants.

    A Frame is bytes plus a codec (ADR-0004), whatever its source, so it is decoded here rather
    than assumed to be on disk — the same bytes a Benchmark hashes are the bytes that reach the
    model.
    """
    import numpy as np
    import openvino as ov

    with Image.open(io.BytesIO(workload.frame.data)) as image:
        rgb = image.convert("RGB")
        data = np.array(rgb.getdata(), dtype=np.uint8).reshape(1, rgb.height, rgb.width, 3)
    return ov.Tensor(data)


def _text_of(result: openvino_genai.VLMDecodedResults) -> str:
    """The generated text copied out of the result, before anything native is released."""
    return result.texts[0] if result.texts else str(result)


def _finish_reason(result: openvino_genai.VLMDecodedResults) -> FinishReason:
    """Why generation stopped: LENGTH is the output limit, STOP is the model (ADR-0013)."""
    import openvino_genai

    reasons = getattr(result, "finish_reasons", None)
    if not reasons:
        return FinishReason.OTHER
    match reasons[0]:
        case openvino_genai.GenerationFinishReason.STOP:
            return FinishReason.COMPLETE
        case openvino_genai.GenerationFinishReason.LENGTH:
            return FinishReason.TRUNCATED
        case _:
            return FinishReason.OTHER
