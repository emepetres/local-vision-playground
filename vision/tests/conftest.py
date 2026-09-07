"""What every test in the suite is given whether it asks for it or not.

There is one such thing: the directory a Benchmark writes its record into. It is pointed at
a temporary path for the whole suite rather than test by test, because the alternative is a
test that forgets and quietly commits a Benchmark of a fake model into ``docs/benchmarks/``
— where an Operator would find it beside the real ones and have no way to tell.
"""

from __future__ import annotations

from pathlib import Path

import pytest

import vision.record


@pytest.fixture(autouse=True)
def benchmarks(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Where a Benchmark run by this test writes its JSON and its Markdown.

    Patched where the default lives rather than passed in, so that a test which drives
    ``benchmark_main`` with no opinion about persistence still cannot write into the
    repository. A test with an opinion asks for this fixture by name and reads the files.
    """
    directory = tmp_path / "benchmarks"
    monkeypatch.setattr(vision.record, "BENCHMARKS_DIRECTORY", directory)
    return directory
