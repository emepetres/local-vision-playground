"""Unit tests for ``parse_objects_present`` — the JSON-in-prompt reader the real adapter
uses to turn a model's reply into a Structured Observation's shape.

The fake model returns a prepared shape, so nothing above the port exercises this parsing.
It is the real adapter's brain, and the failure modes it has to survive are the ones the
spike behind issue #30 measured (docs/research/2026-09-15-forced-tool-call-with-image.md):
a markdown code fence around the array, a truncated array, an array of bare strings, and a
reply that is prose with no array at all. The ``where`` field's own failure modes — missing
or unrecognised — are the ones issue #64 (and the #58 Work Cell spike) added.
"""

from __future__ import annotations

from vision.inference import NoShape, ObjectsPresent, PresentObject, Where, parse_objects_present


def test_reads_a_plain_json_array_of_name_count_and_where() -> None:
    shape = parse_objects_present(
        '[{"name": "cup", "count": 2, "where": "zone"},'
        ' {"name": "book", "count": 1, "where": "tray"}]'
    )

    assert shape == ObjectsPresent(
        (PresentObject("cup", 2, Where.ZONE), PresentObject("book", 1, Where.TRAY))
    )


def test_an_empty_array_is_an_empty_list_not_a_no_shape() -> None:
    assert parse_objects_present("[]") == ObjectsPresent(())


def test_strips_a_markdown_code_fence_the_model_wraps_the_array_in() -> None:
    """The model fences the array even when told not to (spike Result 2)."""
    fenced = '```json\n[{"name": "lamp", "count": 1, "where": "elsewhere"}]\n```'

    assert parse_objects_present(fenced) == ObjectsPresent(
        (PresentObject("lamp", 1, Where.ELSEWHERE),)
    )


def test_reads_the_array_out_of_surrounding_prose() -> None:
    """First '[' to last ']', so a preamble before the array does not defeat it."""
    reply = 'Here is what I see: [{"name": "chair", "count": 3, "where": "zone"}]. Hope that helps.'

    assert parse_objects_present(reply) == ObjectsPresent((PresentObject("chair", 3, Where.ZONE),))


def test_a_stray_bracket_in_prose_after_a_closed_array_does_not_defeat_it() -> None:
    """Decoding stops at the closed array, so a later '[' or a ':]' does not drag into the span."""
    reply = (
        '[{"name": "cup", "count": 1, "where": "tray"}] (that is all I can see) [end] :]'
    )

    assert parse_objects_present(reply) == ObjectsPresent((PresentObject("cup", 1, Where.TRAY),))


def test_a_non_conforming_element_salvages_the_objects_that_closed_before_it() -> None:
    """A complete array with a bad element in the middle keeps the objects before it, like the
    truncated path, rather than throwing the whole list away."""
    reply = (
        '[{"name": "cup", "count": 2, "where": "zone"}, "lamp",'
        ' {"name": "book", "count": 1, "where": "tray"}]'
    )

    assert parse_objects_present(reply) == ObjectsPresent((PresentObject("cup", 2, Where.ZONE),))


def test_prose_with_no_array_is_a_no_shape() -> None:
    shape = parse_objects_present("I can see a desk with a laptop and a mug on it.")

    assert isinstance(shape, NoShape)
    assert "prose" in shape.reason


def test_a_truncated_array_salvages_the_objects_that_closed_before_the_cut() -> None:
    """The output limit cut the array off mid-object; the finished objects are recovered."""
    cut_off = (
        '[{"name": "book", "count": 1, "where": "tray"},'
        ' {"name": "chair", "count": 2, "where": "zone"}, {"name": "doo'
    )

    shape = parse_objects_present(cut_off, truncated=True)

    assert shape == ObjectsPresent(
        (PresentObject("book", 1, Where.TRAY), PresentObject("chair", 2, Where.ZONE))
    )


def test_a_truncation_that_cut_in_before_the_first_object_closed_names_the_limit() -> None:
    """Nothing finished before the cut, so there is nothing to salvage and no shape."""
    shape = parse_objects_present('[{"name": "boo', truncated=True)

    assert isinstance(shape, NoShape)
    assert "output limit" in shape.reason


def test_a_decode_failure_under_truncation_still_salvages_complete_objects() -> None:
    """A ']' inside a string leaves brackets that do not parse; the closed object survives."""
    cut_off = '[{"name": "box]", "count": 1, "where": "zone"}, {"nam'

    shape = parse_objects_present(cut_off, truncated=True)

    assert shape == ObjectsPresent((PresentObject("box]", 1, Where.ZONE),))


def test_malformed_json_that_is_not_flagged_truncated_is_a_no_shape() -> None:
    shape = parse_objects_present('[{"name": "cup", "count": }]')

    assert isinstance(shape, NoShape)
    assert "output limit" not in shape.reason


def test_an_array_of_bare_strings_does_not_match_the_shape() -> None:
    """Without the worked example the model returns bare strings (spike Result 1)."""
    shape = parse_objects_present('["book", "chair", "door"]')

    assert isinstance(shape, NoShape)
    assert "{name, count, where}" in shape.reason


def test_a_count_below_one_is_not_present() -> None:
    shape = parse_objects_present('[{"name": "cup", "count": 0, "where": "zone"}]')

    assert isinstance(shape, NoShape)


def test_a_boolean_count_is_not_read_as_one() -> None:
    """``true`` is an ``int`` in Python; the shape asks for a whole-number count."""
    shape = parse_objects_present('[{"name": "cup", "count": true, "where": "zone"}]')

    assert isinstance(shape, NoShape)


def test_a_missing_name_does_not_match_the_shape() -> None:
    shape = parse_objects_present('[{"count": 2, "where": "zone"}]')

    assert isinstance(shape, NoShape)


def test_a_bare_scalar_between_brackets_is_a_no_shape() -> None:
    """First '[' to last ']' can still enclose something that is not a list of objects."""
    shape = parse_objects_present("[42]")

    assert isinstance(shape, NoShape)
    assert "{name, count, where}" in shape.reason


def test_lifts_the_array_out_of_an_object_the_model_wrapped_it_in() -> None:
    """The model sometimes wraps the array in a key; first '[' to last ']' still finds it."""
    shape = parse_objects_present('{"objects": [{"name": "cup", "count": 1, "where": "tray"}]}')

    assert shape == ObjectsPresent((PresentObject("cup", 1, Where.TRAY),))


# --- where (issue #64): missing or unrecognised, never guessed at or coerced -----------------


def test_a_missing_where_does_not_match_the_shape() -> None:
    """An element with no ``where`` at all is exactly as non-conforming as one with no name."""
    shape = parse_objects_present('[{"name": "cup", "count": 1}]')

    assert isinstance(shape, NoShape)


def test_an_unrecognised_where_does_not_match_the_shape() -> None:
    """A ``where`` outside the closed set is never coerced onto the nearest member of it."""
    shape = parse_objects_present('[{"name": "cup", "count": 1, "where": "desk"}]')

    assert isinstance(shape, NoShape)


def test_a_later_element_with_a_missing_where_salvages_the_valid_ones_before_it() -> None:
    """The same non-conforming-element salvage a bad ``name`` or ``count`` gets: what closed
    validly before the bad element is kept, and only the tail is dropped."""
    reply = (
        '[{"name": "cup", "count": 2, "where": "zone"}, {"name": "lamp", "count": 1},'
        ' {"name": "book", "count": 1, "where": "tray"}]'
    )

    assert parse_objects_present(reply) == ObjectsPresent((PresentObject("cup", 2, Where.ZONE),))


def test_a_later_element_with_an_unrecognised_where_salvages_the_valid_ones_before_it() -> None:
    reply = (
        '[{"name": "cup", "count": 2, "where": "zone"},'
        ' {"name": "lamp", "count": 1, "where": "desk"},'
        ' {"name": "book", "count": 1, "where": "tray"}]'
    )

    assert parse_objects_present(reply) == ObjectsPresent((PresentObject("cup", 2, Where.ZONE),))


def test_no_element_with_a_valid_where_is_a_no_shape() -> None:
    """Nothing in the reply carries a ``where`` this shape recognises, so nothing salvages."""
    reply = '[{"name": "cup", "count": 2}, {"name": "lamp", "count": 1, "where": "desk"}]'

    shape = parse_objects_present(reply)

    assert isinstance(shape, NoShape)


def test_a_truncated_reply_whose_cut_object_never_named_a_where_salvages_what_closed() -> None:
    """The output limit cuts inside the second object, before its ``where`` ever appeared —
    the same truncation-salvage path a cut ``name`` or ``count`` takes."""
    cut_off = (
        '[{"name": "cup", "count": 2, "where": "zone"}, {"name": "lamp", "count": 1, "wher'
    )

    shape = parse_objects_present(cut_off, truncated=True)

    assert shape == ObjectsPresent((PresentObject("cup", 2, Where.ZONE),))
