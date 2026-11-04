"""Where the memory measurement looks for an IR: the same cache the runtime reads (#81)."""

from __future__ import annotations

from pathlib import Path

import pytest

from tools.measure.memory import ir_directory


def test_the_ir_cache_override_names_where_a_slug_lives(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setenv("LVP_IR_CACHE", str(tmp_path))
    assert ir_directory("some-slug") == tmp_path / "some-slug"


def test_without_an_override_it_is_the_per_user_cache(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.delenv("LVP_IR_CACHE", raising=False)
    monkeypatch.setenv("LOCALAPPDATA", str(tmp_path))
    assert ir_directory("some-slug") == tmp_path / "local-vision-playground" / "ir" / "some-slug"
