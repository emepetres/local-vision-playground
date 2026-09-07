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

from vision.benchmark import Benchmark, MeasuredVariant, UnmeasuredVariant
from vision.inference import Workload
from vision.reporting import render_benchmark_markdown

SCHEMA_VERSION = 1
"""What shape the JSON is in.

Bumped when a reader written against the old shape would misread the new one — not when a
field is added that such a reader can ignore.
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
"""How much of a declared Hardware Profile a file name carries.

An Operator describing their machine in words is welcome to be generous; a file name is
not the place it all fits, and the full text is in both files anyway.
"""

UNNAMED = "machine"
"""The file-name stem for a Hardware Profile that slugs down to nothing at all."""


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


def hardware_profile(declared: str | None) -> str:
    """What the Operator said the machine is, or what the machine says about itself."""
    if declared is not None and declared.strip():
        return declared.strip()
    return this_machine()


def record(
    benchmark: Benchmark,
    *,
    profile: str,
    at: datetime,
    directory: Path,
) -> Recorded:
    """Write the JSON and the Markdown, under one name, and say where they went.

    Both are rendered before either is written, so that a Benchmark whose Markdown cannot
    be laid out does not leave half of itself on disk.
    """
    directory.mkdir(parents=True, exist_ok=True)
    document = render_benchmark_markdown(benchmark, profile=profile, at=at)
    payload = json.dumps(as_record(benchmark, profile=profile, at=at), indent=2)
    return _claim(directory, _stem(profile, at), payload=payload, document=document)


def as_record(benchmark: Benchmark, *, profile: str, at: datetime) -> dict[str, Any]:
    """The whole Benchmark as plain data — the raw record the Markdown is a reading of.

    Everything the Benchmark holds, including what the report leaves out: every Benchmark
    Run rather than the spread over them, because a spread can be recomputed from the runs
    and the runs cannot be recovered from a spread.
    """
    return {
        "schema_version": SCHEMA_VERSION,
        "recorded_at": at.isoformat(),
        "hardware_profile": profile,
        "workload": _workload(benchmark.workload),
        "repetitions": benchmark.repetitions,
        "provider_registration": benchmark.providers,
        # The list is in the order the Variants were measured in, and each one carries the
        # turn it took as well — so a record read back through a tool that sorts the rows
        # has not thereby lost what the order was.
        "variants": [_variant(variant) for variant in benchmark.variants],
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


def _variant(variant: MeasuredVariant | UnmeasuredVariant) -> dict[str, Any]:
    """One Variant as it is written down, whether or not it ever got onto the hardware.

    Both kinds are written in the same shape, with the same keys present either way: a
    reader that had to discover which kind of Variant it was holding before it could read
    any field would make an Unmeasured Variant an exception again, in a record whose whole
    point is that it is not one (ADR-0007).
    """
    identity = variant.model
    recorded: dict[str, Any] = {
        "order": variant.order,
        "id": identity.variant,
        "alias": identity.alias,
        "execution_provider": identity.execution_provider,
        "device_type": identity.device_type,
        "loaded": isinstance(variant, MeasuredVariant),
        "reason": None,
        "load": None,
        "runs": [],
        "observation": None,
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
    recorded["observation"] = variant.observation
    return recorded


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


def _stem(profile: str, at: datetime) -> str:
    """A slug of the Hardware Profile, and the instant it was recorded at.

    The Hardware Profile first, because a directory of records sorts by machine that way
    and the machine is what an Operator scanning the list is looking for. The timestamp
    goes down to the second so that two Benchmarks taken while tuning a demo on the same
    afternoon are two files.
    """
    return f"{_slug(profile)}-{at.strftime('%Y%m%d-%H%M%S')}"


def _slug(profile: str) -> str:
    """The Hardware Profile reduced to something a file system will take everywhere."""
    slug = re.sub(r"[^a-z0-9]+", "-", profile.lower()).strip("-")
    return slug[:MAXIMUM_SLUG].strip("-") or UNNAMED


def _claim(directory: Path, stem: str, *, payload: str, document: str) -> Recorded:
    """Write both files under a name nothing else holds, and answer with the names taken.

    Exclusive creation rather than a check followed by a write, and of both files rather
    than only the record: two Benchmarks finishing in the same second is unlikely, and a
    Benchmark that quietly overwrote another one's record — or its Markdown, which is the
    half a reader is more likely to have opened — would be the one failure this whole
    module exists to prevent.

    A name is only taken when both halves of it were free. If the second file cannot be
    written the first is taken back off disk, because a record with no document beside it
    is a pair that was never written together.
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
            path.unlink()
            raise
        return Recorded(json=path, markdown=markdown)
    raise AssertionError("unreachable")
