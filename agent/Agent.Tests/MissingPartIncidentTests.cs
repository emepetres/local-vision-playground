using System.Text.Json;

namespace Agent.Tests;

/// <summary>
/// Whole-Agent tests for the missing-part Trigger and its Incidents (issue #63), driven
/// through <see cref="AgentFixture"/> — the same seam <c>AgentProcessTests</c> uses — with a
/// fake notifier and a fake clock.
/// </summary>
public class MissingPartIncidentTests
{
    private static string CadenceLine(int cadence, string time, string outcome, string objectsJson = "[]", string? reason = null, string? error = null) =>
        outcome switch
        {
            "objects" => $$"""{"type":"cadence","cadence":{{cadence}},"time":"{{time}}","variant":"v1","outcome":"objects","objects":{{objectsJson}}}""",
            "no_shape" => $$"""{"type":"cadence","cadence":{{cadence}},"time":"{{time}}","variant":"v1","outcome":"no_shape","reason":"{{reason}}"}""",
            "failed" => $$"""{"type":"cadence","cadence":{{cadence}},"time":"{{time}}","variant":"v1","outcome":"failed","error":"{{error}}"}""",
            _ => throw new ArgumentOutOfRangeException(nameof(outcome)),
        };

    private static string Present(string name, string where) => $$"""[{"name":"{{name}}","count":1,"where":"{{where}}"}]""";

    [Fact]
    public async Task PrintsAStreakBuilding_BeforeReachingN_AndDoesNotFire()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("missing: widget 1/2"));

        Assert.DoesNotContain("Incident fired", fixture.Output);
        Assert.Empty(fixture.Notifier.Calls);
        Assert.Empty(fixture.ReadIncidentLogLines());
    }

    [Fact]
    public async Task Fires_AfterNConsecutiveMissingObservations_LogsAndNotifiesOnce()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 2);
        fixture.Clock.Now = new DateTimeOffset(2026, 9, 24, 10, 30, 5, TimeSpan.FromHours(2));

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("missing: widget 1/2"));

        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        Assert.Contains("The widget is missing from the Tray.", fixture.Output);

        var call = Assert.Single(fixture.Notifier.Calls);
        Assert.Equal("part missing from the tray", call.TriggerLabel);
        Assert.Equal("The widget is missing from the Tray.", call.Sentence);

        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        using var doc = JsonDocument.Parse(entry);
        var root = doc.RootElement;
        Assert.Equal("fired", root.GetProperty("type").GetString());
        Assert.Equal("missing_part", root.GetProperty("trigger").GetString());
        Assert.Equal("widget", root.GetProperty("part").GetString());
        Assert.Equal("The widget is missing from the Tray.", root.GetProperty("sentence").GetString());
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(root.GetProperty("agent_acted_reason").GetString()));
        Assert.False(string.IsNullOrWhiteSpace(root.GetProperty("incident_id").GetString()));
        Assert.Equal(2, root.GetProperty("observation").GetProperty("cadence").GetInt32());
        Assert.Equal(fixture.Clock.Now, DateTimeOffset.Parse(root.GetProperty("time").GetString()!));
    }

    [Fact]
    public async Task ReArms_AfterNConsecutivePresentObservations_AndClearsWithoutNotifying()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("missing: widget 1/2"));

        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", "objects", Present("widget", "tray")));
        fixture.AppendObservations(CadenceLine(4, "2026-09-24T10:30:07+02:00", "objects", Present("widget", "tray")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident cleared"));

        // Exactly one notification for the whole episode: none on clearing.
        Assert.Single(fixture.Notifier.Calls);

        var lines = fixture.ReadIncidentLogLines();
        Assert.Equal(2, lines.Count);

        using var fired = JsonDocument.Parse(lines[0]);
        using var cleared = JsonDocument.Parse(lines[1]);
        Assert.Equal("cleared", cleared.RootElement.GetProperty("type").GetString());
        Assert.Equal(
            fired.RootElement.GetProperty("incident_id").GetString(),
            cleared.RootElement.GetProperty("incident_id").GetString());
    }

    [Fact]
    public async Task NoShapeAndFailedObservations_AreNeutral()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("missing: widget 1/2"));

        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", "no_shape", reason: "truncated"));
        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", "failed", error: "timeout"));

        // A beat for both neutral lines to be read and (not) acted on.
        await Task.Delay(300);
        Assert.DoesNotContain("Incident fired", fixture.Output);

        // The streak is still 1/2 — the next missing Observation fires without needing a fresh 1/2 line.
        fixture.AppendObservations(CadenceLine(4, "2026-09-24T10:30:07+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));
    }

    [Fact]
    public async Task EachExpectedPart_IsItsOwnIncident()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCell("""
            {
              "tray": {
                "expected_parts": [
                  { "name": "widget", "synonyms": [] },
                  { "name": "gadget", "synonyms": [] }
                ]
              },
              "zone": { "allowed_objects": [] },
              "hands": { "bare": [], "gloved": [] },
              "triggers": { "missing_part": { "n": 1 } }
            }
            """);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        await fixture.WaitForOutputAsync(_ => fixture.ReadIncidentLogLines().Count == 2);

        var lines = fixture.ReadIncidentLogLines();
        var parts = lines
            .Select(l => JsonDocument.Parse(l).RootElement.GetProperty("part").GetString())
            .OrderBy(p => p)
            .ToList();
        Assert.Equal(["gadget", "widget"], parts);

        var incidentIds = lines.Select(l => JsonDocument.Parse(l).RootElement.GetProperty("incident_id").GetString()).ToList();
        Assert.Equal(2, incidentIds.Distinct().Count());
    }

    [Fact]
    public async Task PartHeldInAHand_CountsAsPresent_NotMissing()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 1);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects", Present("widget", "hand")));

        // A beat for the Cadence to be read and evaluated.
        await Task.Delay(300);

        Assert.DoesNotContain("missing:", fixture.Output);
        Assert.DoesNotContain("Incident fired", fixture.Output);
        Assert.Empty(fixture.ReadIncidentLogLines());
    }

    [Fact]
    public async Task ANotificationFailure_StillLogsTheIncidentAndKeepsTheAgentRunning()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 2);
        fixture.Notifier.ThrowOnNotify = true;

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        Assert.Single(fixture.ReadIncidentLogLines());
        Assert.Contains("Notification failed", fixture.Output);

        // The Watch keeps running after a notification failure: a later Observation is still read.
        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", "objects", Present("widget", "tray")));
        fixture.AppendObservations(CadenceLine(4, "2026-09-24T10:30:07+02:00", "objects", Present("widget", "tray")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident cleared"));
    }

    [Fact]
    public async Task ANewWatchReArmsEveryTrigger()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Contains("missing: widget 1/2"));

        fixture.RecreateObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:35:00+02:00", "variant": "second-watch", "cadence": 2.0}
            """);
        await fixture.WaitForOutputAsync(o => o.Contains("second-watch"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:35:03+02:00", "objects"));
        await fixture.WaitForOutputAsync(o => o.Split("missing: widget 1/2").Length - 1 == 2);

        // Had the streak carried over, this second missing Observation would have fired.
        Assert.DoesNotContain("Incident fired", fixture.Output);
    }
}
