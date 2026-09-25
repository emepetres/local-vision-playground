using System.Text.Json;

namespace Agent.Tests;

/// <summary>
/// Whole-Agent tests for the model turn and its safety net (issue #65), driven through
/// <see cref="AgentFixture"/> with a scripted <see cref="FakeChatClient"/> in place of a real
/// Foundry Local model — the same stance ADR-0015 takes toward our own <c>IChatClient</c>: not
/// unit-tested against the real thing, tested here against a fake that encodes a reading of
/// the Agent Framework SDK.
/// </summary>
public class IncidentAgentTests
{
    private static string CadenceLine(int cadence, string time, string objectsJson = "[]") =>
        $$"""{"type":"cadence","cadence":{{cadence}},"time":"{{time}}","variant":"v1","outcome":"objects","objects":{{objectsJson}}}""";

    private static string Present(string name, string where = "tray") => $$"""[{"name":"{{name}}","count":1,"where":"{{where}}"}]""";

    /// <summary>Starts the Agent and fires one Incident, returning the run so the caller keeps it alive.</summary>
    private static async Task<IDisposable> FireOneIncidentAsync(AgentFixture fixture)
    {
        fixture.WriteWorkCellWithMissingPartTrigger(n: 1);

        var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00"));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        return run;
    }

    [Fact]
    public async Task WhenTheModelCallsBothTools_ItsSentenceIsUsed_AndAgentActedIsTrue()
    {
        await using var fixture = new AgentFixture();
        fixture.ChatClient.EnqueueToolCalls(
            ("notify_supervisor", "The widget went missing from the Tray."),
            ("log_incident", "The widget went missing from the Tray."));

        using var run = await FireOneIncidentAsync(fixture);

        Assert.Contains("The widget went missing from the Tray.", fixture.Output);

        var call = Assert.Single(fixture.Notifier.Calls);
        Assert.Equal("The widget went missing from the Tray.", call.Sentence);

        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.True(root.GetProperty("agent_acted").GetBoolean());
        Assert.Equal("The widget went missing from the Tray.", root.GetProperty("sentence").GetString());
    }

    [Fact]
    public async Task WhenTheModelOnlyAnswersInText_TheTemplatePathActs_Once()
    {
        await using var fixture = new AgentFixture();
        fixture.ChatClient.EnqueueText("I have notified the supervisor and logged the incident.");

        using var run = await FireOneIncidentAsync(fixture);

        Assert.Single(fixture.Notifier.Calls);
        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.Equal("The widget is missing from the Tray.", root.GetProperty("sentence").GetString());
        Assert.Contains("notify_supervisor", root.GetProperty("agent_acted_reason").GetString());
        Assert.Contains("log_incident", root.GetProperty("agent_acted_reason").GetString());
    }

    [Fact]
    public async Task WhenTheModelWritesAToolCallAsText_TheTemplatePathActs_Once()
    {
        await using var fixture = new AgentFixture();
        fixture.ChatClient.EnqueueText("""notify_supervisor(sentence="The widget is missing.")""");

        using var run = await FireOneIncidentAsync(fixture);

        Assert.Single(fixture.Notifier.Calls);
        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.Equal("The widget is missing from the Tray.", root.GetProperty("sentence").GetString());
    }

    [Fact]
    public async Task WhenTheModelCallsOnlyOneTool_TheOtherIsStillCoveredOnce_ByTheTemplatePath()
    {
        await using var fixture = new AgentFixture();
        fixture.ChatClient.EnqueueToolCalls(("notify_supervisor", "A part is missing."));

        using var run = await FireOneIncidentAsync(fixture);

        var call = Assert.Single(fixture.Notifier.Calls);
        Assert.Equal("A part is missing.", call.Sentence);

        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.Equal("A part is missing.", root.GetProperty("sentence").GetString());
        Assert.Contains("log_incident", root.GetProperty("agent_acted_reason").GetString());
    }

    [Fact]
    public async Task WhenTheModelTurnThrows_TheTemplatePathActs_Once_AndTheAgentKeepsRunning()
    {
        await using var fixture = new AgentFixture();
        fixture.ChatClient.EnqueueThrow(new InvalidOperationException("the model process crashed"));

        using var run = await FireOneIncidentAsync(fixture);

        Assert.Single(fixture.Notifier.Calls);
        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.Contains("threw", root.GetProperty("agent_acted_reason").GetString());

        // The Watch keeps running after a failed turn: a later Observation is still read.
        fixture.AppendObservations("""
            {"type": "watch_start", "time": "2026-09-24T10:35:00+02:00", "variant": "still-running", "cadence": 2.0}
            """);
        await fixture.WaitForOutputAsync(o => o.Contains("still-running"));
    }

    [Fact]
    public async Task WhenTheModelTurnStalls_TheTemplatePathActs_Once_AfterTheTimeout()
    {
        await using var fixture = new AgentFixture();
        fixture.IncidentAgentTimeout = TimeSpan.FromMilliseconds(200);
        fixture.ChatClient.EnqueueStall(TimeSpan.FromSeconds(30));

        using var run = await FireOneIncidentAsync(fixture);

        Assert.Single(fixture.Notifier.Calls);
        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.Contains("did not finish within", root.GetProperty("agent_acted_reason").GetString());
    }

    [Fact]
    public async Task WhenTheAgentShutsDownMidTurn_TheIncidentIsStillLoggedAndNotified_Once()
    {
        await using var fixture = new AgentFixture();
        fixture.IncidentAgentTimeout = TimeSpan.FromSeconds(30);
        fixture.ChatClient.EnqueueStall(TimeSpan.FromSeconds(30));
        fixture.WriteWorkCellWithMissingPartTrigger(n: 1);

        fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00"));
        await fixture.WaitForOutputAsync(_ => fixture.ChatClient.Calls.Count > 0);

        var exitCode = await fixture.StopAsync();

        Assert.Equal(0, exitCode);
        Assert.Single(fixture.Notifier.Calls);
        var entry = Assert.Single(fixture.ReadIncidentLogLines());
        var root = JsonDocument.Parse(entry).RootElement;
        Assert.False(root.GetProperty("agent_acted").GetBoolean());
        Assert.Equal("The widget is missing from the Tray.", root.GetProperty("sentence").GetString());
        Assert.Contains("shut down", root.GetProperty("agent_acted_reason").GetString());
    }

    [Fact]
    public async Task TheInstructionsReachTheChatClientAsChatOptions_NotAsASystemMessage()
    {
        // The contract FoundryLocalChatClient relies on when it turns ChatOptions.Instructions
        // into the request's system message: if Agent Framework ever started sending them as
        // a system message too, the model would get them twice.
        await using var fixture = new AgentFixture();

        using var run = await FireOneIncidentAsync(fixture);

        var (messages, options) = fixture.ChatClient.Calls[0];
        Assert.Contains("notify_supervisor", options?.Instructions);
        Assert.DoesNotContain(messages, m => m.Role == Microsoft.Extensions.AI.ChatRole.System);
    }

    [Fact]
    public async Task ClearingTakesNoModelTurn()
    {
        await using var fixture = new AgentFixture();
        fixture.WriteWorkCellWithMissingPartTrigger(n: 1);
        fixture.ChatClient.EnqueueThrow(new InvalidOperationException("clearing must never reach the model"));

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        fixture.AppendObservations(CadenceLine(1, "2026-09-24T10:30:01+02:00"));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident fired"));

        fixture.AppendObservations(CadenceLine(2, "2026-09-24T10:30:03+02:00", Present("widget")));
        await fixture.WaitForOutputAsync(o => o.Contains("Incident cleared"));

        Assert.Single(fixture.Notifier.Calls);
    }

    [Fact]
    public async Task TheHeaderStatesTheModelAndItsExecutionProvider()
    {
        await using var fixture = new AgentFixture();
        fixture.ChatClient.Description = "qwen2.5-1.5b-instruct-generic-cpu:4 (CPUExecutionProvider)";
        fixture.WriteDefaultWorkCell();

        using var run = fixture.Start();
        await fixture.WaitForOutputAsync(o => o.Contains("Watching"));

        Assert.Contains("qwen2.5-1.5b-instruct-generic-cpu:4 (CPUExecutionProvider)", fixture.Output);
    }
}
