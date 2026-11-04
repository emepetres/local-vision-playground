"""Spotting an Observation that goes round in circles.

The channel-wise INT4 IR degrades into repetition: it says a sentence, then says it again until
the output limit stops it (docs/research/2026-09-25-int4-quantisation.md). Foundry Local's CPU
build of the same model does not. Nothing in a table of seconds says which of the two a Variant
did, and a Benchmark that is judged first on whether the Observation is right has to count it.

The rule is narrow on purpose. A text **loops** when some run of words repeats back-to-back at
least ``MIN_REPETITIONS`` times and the repeated stretch is at least ``MIN_SPAN`` words long. Both
halves matter:

- the repetition count keeps a sentence said twice, or a phrase repeated across a list, from
  being called a loop — people and models repeat themselves once without being broken;
- the span keeps emphasis ("very very very", "no, no, no") from being called one, which three
  repetitions of a single word satisfy on the count alone.

A partly-finished final repetition counts, because a loop is nearly always cut mid-sentence by
the output limit. Case and punctuation are ignored: a loop that changes its full stops is still
a loop. A structured reply has no prose to repeat, so its loop is the same object listed
``MIN_REPETITIONS`` times running.
"""

from __future__ import annotations

import re

from vision.inference import ObjectsPresent, Shape

MIN_REPETITIONS = 3
"""How many times in a row a run of words must occur before it is a loop."""

MIN_SPAN = 12
"""How many words the repeating stretch must cover in total, so emphasis is not a loop."""

_WORD = re.compile(r"\w+")


def loops_in_text(text: str) -> bool:
    """Whether this prose repeats a run of words back-to-back, enough to be a loop."""
    words = _WORD.findall(text.lower())
    longest_unit = len(words) // MIN_REPETITIONS
    for unit in range(1, longest_unit + 1):
        needed = max(MIN_REPETITIONS * unit, MIN_SPAN)
        # A stretch with period ``unit`` is a run of positions where a word equals the one
        # ``unit`` places on; the stretch covers that run plus the first unit.
        matching = 0
        for index in range(len(words) - unit):
            matching = matching + 1 if words[index] == words[index + unit] else 0
            if matching + unit >= needed:
                return True
    return False


def loops_in_objects(shape: Shape) -> bool:
    """Whether a structured reply lists the same object ``MIN_REPETITIONS`` times in a row."""
    if not isinstance(shape, ObjectsPresent):
        return False
    streak = 1
    for previous, present in zip(shape.objects, shape.objects[1:], strict=False):
        streak = streak + 1 if present == previous else 1
        if streak >= MIN_REPETITIONS:
            return True
    return False
