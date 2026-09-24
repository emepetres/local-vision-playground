"""Unit tests for the pieces of the inference port that hold no native handle."""

from __future__ import annotations

import os

import pytest

from vision.inference import (
    APP_NAME,
    InProcessFoundryLocal,
    _disable_runtime_telemetry,
    _foundry_configuration,
    _version_key,
)


def test_orders_catalogue_versions_numerically() -> None:
    """The day the catalogue reaches double digits, a string comparison picks version 9 over
    version 10 — an older build, silently, with nothing to say it happened."""
    assert max(["9", "10"], key=_version_key) == "10"
    assert max([9, 10], key=_version_key) == 10


def test_sorts_a_version_it_cannot_read_below_the_ones_it_can() -> None:
    """The SDK ships as a native extension with no stubs to say what a version really is, so
    an unnumbered one loses to any number rather than deciding the answer."""
    assert max(["2", "preview"], key=_version_key) == "2"
    assert max(["preview", "release"], key=_version_key) == "release"


def test_disables_ort_telemetry_when_nothing_asked_otherwise(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Local-First is literal about telemetry too (CONTEXT.md): the one ONNX Runtime sends
    on its own is silenced by an environment variable, not by Foundry Local's own setting."""
    monkeypatch.delenv("ORT_TELEMETRY_DISABLED", raising=False)
    _disable_runtime_telemetry()
    assert os.environ["ORT_TELEMETRY_DISABLED"] == "1"


def test_never_overrides_an_operators_own_telemetry_setting(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """An Operator's own environment, set before the process started, is theirs to keep."""
    monkeypatch.setenv("ORT_TELEMETRY_DISABLED", "0")
    _disable_runtime_telemetry()
    assert os.environ["ORT_TELEMETRY_DISABLED"] == "0"


def test_constructing_the_runtime_disables_telemetry_before_any_import(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Set in the constructor, not deferred to first use: the native library that reads it
    is imported — and its telemetry initialised — the moment the manager is first touched."""
    monkeypatch.delenv("ORT_TELEMETRY_DISABLED", raising=False)
    InProcessFoundryLocal()
    assert os.environ["ORT_TELEMETRY_DISABLED"] == "1"


def test_foundry_local_is_told_to_disable_its_own_nonessential_telemetry() -> None:
    """The one setting Foundry Local's own SDK offers, built without starting the service."""
    configuration = _foundry_configuration(APP_NAME)
    assert configuration.app_name == APP_NAME
    assert configuration.disable_nonessential_telemetry is True
