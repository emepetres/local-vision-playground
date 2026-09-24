"""``watch --emit``: the JSON Lines contract a Watch writes for ``agent/`` to read.

Driven through the same ``run()`` helper as ``test_watch.py`` — a real ``EmittedWatch``
writes to a real temporary file, and the tests read it back and parse it, rather than
mocking the port. The wall-clock ``now`` is the one port this suite fakes that
``test_watch.py`` does not: every other one is a Cadence concern, already covered there.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import pytest

from tests.fakes import (
    FakeVisionModel,
    HandTurnedReaders,
    make_identity,
    make_structured_observation,
    no_shape,
)
from tests.test_watch import (
    BROKEN,
    CADENCE,
    DESK,
    HAND,
    OVERRUN_READS,
    failing_readings,
    overrun_clock,
    overrun_feed,
    run,
    structured_model,
)
from vision.cli import benchmark_main, main
from vision.emit import require_structured_for_emit
from vision.errors import VisionError
from vision.inference import FinishReason, ObjectsPresent, PresentObject, Where

AT = datetime(2026, 9, 24, 10, 30, 0, tzinfo=timezone(timedelta(hours=2)))
"""The instant every faked ``now()`` returns — one instant is enough: no test here is
about telling Cadences apart by when they landed, only about what each line says."""

VARIANT = "qwen3-vl-2b-instruct-cuda-gpu:2"
"""The Variant ``make_identity()`` resolves to, repeated on every emitted line."""

FIXTURE = Path(__file__).resolve().parents[2] / "docs" / "fixtures" / "watch-emit-contract.jsonl"
"""The checked-in example of the contract, referenced from ``watch.md`` (issue #60)."""


def emitted(path: Path) -> list[dict[str, Any]]:
    """Every line an emitting Watch wrote, parsed back out of the file it wrote them to."""
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


def assert_watch_start_envelope(line: dict[str, Any]) -> None:
    """What the first line of any emitted Watch promises, whatever it was asked for."""
    assert line["type"] == "watch_start"
    assert isinstance(line["time"], str)
    assert isinstance(line["variant"], str)
    assert isinstance(line["cadence"], int | float)


def assert_cadence_envelope(line: dict[str, Any]) -> None:
    """What every Cadence line promises, whichever outcome it came to.

    The object shape inside an "objects" outcome is checked in full here — name, count and
    ``where`` (issue #64) — because it is exactly what `docs/fixtures/watch-emit-contract.jsonl`
    promises and this is the one place that keeps both honest against each other.
    """
    assert line["type"] == "cadence"
    assert isinstance(line["cadence"], int)
    assert isinstance(line["time"], str)
    assert isinstance(line["variant"], str)
    assert isinstance(line["truncated"], bool)
    outcome = line["outcome"]
    assert outcome in ("objects", "no_shape", "failed")
    if outcome == "objects":
        assert isinstance(line["objects"], list)
        for obj in line["objects"]:
            assert isinstance(obj["name"], str)
            assert isinstance(obj["count"], int)
            assert obj["where"] in ("tray", "zone", "hand", "elsewhere")
    elif outcome == "no_shape":
        assert isinstance(line["reason"], str)
    else:
        assert isinstance(line["error"], str)
    shortfall = line["shortfall"]
    if shortfall is not None:
        assert set(shortfall) == {"skipped_cadences", "stale_frames"}
        assert isinstance(shortfall["skipped_cadences"], int)
        assert isinstance(shortfall["stale_frames"], int)
    # Never a Frame, nor a path to one — an emitted line is what was seen, not the seeing.
    assert "saved" not in line
    assert "frame" not in line


def test_require_structured_for_emit_refuses_emit_without_structured() -> None:
    with pytest.raises(VisionError, match="--structured"):
        require_structured_for_emit(Path("observations.jsonl"), structured=False)


def test_require_structured_for_emit_allows_structured() -> None:
    require_structured_for_emit(Path("observations.jsonl"), structured=True)


def test_require_structured_for_emit_allows_no_emit_at_all() -> None:
    require_structured_for_emit(None, structured=False)


def test_emit_without_structured_is_refused_before_the_camera_or_the_model(
    tmp_path: Path,
) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(["--count", "1", "--emit", str(path)])

    assert result.code == 1
    assert "--structured" in result.err
    assert result.cameras.opened == []
    assert result.model.downloads == 0
    assert result.model.loaded is False
    assert not path.exists()


def test_observe_does_not_accept_emit(tmp_path: Path) -> None:
    with pytest.raises(SystemExit):
        main(["--emit", str(tmp_path / "observations.jsonl")])


def test_benchmark_does_not_accept_emit(tmp_path: Path) -> None:
    with pytest.raises(SystemExit):
        benchmark_main(["--emit", str(tmp_path / "observations.jsonl")])


def test_nothing_is_written_when_emit_is_not_asked_for(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(["--count", "1", "--structured"], model=structured_model(DESK), observations=1)

    assert result.code == 0
    assert not path.exists()


def test_each_watch_deletes_and_recreates_the_file_at_its_start(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"
    path.write_text("stale content left over from a previous run\n", encoding="utf-8")

    result = run(
        ["--count", "1", "--structured", "--emit", str(path)],
        model=structured_model(DESK),
        observations=1,
        now=lambda: AT,
    )

    assert result.code == 0
    content = path.read_text(encoding="utf-8")
    assert "stale content" not in content
    assert emitted(path)[0]["type"] == "watch_start"


def test_the_first_line_describes_the_watch(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(
        ["--count", "1", "--structured", "--emit", str(path)],
        model=structured_model(DESK),
        observations=1,
        now=lambda: AT,
    )

    assert result.code == 0
    assert emitted(path)[0] == {
        "type": "watch_start",
        "time": AT.isoformat(),
        "variant": VARIANT,
        "cadence": CADENCE,
    }


def test_an_objects_cadence_is_emitted_with_its_full_envelope(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(
        ["--count", "1", "--structured", "--emit", str(path)],
        model=structured_model(DESK),
        observations=1,
        now=lambda: AT,
    )

    assert result.code == 0
    assert emitted(path)[1] == {
        "type": "cadence",
        "cadence": 1,
        "time": AT.isoformat(),
        "variant": VARIANT,
        "outcome": "objects",
        "objects": [
            {"name": "cup", "count": 2, "where": "zone"},
            {"name": "laptop", "count": 1, "where": "zone"},
        ],
        "truncated": False,
        "shortfall": None,
    }


def test_a_no_shape_cadence_is_emitted_with_the_reason_the_model_gave(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"
    reason = "the model answered in prose instead of the list of objects the shape asks for"

    result = run(
        ["--count", "1", "--structured", "--emit", str(path)],
        model=structured_model(no_shape(reason)),
        observations=1,
        now=lambda: AT,
    )

    assert result.code == 0
    cadence = emitted(path)[1]
    assert cadence["outcome"] == "no_shape"
    assert cadence["reason"] == reason
    assert "objects" not in cadence


def test_a_failed_cadence_is_emitted_with_its_one_line_error(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(
        ["--count", "1", "--structured", "--emit", str(path)],
        model=structured_model(BROKEN),
        clock=failing_readings(1),
        observations=1,
        now=lambda: AT,
    )

    assert result.code == 1
    cadence = emitted(path)[1]
    assert cadence["outcome"] == "failed"
    assert cadence["error"] == "RuntimeError: the model server went away"
    assert cadence["truncated"] is False
    assert cadence["shortfall"] is None


def test_a_truncated_cadence_is_emitted_with_truncated_true(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[
            make_structured_observation(
                ObjectsPresent((PresentObject("cup", 2, Where.ZONE),)), FinishReason.TRUNCATED
            )
        ],
    )

    result = run(
        ["--count", "1", "--structured", "--emit", str(path)],
        model=model,
        observations=1,
        now=lambda: AT,
    )

    assert result.code == 0
    assert emitted(path)[1]["truncated"] is True


def test_a_late_cadence_carries_its_shortfall(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(
        ["--count", "3", "--structured", "--emit", str(path)],
        model=structured_model(DESK, HAND, DESK),
        feeds={0: overrun_feed()},
        clock=overrun_clock(),
        readers=HandTurnedReaders(OVERRUN_READS),
        now=lambda: AT,
    )

    assert result.code == 0
    cadences = emitted(path)[1:]
    assert cadences[0]["shortfall"] is None
    assert cadences[1]["shortfall"] == {"skipped_cadences": 2, "stale_frames": 2}
    assert cadences[2]["shortfall"] is None


def test_never_a_frame_even_under_keep_frames(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"
    frames_dir = tmp_path / "frames"

    result = run(
        ["--count", "1", "--structured", "--keep-frames", "--emit", str(path)],
        model=structured_model(DESK),
        observations=1,
        frames_dir=frames_dir,
        now=lambda: AT,
    )

    assert result.code == 0
    assert list(frames_dir.glob("*.jpg"))
    raw = path.read_text(encoding="utf-8")
    assert "saved" not in raw
    assert str(frames_dir) not in raw
    assert ".jpg" not in raw


def test_what_emit_writes_conforms_to_the_envelope_the_fixture_promises(tmp_path: Path) -> None:
    path = tmp_path / "observations.jsonl"

    result = run(
        ["--count", "3", "--structured", "--emit", str(path)],
        model=structured_model(DESK, HAND, DESK),
        feeds={0: overrun_feed()},
        clock=overrun_clock(),
        readers=HandTurnedReaders(OVERRUN_READS),
        now=lambda: AT,
    )

    assert result.code == 0
    lines = emitted(path)
    assert_watch_start_envelope(lines[0])
    for line in lines[1:]:
        assert_cadence_envelope(line)


def test_the_checked_in_fixture_conforms_to_the_envelope_every_emitted_line_promises() -> None:
    """The example ``watch.md`` points readers of ``agent/`` at — kept honest by this test."""
    lines = emitted(FIXTURE)

    assert_watch_start_envelope(lines[0])
    for line in lines[1:]:
        assert_cadence_envelope(line)
