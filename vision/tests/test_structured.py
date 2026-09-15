"""Unit tests for ``parse_objects_present`` — the JSON-in-prompt reader the real adapter
uses to turn a model's reply into a Structured Observation's shape.

The fake model returns a prepared shape, so nothing above the port exercises this parsing.
It is the real adapter's brain, and the failure modes it has to survive are the ones the
spike behind issue #30 measured (docs/research/2026-09-15-forced-tool-call-with-image.md):
a markdown code fence around the array, a truncated array, an array of bare strings, and a
reply that is prose with no array at all.
"""

from __future__ import annotations

from vision.inference import NoShape, ObjectsPresent, PresentObject, parse_objects_present


def test_reads_a_plain_json_array_of_name_and_count() -> None:
    shape = parse_objects_present('[{"name": "cup", "count": 2}, {"name": "book", "count": 1}]')

    assert shape == ObjectsPresent((PresentObject("cup", 2), PresentObject("book", 1)))


def test_an_empty_array_is_an_empty_list_not_a_no_shape() -> None:
    assert parse_objects_present("[]") == ObjectsPresent(())


def test_strips_a_markdown_code_fence_the_model_wraps_the_array_in() -> None:
    """The model fences the array even when told not to (spike Result 2)."""
    fenced = '```json\n[{"name": "lamp", "count": 1}]\n```'

    assert parse_objects_present(fenced) == ObjectsPresent((PresentObject("lamp", 1),))


def test_reads_the_array_out_of_surrounding_prose() -> None:
    """First '[' to last ']', so a preamble before the array does not defeat it."""
    reply = 'Here is what I see: [{"name": "chair", "count": 3}]. Hope that helps.'

    assert parse_objects_present(reply) == ObjectsPresent((PresentObject("chair", 3),))


def test_prose_with_no_array_is_a_no_shape() -> None:
    shape = parse_objects_present("I can see a desk with a laptop and a mug on it.")

    assert isinstance(shape, NoShape)
    assert "prose" in shape.reason


def test_a_truncated_array_flagged_as_such_names_the_output_limit() -> None:
    """The commonest failure: the output limit cut the array off before its closing ']'."""
    cut_off = '[{"name": "book", "count": 1}, {"name": "book", "count": 1}, {"name": "boo'

    shape = parse_objects_present(cut_off, truncated=True)

    assert isinstance(shape, NoShape)
    assert "output limit" in shape.reason


def test_malformed_json_that_is_not_flagged_truncated_is_a_no_shape() -> None:
    shape = parse_objects_present('[{"name": "cup", "count": }]')

    assert isinstance(shape, NoShape)
    assert "output limit" not in shape.reason


def test_a_decode_failure_under_truncation_names_the_output_limit() -> None:
    """A ']' inside a string can leave a truncated reply with brackets that do not parse."""
    cut_off = '[{"name": "box]", "count": 1}, {"nam'

    shape = parse_objects_present(cut_off, truncated=True)

    assert isinstance(shape, NoShape)
    assert "output limit" in shape.reason


def test_an_array_of_bare_strings_does_not_match_the_shape() -> None:
    """Without the worked example the model returns bare strings (spike Result 1)."""
    shape = parse_objects_present('["book", "chair", "door"]')

    assert isinstance(shape, NoShape)
    assert "{name, count}" in shape.reason


def test_a_count_below_one_is_not_present() -> None:
    shape = parse_objects_present('[{"name": "cup", "count": 0}]')

    assert isinstance(shape, NoShape)


def test_a_boolean_count_is_not_read_as_one() -> None:
    """``true`` is an ``int`` in Python; the shape asks for a whole-number count."""
    shape = parse_objects_present('[{"name": "cup", "count": true}]')

    assert isinstance(shape, NoShape)


def test_a_missing_name_does_not_match_the_shape() -> None:
    shape = parse_objects_present('[{"count": 2}]')

    assert isinstance(shape, NoShape)


def test_a_bare_scalar_between_brackets_is_a_no_shape() -> None:
    """First '[' to last ']' can still enclose something that is not a list of objects."""
    shape = parse_objects_present("[42]")

    assert isinstance(shape, NoShape)
    assert "{name, count}" in shape.reason


def test_lifts_the_array_out_of_an_object_the_model_wrapped_it_in() -> None:
    """The model sometimes wraps the array in a key; first '[' to last ']' still finds it."""
    shape = parse_objects_present('{"objects": [{"name": "cup", "count": 1}]}')

    assert shape == ObjectsPresent((PresentObject("cup", 1),))
