namespace Agent.Measurement;

/// <summary>
/// About 10 synthetic Incidents (issue #62's acceptance criterion), cycling the three Triggers
/// item 59 specifies — a part missing from the Tray, working without gloves, a Foreign Object in
/// the Zone — with Observation lines shaped exactly as <c>docs/fixtures/watch-emit-contract.jsonl</c>
/// records them.
/// </summary>
public static class IncidentScenarios
{
    public static readonly IReadOnlyList<IncidentScenario> All =
    [
        new("missing-gasket", "Part missing from the Tray",
            "A required part is absent from the Tray for 2 consecutive Observations.",
            """{"type": "cadence", "cadence": 12, "time": "2026-09-24T10:31:04+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "bracket", "count": 1, "where": "tray"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T10:31:04+02:00"),

        new("missing-screwdriver", "Part missing from the Tray",
            "A required part is absent from the Tray for 2 consecutive Observations.",
            """{"type": "cadence", "cadence": 5, "time": "2026-09-24T11:02:19+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "soldering iron", "count": 1, "where": "tray"}, {"name": "bare hand", "count": 1, "where": "hand"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T11:02:19+02:00"),

        new("no-gloves-first", "Working without gloves",
            "Any object matching the bare-hand set is reported, wherever it is.",
            """{"type": "cadence", "cadence": 8, "time": "2026-09-24T11:15:47+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "bare hand", "count": 1, "where": "zone"}, {"name": "gasket", "count": 1, "where": "zone"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T11:15:47+02:00"),

        new("no-gloves-second", "Working without gloves",
            "Any object matching the bare-hand set is reported, wherever it is.",
            """{"type": "cadence", "cadence": 21, "time": "2026-09-24T13:47:02+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "bare hand", "count": 2, "where": "hand"}], "truncated": false, "shortfall": {"skipped_cadences": 1, "stale_frames": 2}}""",
            "2026-09-24T13:47:02+02:00"),

        new("foreign-phone", "Foreign Object in the Zone",
            "An object on the Zone is not in the Zone's allowed list, not in the Tray's expected parts, and is not a hand.",
            """{"type": "cadence", "cadence": 2, "time": "2026-09-24T10:30:09+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "phone", "count": 1, "where": "zone"}], "truncated": false, "shortfall": {"skipped_cadences": 2, "stale_frames": 5}}""",
            "2026-09-24T10:30:09+02:00"),

        new("foreign-cup", "Foreign Object in the Zone",
            "An object on the Zone is not in the Zone's allowed list, not in the Tray's expected parts, and is not a hand.",
            """{"type": "cadence", "cadence": 33, "time": "2026-09-24T15:04:55+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "cup", "count": 1, "where": "zone"}, {"name": "bracket", "count": 1, "where": "tray"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T15:04:55+02:00"),

        new("missing-bracket-truncated", "Part missing from the Tray",
            "A required part is absent from the Tray for 2 consecutive Observations.",
            """{"type": "cadence", "cadence": 5, "time": "2026-09-24T10:30:15+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "soldering iron", "count": 1, "where": "tray"}], "truncated": true, "shortfall": null}""",
            "2026-09-24T10:30:15+02:00"),

        new("no-gloves-elsewhere", "Working without gloves",
            "Any object matching the bare-hand set is reported, wherever it is.",
            """{"type": "cadence", "cadence": 44, "time": "2026-09-24T16:22:31+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "bare hand", "count": 1, "where": "elsewhere"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T16:22:31+02:00"),

        new("foreign-scissors", "Foreign Object in the Zone",
            "An object on the Zone is not in the Zone's allowed list, not in the Tray's expected parts, and is not a hand.",
            """{"type": "cadence", "cadence": 17, "time": "2026-09-24T12:38:03+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "scissors", "count": 1, "where": "zone"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T12:38:03+02:00"),

        new("missing-gasket-second", "Part missing from the Tray",
            "A required part is absent from the Tray for 2 consecutive Observations.",
            """{"type": "cadence", "cadence": 61, "time": "2026-09-24T17:51:40+02:00", "variant": "qwen3-vl-2b-instruct-cuda-gpu:2", "outcome": "objects", "objects": [{"name": "bracket", "count": 2, "where": "tray"}, {"name": "gloved hand", "count": 1, "where": "hand"}], "truncated": false, "shortfall": null}""",
            "2026-09-24T17:51:40+02:00"),
    ];
}
