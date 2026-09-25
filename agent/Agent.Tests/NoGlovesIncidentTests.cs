using System.Text.Json;

namespace Agent.Tests;

/// <summary>
/// Whole-Agent tests for the no-gloves Trigger and its Incidents (issue #66), driven through
/// <see cref="AgentFixture"/> — the same seam <see cref="MissingPartIncidentTests"/> uses —
/// with a fake notifier and a fake clock.
/// </summary>
public class NoGlovesIncidentTests
{
    private static string CadenceLine(int cadence, string time, string objectsJson = "[]") =>
        $$"""{"type":"cadence","cadence":{{cadence}},"time":"{{time}}","variant":"v1","outcome":"objects","objects":{{objectsJson}}}""";

    private static string Present(string name, string where = "zone") => $$"""[{"name":"{{name}}","count":1,"where":"{{where}}"}]""";

    [Fact]
    public async Task PrintsAStreakBuilding_BeforeReachingN_AndDoesNotFire()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));

        Assert.DoesNotContain("Incident fired", fixture.Output);
        Assert.Empty(fixture.Notifier.Calls);
        Assert.Empty(fixture.ReadIncidentLogLines());
    }

    [Fact]
    public async Task Fires_AfterNConsecutiveBareHandObservations_LogsAndNotifiesOnce()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);
        fixture.Clock.Now = new DateTimeOffset(2026, 9, 24, 10, 30, 5, TimeSpan.FromHours(2));

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));

        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        Assert.Contains("A bare hand is visible without gloves.", fixture.Output);

        var call = Assert.Single(fixture.Notifier.Calls);
        Assert.Equal("working without gloves", call.TriggerLabel);
        Assert.Equal("A bare hand is visible without gloves.", call.Sentence);

        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        using var doc = JsonDocument.Parse(entry);
        var root = doc.RootElement;
        Assert.Equal("fired", root.GetProperty("type").GetString());
        Assert.Equal("no_gloves", root.GetProperty("trigger").GetString());
        Assert.Equal("A bare hand is visible without gloves.", root.GetProperty("sentence").GetString());
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(root.GetProperty("incident_id").GetString()));
        Assert.Equal(2, root.GetProperty("observation").GetProperty("cadence").GetInt32());

        // There is one no-gloves Incident at a time, not one per part: the entry names no part.
        Assert.False(root.TryGetProperty("part", out _));
    }

    [Fact]
    public async Task OneBareHandIsEnough_RegardlessOfWhere()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 1);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand", where: "elsewhere")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));
    }

    [Fact]
    public async Task APlainHand_NeitherAdvancesNorBreaksTheStreak()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));

        // A plain "hand" (matching neither hand-name set) is neutral: no new streak line, and
        // the streak built so far is not lost.
        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", Present("hand")));
        await Task.Delay(300);
        Assert.DoesNotContain("Incident fired", fixture.Output);

        // No new streak line for the neutral "hand" Cadence: still exactly the one from before.
        var occurrences = fixture.Output.Split("no gloves:").Length - 1;
        Assert.Equal(1, occurrences);

        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));
    }

    [Fact]
    public async Task AGlovedHand_BreaksTheStreakTowardFiring()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));

        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", Present("gloved hand")));
        await Task.Delay(300);

        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));
        Assert.DoesNotContain("Incident fired", fixture.Output);
    }

    [Fact]
    public async Task PuttingGlovesOn_ClearsTheIncident_AfterNConsecutiveObservationsWithNoBareHand()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", Present("gloved hand")));
        fixture.AppendObservations(CadenceLine(4, "2026-09-24T10:30:07+02:00", Present("gloved hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident cleared"));

        Assert.Contains("Incident cleared — gloves on.", fixture.Output);

        // Exactly one notification for the whole episode: none on clearing.
        Assert.Single(fixture.Notifier.Calls);

        var lines = fixture.ReadIncidentLogLines();
        Assert.Equal(2, lines.Count);
        using var fired = JsonDocument.Parse(lines[0]);
        using var cleared = JsonDocument.Parse(lines[1]);
        Assert.Equal(
            fired.RootElement.GetProperty("incident_id").GetString(),
            cleared.RootElement.GetProperty("incident_id").GetString());
    }

    [Fact]
    public async Task OneBareHandRestarts_TheClearingStreak()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        fixture.AppendObservations(CadenceLine(3, "2026-09-24T10:30:05+02:00", Present("gloved hand")));
        fixture.AppendObservations(CadenceLine(4, "2026-09-24T10:30:07+02:00", Present("bare hand")));
        fixture.AppendObservations(CadenceLine(5, "2026-09-24T10:30:09+02:00", Present("gloved hand")));
        await Task.Delay(300);
        Assert.DoesNotContain("Incident cleared", fixture.Output);

        fixture.AppendObservations(CadenceLine(6, "2026-09-24T10:30:11+02:00", Present("gloved hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident cleared"));
    }

    [Fact]
    public async Task NoShapeAndFailedObservations_AreNeutral()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));

        fixture.AppendObservations("""{"type":"cadence","cadence":2,"time":"2026-09-24T10:30:03+02:00","variant":"v1","outcome":"no_shape","reason":"truncated"}""");
        fixture.AppendObservations("""{"type":"cadence","cadence":3,"time":"2026-09-24T10:30:05+02:00","variant":"v1","outcome":"failed","error":"timeout"}""");
        await Task.Delay(300);
        Assert.DoesNotContain("Incident fired", fixture.Output);

        fixture.AppendObservations(CadenceLine(4, "2026-09-24T10:30:07+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));
    }

    [Fact]
    public async Task ANewWatchReArmsTheNoGlovesTrigger()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithNoGlovesTrigger(n: 2);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Contains("no gloves: 1/2"));

        fixture.RecreateObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:35:00+02:00", "variant": "second-watch", "cadence": 2.0}
            """);
        await fixture.WaitForOutputAsync(o => o.Contains("second-watch"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:35:03+02:00", Present("bare hand")));
        await fixture.WaitForOutputAsync(o => o.Split("no gloves: 1/2").Length - 1 == 2);

        // Had the streak carried over, this second bare-hand Observation would have fired.
        Assert.DoesNotContain("Incident fired", fixture.Output);
    }
}
