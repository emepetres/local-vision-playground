"""Writing a Benchmark down, so that it outlives the process that measured it.

A Benchmark is the unit that is persisted and read back later (CONTEXT.md), and until now
it was not persisted at all: the numbers lived in a terminal that scrolls, and the sitting
an Operator spent minutes on was gone when the process exited.

Two files, written together and from the same value. The JSON is the record — everything
the Benchmark knows, in a shape a later tool can read — and the Markdown is the same
Benchmark laid out to be read by a person, in a pull request or on a projector when the
live demo has just failed. They are written in one call rather than by two commands
because a Markdown table that could disagree with its own JSON is worse than either alone.

The JSON carries a ``schema_version``. Nothing here reads a record back, and comparing two
machines' Benchmarks is deliberately not built yet — the version is what keeps that door
open, by making today's files identifiable to the tool that will one day want them.

The file names carry a slug of the Hardware Profile and a full timestamp, so that two
machines' records never collide and three Benchmarks taken while tuning a demo on the same
afternoon do not overwrite one another.
"""

from __future__ import annotations

import json
import os
import platform
import re
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from itertools import count
from pathlib import Path
from typing import Any

from vision.benchmark import (
    AnyBenchmarkRun,
    Benchmark,
    MeasuredVariant,
    StructuredBenchmarkRun,
    UnmeasuredVariant,
)
from vision.inference import ModelIdentity, NoShape, Shape, Workload
from vision.reporting import render_benchmark_markdown

SCHEMA_VERSION = 2
"""What shape the JSON is in.

Bumped when a reader written against the old shape would misread the new one — not when a
field is added that such a reader can ignore. Version 2 moved the Benchmark-level machine
from the top-level ``hardware_profile`` to ``machine`` and gave that name to a new per-row
derived triple (machine + Runtime + Execution Provider). A version-1 reader misreads it two
ways: it no longer finds the machine where it read it, and the ``hardware_profile`` name it
knew as a plain string now stands, per row, for the triple.
"""

BENCHMARKS_DIRECTORY = Path(__file__).resolve().parents[3] / "docs" / "benchmarks"
"""Where records are kept — ``docs/benchmarks/``, in the repository.

Resolved from this module rather than from the working directory, like the reference Frame
and for the same reason: a Benchmark run from anywhere writes to the same place. They are
in ``docs/`` rather than in a scratch directory because a Benchmark is a document — the
answer to "what does this cost on that machine?" is worth reviewing in a pull request.
"""


def benchmarks_directory() -> Path:
    """Where a Benchmark is kept when the caller has no opinion.

    A function rather than the constant read straight off the module, for the reason the
    command resolves its clock through one: it is read when a Benchmark is recorded rather
    than when the command is imported, which is what lets the whole test suite point it
    somewhere temporary and keep a Benchmark of a fake model out of ``docs/``.
    """
    return BENCHMARKS_DIRECTORY


Now = Callable[[], datetime]
"""Reads the wall clock. Injected so a record's name and instant are pinnable in a test.

Not the ``Clock`` the latencies are taken with: that one is monotonic and says nothing
about what day it is, which is the one thing a record needs from a clock.
"""

MAXIMUM_SLUG = 60
"""How much of a declared machine a file name carries.

An Operator describing their machine in words is welcome to be generous; a file name is
not the place it all fits, and the full text is in both files anyway.
"""

UNNAMED = "machine"
"""The file-name stem for a machine description that slugs down to nothing at all."""


@dataclass(frozen=True)
class Recorded:
    """Where a Benchmark was written down. Both paths, because both were written."""

    json: Path
    markdown: Path


def this_machine() -> str:
    """What the standard library reports about this machine, for an undeclared Benchmark.

    A fallback, not an answer: it names the host and the platform, which is enough to tell
    two machines apart and nowhere near enough to explain a latency. That is why the
    Operator is asked to describe the machine in words — "RTX 4090 + i7-13700KF" is what a
    reader six months from now needs, and no amount of probing would produce it.

    Nothing here probes the hardware. There is no portable way to ask a machine what GPU it
    has, and a Benchmark that shelled out to a vendor tool to find out would be a Benchmark
    that fails differently on every machine — for a string. So a Benchmark is never
    anonymous, and never claims to know more than the standard library told it.
    """
    cpus = os.cpu_count()
    parts = [
        platform.node() or "unknown host",
        " ".join(part for part in (platform.system(), platform.release()) if part),
        platform.machine(),
        f"{cpus} CPUs" if cpus else "",
    ]
    return ", ".join(part for part in parts if part)


def resolve_machine(declared: str | None) -> str:
    """What the Operator said the machine is, or what the machine says about itself.

    The machine is Benchmark-level: one sitting is one machine, and only the Runtime and the
    Execution Provider vary from Run to Run (CONTEXT.md, "Hardware Profile"). It resolves to
    the machine rather than a "hardware profile" because a Hardware Profile is now the derived
    triple that authorises a comparison — machine, Runtime and Execution Provider together —
    and the machine is only its constant part.
    """
    if declared is not None and declared.strip():
        return declared.strip()
    return this_machine()


def record(
    benchmark: Benchmark,
    *,
    machine: str,
    at: datetime,
    directory: Path,
) -> Recorded:
    """Write the JSON and the Markdown, under one name, and say where they went.

    Both are rendered before either is written, so that a Benchmark whose Markdown cannot
    be laid out does not leave half of itself on disk.
    """
    directory.mkdir(parents=True, exist_ok=True)
    document = render_benchmark_markdown(benchmark, machine=machine, at=at)
    payload = json.dumps(as_record(benchmark, machine=machine, at=at), indent=2)
    return _claim(directory, _stem(machine, at), payload=payload, document=document)


def as_record(benchmark: Benchmark, *, machine: str, at: datetime) -> dict[str, Any]:
    """The whole Benchmark as plain data — the raw record the Markdown is a reading of.

    Everything the Benchmark holds, including what the report leaves out: every Benchmark
    Run rather than the spread over them, because a spread can be recomputed from the runs
    and the runs cannot be recovered from a spread.

    ``machine`` sits at Benchmark level because a Benchmark is one sitting on one machine
    (CONTEXT.md, "Hardware Profile"); each Variant row then carries the derived Hardware
    Profile triple that pairs it with the Runtime and Execution Provider that vary from Run
    to Run.
    """
    return {
        "schema_version": SCHEMA_VERSION,
        "recorded_at": at.isoformat(),
        "machine": machine,
        "workload": _workload(benchmark.workload),
        "repetitions": benchmark.repetitions,
        "provider_registration": benchmark.providers,
        # The list is in the order the Variants were measured in, and each one carries the
        # turn it took as well — so a record read back through a tool that sorts the rows
        # has not thereby lost what the order was.
        "variants": [
            _variant(variant, structured=benchmark.structured, machine=machine)
            for variant in benchmark.variants
        ],
        "token_divergence": _divergence(benchmark),
    }


def _workload(workload: Workload) -> dict[str, Any]:
    """The Workload, with the Frame identified by its bytes rather than by its name.

    The hash, the dimensions and the byte length together: "the same Workload" is then a
    claim a reader can verify against a Frame of their own instead of one they have to
    take on trust (ADR-0005).
    """
    frame = workload.frame
    return {
        "prompt": workload.prompt,
        "max_output_tokens": workload.max_output_tokens,
        "temperature": workload.temperature,
        "frame": {
            "sha256": frame.digest,
            "bytes": len(frame.data),
            "width": frame.width,
            "height": frame.height,
            "codec": frame.codec,
            "provenance": frame.provenance,
        },
    }


def _variant(
    variant: MeasuredVariant | UnmeasuredVariant, *, structured: bool, machine: str
) -> dict[str, Any]:
    """One Variant as it is written down, whether or not it ever got onto the hardware.

    Both kinds are written in the same shape, with the same keys present either way: a
    reader that had to discover which kind of Variant it was holding before it could read
    any field would make an Unmeasured Variant an exception again, in a record whose whole
    point is that it is not one (ADR-0007). ``structured`` fixes that shape for the whole
    sitting: a prose Variant carries its ``observation`` and a structured one carries its
    ``objects`` (and the reason there was no shape), so every Variant in one record — the
    Unmeasured ones included — carries the answer keys of the kind of Benchmark it belongs to.

    ``runtime`` names which Runtime loaded it, and ``provenance`` carries the structured
    manifest an OpenVINO Variant is identified by — ``None`` for a Foundry Local Variant,
    whose ``id`` already identifies it (CONTEXT.md, "Provenance"). Both keys are present
    either way, for the reason above: a reader groups the rows by ``runtime`` without first
    having to work out which Runtime a row came from. ``hardware_profile`` is the derived
    triple (machine + Runtime + Execution Provider) that authorises a comparison — it is not
    the row's identity, which is the Measured Variant's ``id`` (CONTEXT.md, "Hardware Profile").
    """
    identity = variant.model
    recorded: dict[str, Any] = {
        "order": variant.order,
        "id": identity.variant,
        "alias": identity.alias,
        "runtime": identity.runtime,
        "execution_provider": identity.execution_provider,
        "device_type": identity.device_type,
        "hardware_profile": _hardware_profile(identity, machine),
        "provenance": identity.provenance,
        "loaded": isinstance(variant, MeasuredVariant),
        "reason": None,
        "load": None,
        "runs": [],
        **_empty_answer(structured),
    }
    if isinstance(variant, UnmeasuredVariant):
        recorded["reason"] = variant.reason
        return recorded

    recorded["load"] = variant.load
    recorded["runs"] = [
        {
            "inference": run.inference,
            "completion_tokens": run.completion_tokens,
            "finish_reason": str(run.finish_reason),
        }
        for run in variant.runs
    ]
    recorded.update(_answer(variant.first))
    return recorded


def _hardware_profile(identity: ModelIdentity, machine: str) -> dict[str, Any]:
    """The derived triple that authorises comparing a Benchmark Run against another.

    Machine, Runtime and Execution Provider together (CONTEXT.md, "Hardware Profile"): the
    machine is constant across the sitting, the Runtime and the Execution Provider vary from
    Run to Run, and it is naming all three that keeps FL-CPU and OV-CPU from collapsing into
    one row — the two are the same CPU through two Runtimes, the calibration between them. The
    Execution Provider is the bare hardware backend (CPU here, not ``CPUExecutionProvider``),
    so the two CPU rows agree on it and differ only in their Runtime. It authorises a
    comparison; it does not identify the row — that is the Measured Variant's ``id``.
    """
    return {
        "machine": machine,
        "runtime": identity.runtime,
        "execution_provider": identity.dispatched_execution_provider,
    }


def _empty_answer(structured: bool) -> dict[str, Any]:
    """The answer keys a Variant with nothing to say carries, in this sitting's shape.

    The keys are the same whether the Variant was measured or not, so that a reader never has
    to know which kind it is holding to read them (ADR-0007). Which keys they are is the
    sitting's, not the Variant's: a structured Benchmark's rows carry ``objects`` where a
    prose Benchmark's carry ``observation``.
    """
    if structured:
        return {"objects": None, "no_shape": None}
    return {"observation": None}


def _answer(run: AnyBenchmarkRun) -> dict[str, Any]:
    """What the cold Benchmark Run said, as the machine-readable answer for its kind.

    Prose is one string. A Structured Observation is the list of objects as data — not a
    quoted paragraph — so that a later tool reads the objects rather than parsing them back
    out of prose; a "no shape" run carries no objects and the reason it had none instead
    (ADR-0008, ADR-0011).
    """
    if isinstance(run, StructuredBenchmarkRun):
        return _shape(run.shape)
    return {"observation": run.text}


def _shape(shape: Shape) -> dict[str, Any]:
    """A Structured Observation's shape as record fields: the objects, or the "no shape" reason."""
    if isinstance(shape, NoShape):
        return {"objects": None, "no_shape": shape.reason}
    return {
        "objects": [{"name": present.name, "count": present.count} for present in shape.objects],
        "no_shape": None,
    }


def _divergence(benchmark: Benchmark) -> dict[str, Any] | None:
    """The reason these Variants' latencies are not a comparison, when there is one.

    Recorded rather than left to be recomputed, even though it is derived: it is the one
    thing in the record that is about the sitting as a whole, and a reader who never looks
    for it is exactly the reader it exists for.
    """
    divergence = benchmark.divergence
    if divergence is None:
        return None
    return {
        "fewest": divergence.fewest.variant,
        "fewest_tokens": divergence.fewest_tokens,
        "most": divergence.most.variant,
        "most_tokens": divergence.most_tokens,
        "fraction": divergence.fraction,
    }


def _stem(machine: str, at: datetime) -> str:
    """A slug of the machine, and the instant it was recorded at.

    The machine first, because a directory of records sorts by machine that way and the
    machine is what an Operator scanning the list is looking for. The timestamp goes down to
    the second so that two Benchmarks taken while tuning a demo on the same afternoon are two
    files.
    """
    return f"{_slug(machine)}-{at.strftime('%Y%m%d-%H%M%S')}"


def _slug(machine: str) -> str:
    """The machine reduced to something a file system will take everywhere."""
    slug = re.sub(r"[^a-z0-9]+", "-", machine.lower()).strip("-")
    return slug[:MAXIMUM_SLUG].strip("-") or UNNAMED


def _claim(directory: Path, stem: str, *, payload: str, document: str) -> Recorded:
    """Write both files under a name nothing else holds, and answer with the names taken.

    Exclusive creation rather than a check followed by a write, and of both files rather
    than only the record: two Benchmarks finishing in the same second is unlikely, and a
    Benchmark that quietly overwrote another one's record — or its Markdown, which is the
    half a reader is more likely to have opened — would be the one failure this whole
    module exists to prevent.

    A name is only taken when both halves of it were free. If the second file cannot be
    written both are taken back off disk, because a record with no document beside it — or
    a document written only halfway — is a pair that was never written together.
    """
    for attempt in count():
        suffix = "" if attempt == 0 else f"-{attempt}"
        path = directory / f"{stem}{suffix}.json"
        markdown = path.with_suffix(".md")
        try:
            with path.open("x", encoding="utf-8") as file:
                file.write(payload + "\n")
        except FileExistsError:
            continue

        try:
            with markdown.open("x", encoding="utf-8") as file:
                file.write(document)
        except FileExistsError:
            path.unlink()
            continue
        except OSError:
            # Both halves go, not only the record: exclusive creation has already put the
            # document on disk, and a truncated Markdown left in this directory reads like
            # a real record to whoever opens it next.
            path.unlink()
            markdown.unlink(missing_ok=True)
            raise
        return Recorded(json=path, markdown=markdown)
    raise AssertionError("unreachable")
