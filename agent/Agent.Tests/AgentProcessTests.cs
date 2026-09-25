namespace Agent.Tests;

public class AgentProcessTests
{
    [Fact]
    public void Name_IsAgent()
    {
        Assert.Equal("Agent", AgentProcess.Name);
    }

    [Fact]
    public async Task Header_StatesTheWorkCellAndItsTriggers()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCell("""
            {
              "name": "soldering station",
              "tray": { "expected_parts": [{ "name": "soldering iron", "synonyms": [] }] },
              "zone": { "allowed_objects": [{ "name": "soldering iron", "synonyms": [] }] },
              "hands": { "bare": ["bare hand"], "gloved": ["gloved hand"] },
              "triggers": { "missing_part": { "n": 3 }, "no_gloves": { "n": 2 } }
            }
            """);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("soldering station"));

        var output = fixture.Output;
        Assert.Contains("soldering station", output);
        Assert.Contains("soldering iron", output);
        Assert.Contains("part missing from the tray", output);
        Assert.Contains("N=3", output);
        Assert.Contains("working without gloves", output);
        Assert.Contains("N=2", output);
        Assert.Contains("a bare hand is visible", output);
    }

    [Fact]
    public async Task Cancelling_IsACleanShutdown_WithExitCodeZero()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteDefaultWorkCell();

        fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        Assert.Equal(0, await fixture.StopAsync());
    }

    [Fact]
    public async Task Refuses_UnknownTrigger()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCell("""
            {
              "tray": { "expected_parts": [{ "name": "pliers", "synonyms": [] }] },
              "zone": { "allowed_objects": [] },
              "hands": { "bare": [], "gloved": [] },
              "triggers": { "unknown_thing": { "n": 2 } }
            }
            """);

        var exitCode = await AgentProcess.RunAsync(fixture.Options, fixture.Writer, CancellationToken.None);

        Assert.Equal(1, exitCode);
        Assert.Contains("unknown Trigger", fixture.Output);
        Assert.Contains("unknown_thing", fixture.Output);
    }

    [Fact]
    public async Task Refuses_NBelowOne()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCell("""
            {
              "tray": { "expected_parts": [{ "name": "pliers", "synonyms": [] }] },
              "zone": { "allowed_objects": [] },
              "hands": { "bare": [], "gloved": [] },
              "triggers": { "missing_part": { "n": 0 } }
            }
            """);

        var exitCode = await AgentProcess.RunAsync(fixture.Options, fixture.Writer, CancellationToken.None);

        Assert.Equal(1, exitCode);
        Assert.Contains("missing_part", fixture.Output);
        Assert.Contains("at least 1", fixture.Output);
    }

    [Fact]
    public async Task Refuses_NullTriggerConfiguration()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCell("""
            {
              "tray": { "expected_parts": [{ "name": "pliers", "synonyms": [] }] },
              "zone": { "allowed_objects": [] },
              "hands": { "bare": [], "gloved": [] },
              "triggers": { "missing_part": null }
            }
            """);

        var exitCode = await AgentProcess.RunAsync(fixture.Options, fixture.Writer, CancellationToken.None);

        Assert.Equal(1, exitCode);
        Assert.Contains("missing_part", fixture.Output);
    }

    [Fact]
    public async Task Refuses_EmptyTrayWhenMissingPartTriggerIsOn()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCell("""
            {
              "tray": { "expected_parts": [] },
              "zone": { "allowed_objects": [] },
              "hands": { "bare": [], "gloved": [] },
              "triggers": { "missing_part": { "n": 2 } }
            }
            """);

        var exitCode = await AgentProcess.RunAsync(fixture.Options, fixture.Writer, CancellationToken.None);

        Assert.Equal(1, exitCode);
        Assert.Contains("empty", fixture.Output);
    }

    [Fact]
    public async Task WaitsForTheObservationsFileWhenItDoesNotExistYet()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteDefaultWorkCell();
        Assert.False(File.Exists(fixture.Options.ObservationsPath));

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.WriteObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:30:00+02:00", "variant": "v1", "cadence": 2.0}
            """);

        await fixture.WaitForOutputAsync(o => o.Contains("New Watch"));
        Assert.Contains("v1", fixture.Output);
    }

    [Fact]
    public async Task SeeksToTheEndAndNeverReplaysEarlierLines()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteDefaultWorkCell();
        fixture.WriteObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:30:00+02:00", "variant": "already-there", "cadence": 2.0}
            """);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        // Give the follower a beat to have polled at least once, then append a real line.
        await Task.Delay(300);
        fixture.AppendObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:30:05+02:00", "variant": "just-arrived", "cadence": 2.0}
            """);

        await fixture.WaitForOutputAsync(o => o.Contains("just-arrived"));

        Assert.DoesNotContain("already-there", fixture.Output);
    }

    [Fact]
    public async Task NoticesTheFileBeingRecreatedAsANewWatch()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteDefaultWorkCell();
        fixture.WriteObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:30:00+02:00", "variant": "first-watch", "cadence": 2.0}
            """);

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));
        await Task.Delay(300);

        fixture.RecreateObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:35:00+02:00", "variant": "second-watch", "cadence": 2.0}
            """);

        await fixture.WaitForOutputAsync(o => o.Contains("second-watch"));
    }

    [Fact]
    public async Task ReportsAMalformedLineOnceAndSkipsIt()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteDefaultWorkCell();
        fixture.WriteObservations("");

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations("not json at all");
        await fixture.WaitForOutputAsync(o => o.Contains("did not parse"));

        fixture.AppendObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:30:00+02:00", "variant": "after-bad-line", "cadence": 2.0}
            """);
        await fixture.WaitForOutputAsync(o => o.Contains("after-bad-line"));

        var occurrences = fixture.Output.Split("did not parse").Length - 1;
        Assert.Equal(1, occurrences);
    }

    [Fact]
    public async Task ReadsEveryLineOfTheContractFixtureWithoutChoking()
    {
        var fixturePath = Path.Combine(
            AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..", "docs", "fixtures", "watch-emit-contract.jsonl");
        Assert.True(File.Exists(fixturePath), $"contract fixture not found at '{fixturePath}'");

        await using var fixture = new AgentFixture();
        fixture.WriteDefaultWorkCell();
        File.Copy(fixturePath, fixture.Options.ObservationsPath, overwrite: true);

        // Start after the fixture already exists and has content: the Agent must not replay it.
        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:40:00+02:00", "variant": "after-fixture", "cadence": 2.0}
            """);
        await fixture.WaitForOutputAsync(o => o.Contains("after-fixture"));

        Assert.DoesNotContain("did not parse", fixture.Output);
    }
}
