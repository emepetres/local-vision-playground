"""When an Observation counts as a repetition loop, and when a text that repeats does not.

The rule is deliberately narrow: a loop is a run of words that goes round and round, not any
text that uses a word twice. The tests pin both sides of that line, including texts that repeat
legitimately, because a rule that cried loop at emphasis would make every Variant look broken.
"""

from __future__ import annotations

import pytest

from vision.inference import NoShape, ObjectsPresent, PresentObject, Where
from vision.loops import loops_in_objects, loops_in_text

LOOPING_CHANNEL_WISE_TEXT = (
    "The image shows a desk with a green mat and a white tray. "
    "The image shows a desk with a green mat and a white tray. "
    "The image shows a desk with a green mat and a white tray. "
    "The image shows a desk with a green"
)


def test_a_sentence_repeated_back_to_back_is_a_loop() -> None:
    assert loops_in_text(LOOPING_CHANNEL_WISE_TEXT)


def test_a_single_word_repeated_many_times_is_a_loop() -> None:
    assert loops_in_text("A cup " + "the " * 14 + "end")


def test_a_loop_that_starts_after_a_clean_beginning_is_still_found() -> None:
    assert loops_in_text("A tidy desk. " + LOOPING_CHANNEL_WISE_TEXT)


def test_case_and_punctuation_do_not_hide_a_loop() -> None:
    assert loops_in_text(LOOPING_CHANNEL_WISE_TEXT.upper().replace(".", "!"))


@pytest.mark.parametrize(
    "text",
    [
        "",
        "A desk with a green mat, a white tray and a soldering iron on the board.",
        "There is no, no, no way that cup belongs on the mat.",
        "It is very very very big.",
        "The cup is on the mat. The cup is blue. The cup is empty.",
        "Left tray: brush, tweezers. Right tray: brush, tweezers.",
        "The image shows a desk. The image shows a desk.",
    ],
    ids=[
        "empty",
        "plain description",
        "emphatic word repeated three times",
        "emphasis",
        "a sentence opening reused with different endings",
        "a phrase legitimately repeated twice in a list",
        "a whole sentence said twice",
    ],
)
def test_a_text_that_repeats_legitimately_is_not_a_loop(text: str) -> None:
    assert not loops_in_text(text)


def test_the_same_object_listed_three_times_running_is_a_loop() -> None:
    cup = PresentObject("cup", 1, Where.ZONE)
    assert loops_in_objects(ObjectsPresent((cup, cup, cup)))


def test_the_same_object_in_two_places_or_not_in_a_row_is_not_a_loop() -> None:
    cup = PresentObject("cup", 1, Where.ZONE)
    tray_cup = PresentObject("cup", 1, Where.TRAY)
    brush = PresentObject("brush", 1, Where.TRAY)
    assert not loops_in_objects(ObjectsPresent((cup, cup)))
    assert not loops_in_objects(ObjectsPresent((cup, tray_cup, cup, brush, cup)))
    assert not loops_in_objects(ObjectsPresent(()))


def test_a_no_shape_has_no_objects_to_loop_over() -> None:
    assert not loops_in_objects(NoShape("the model answered in prose"))


def test_the_recorded_2b_ir_loops_on_openvino_and_not_on_foundry_local() -> None:
    """The contrast the Benchmark exists to show, read off the real recorded Observations."""
    import json
    from pathlib import Path

    record = Path(__file__).resolve().parents[2] / "docs" / "benchmarks"
    record = next(record.glob("asus-zenbook-s14-*-20260922-090814.json"))
    variants = json.loads(record.read_text(encoding="utf-8"))["variants"]
    looped = {v["id"]: loops_in_text(v["observation"]) for v in variants}

    assert looped == {
        "qwen3-vl-2b-instruct-generic-cpu:2": False,
        "qwen3-vl-2b-instruct-int4-sym-cpu": True,
        "qwen3-vl-2b-instruct-int4-sym-gpu": True,
        "qwen3-vl-2b-instruct-int4-sym-npu": True,
    }
