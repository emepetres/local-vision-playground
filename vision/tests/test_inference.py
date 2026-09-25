"""Unit tests for the pieces of the inference port that hold no native handle."""

from __future__ import annotations

import os
from types import SimpleNamespace

import pytest

from vision.inference import (
    APP_NAME,
    InProcessFoundryLocal,
    _disable_runtime_telemetry,
    _foundry_configuration,
    _reached_the_catalogue,
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


def test_foundry_local_reads_the_catalogue_from_the_network_unless_told_otherwise() -> None:
    """With the network there, the catalogue goes on refreshing as it always has."""
    assert _foundry_configuration(APP_NAME).web is None


def test_a_cache_only_configuration_keeps_telemetry_off() -> None:
    """The second manager, started with the network gone, is no exception to Local-First."""
    configuration = _foundry_configuration(APP_NAME, cache_only=True)
    assert configuration.web is not None
    assert configuration.web.external_url is not None
    assert configuration.disable_nonessential_telemetry is True


def _manager_listing(*tasks: str | None) -> SimpleNamespace:
    variants = [SimpleNamespace(info=SimpleNamespace(task=task)) for task in tasks]
    model = SimpleNamespace(variants=variants)
    return SimpleNamespace(catalog=SimpleNamespace(list_models=lambda: [model]))


def test_a_catalogue_that_describes_a_model_was_reached() -> None:
    assert _reached_the_catalogue(_manager_listing(None, "vision-language-chat"))


def test_a_catalogue_of_scanned_models_alone_was_not_reached() -> None:
    """With the network gone, Foundry Local 2.0.1 lists only what a scan of the disk found,
    and a scanned model declares no task — so nothing in it could see a Frame."""
    assert not _reached_the_catalogue(_manager_listing(None, None))


def test_an_empty_catalogue_was_not_reached() -> None:
    assert not _reached_the_catalogue(_manager_listing())


def test_the_manager_that_reaches_for_the_network_logs_errors_only() -> None:
    """With the network gone, its warnings are one line per region it tries, and nothing else."""
    from foundry_local_sdk.logging_helper import LogLevel

    assert _foundry_configuration(APP_NAME).log_level == LogLevel.ERROR
    assert _foundry_configuration(APP_NAME, cache_only=True).log_level == LogLevel.WARNING
