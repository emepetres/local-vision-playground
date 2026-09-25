using System.Diagnostics;
using System.Text.Json;
using Agent.FoundryLocal;
using Agent.Incidents;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;

namespace Agent.Measurement;

/// <summary>
/// The tool-call reliability measurement issue #62 asks for: about 10 synthetic Incidents run
/// through an Agent Framework agent with <c>notify_supervisor</c> and <c>log_incident</c>, for
/// each candidate text model on each Execution Provider Foundry Local offers on this machine
/// (the Zenbook). It reports how often both tools were really called — as tool calls, not
/// narrated as text — versus written as text, skipped, or errored.
/// </summary>
public static class ToolCallReliabilityMeasurement
{
    /// <summary>
    /// Candidate x Execution Provider combinations, and the Variant id each resolves to on this
    /// machine's `foundry model list` (see <c>docs/adr/</c> and the recorded results for how this
    /// was checked). Not a uniform grid: only <c>qwen2.5-1.5b-instruct</c> has an NPU build here.
    /// </summary>
    public static readonly (string Candidate, string ExecutionProvider, string VariantId)[] Combinations =
    [
        ("qwen3-1.7b", "CPU", "qwen3-1.7b-generic-cpu:2"),
        ("qwen3-1.7b", "GPU", "qwen3-1.7b-generic-gpu:2"),
        ("qwen2.5-1.5b-instruct", "CPU", "qwen2.5-1.5b-instruct-generic-cpu:4"),
        ("qwen2.5-1.5b-instruct", "GPU", "qwen2.5-1.5b-instruct-openvino-gpu:2"),
        ("qwen2.5-1.5b-instruct", "NPU", "qwen2.5-1.5b-instruct-openvino-npu:5"),
        ("qwen3-4b", "CPU", "qwen3-4b-generic-cpu:3"),
        ("qwen3-4b", "GPU", "qwen3-4b-generic-gpu:2"),
    ];

    public static async Task<IReadOnlyList<CombinationResult>> RunAsync(
        IReadOnlyList<IncidentScenario>? incidents = null,
        IReadOnlyList<(string Candidate, string ExecutionProvider, string VariantId)>? combinations = null,
        CancellationToken cancellationToken = default)
    {
        incidents ??= IncidentScenarios.All;
        combinations ??= Combinations;

        var results = new List<CombinationResult>();
        foreach (var (candidate, executionProvider, variantId) in combinations)
        {
            Console.WriteLine($"=== {candidate} on {executionProvider} ({variantId}) ===");
            var runs = new List<IncidentRunResult>(incidents.Count);

            await using var chatClient = new FoundryLocalChatClient(variantId);
            var tracker = new CallTracker();

            var agent = chatClient.AsAIAgent(new ChatClientAgentOptions
            {
                ChatOptions = new ChatOptions
                {
                    Instructions = IncidentActionTools.Instructions,
                    Tools = IncidentActionTools.Build(
                        _ => tracker.NotifySupervisorCalled = true,
                        _ => tracker.LogIncidentCalled = true),
                    // An Incident's sentence is short; bounding it keeps a CPU-only combo from
                    // wandering into a long generation once it has already answered the turn.
                    MaxOutputTokens = 256,
                },
            });

            foreach (var incident in incidents)
            {
                tracker.Reset();
                var stopwatch = Stopwatch.StartNew();
                string? text = null;
                string? error = null;
                try
                {
                    var session = await agent.CreateSessionAsync(cancellationToken).ConfigureAwait(false);
                    var response = await agent
                        .RunAsync(incident.ToPromptText(), session, cancellationToken: cancellationToken)
                        .ConfigureAwait(false);
                    text = response.Text;
                }
                catch (Exception ex)
                {
                    error = ex.Message;
                }

                stopwatch.Stop();
                var run = new IncidentRunResult(
                    incident.Id,
                    tracker.NotifySupervisorCalled,
                    tracker.LogIncidentCalled,
                    text,
                    stopwatch.Elapsed,
                    error);
                runs.Add(run);

                Console.WriteLine(
                    $"  {incident.Id}: notify={run.NotifySupervisorCalled} log={run.LogIncidentCalled}" +
                    (error is null ? string.Empty : $" ERROR: {error}"));
            }

            results.Add(new CombinationResult(candidate, executionProvider, variantId, runs));
        }

        return results;
    }

    /// <summary>Tracks whether the two tools were really invoked for the incident in progress.</summary>
    private sealed class CallTracker
    {
        public bool NotifySupervisorCalled { get; set; }
        public bool LogIncidentCalled { get; set; }

        public void Reset()
        {
            NotifySupervisorCalled = false;
            LogIncidentCalled = false;
        }
    }
}

/// <summary>The outcome of running one synthetic Incident through one candidate/Execution Provider.</summary>
public sealed record IncidentRunResult(
    string IncidentId,
    bool NotifySupervisorCalled,
    bool LogIncidentCalled,
    string? AssistantText,
    TimeSpan Elapsed,
    string? Error)
{
    /// <summary>Both Actions were really invoked as tool calls, not narrated as text or skipped.</summary>
    public bool BothToolsCalled => NotifySupervisorCalled && LogIncidentCalled;
}

/// <summary>All runs for one candidate on one Execution Provider.</summary>
public sealed record CombinationResult(
    string Candidate,
    string ExecutionProvider,
    string VariantId,
    IReadOnlyList<IncidentRunResult> Runs)
{
    public int ReliableCount => Runs.Count(r => r.BothToolsCalled);

    public int Total => Runs.Count;
}

/// <summary>Writes the measurement to <c>docs/benchmarks/</c> as JSON and as a Markdown summary.</summary>
public static class ToolCallReliabilityReport
{
    public static void Write(IReadOnlyList<CombinationResult> results, string jsonPath, string markdownPath)
    {
        var json = JsonSerializer.Serialize(
            results,
            new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(jsonPath, json);

        var markdown = new System.Text.StringBuilder();
        markdown.AppendLine("# Tool-call reliability measurement — Zenbook");
        markdown.AppendLine();
        markdown.AppendLine(
            "Measures how often `notify_supervisor` and `log_incident` are really called as tool " +
            "calls — not narrated as text or skipped — for each candidate text model on each " +
            "Execution Provider Foundry Local offers on this machine, over " +
            $"{(results.Count > 0 ? results[0].Total : 0)} synthetic Incidents (issue #62).");
        markdown.AppendLine();
        markdown.AppendLine("| Candidate | Execution Provider | Variant | Reliable | Total |");
        markdown.AppendLine("| --- | --- | --- | --- | --- |");
        foreach (var result in results)
        {
            markdown.AppendLine(
                $"| {result.Candidate} | {result.ExecutionProvider} | {result.VariantId} | " +
                $"{result.ReliableCount} | {result.Total} |");
        }

        markdown.AppendLine();
        markdown.AppendLine("## Per-Incident detail");
        markdown.AppendLine();
        foreach (var result in results)
        {
            markdown.AppendLine($"### {result.Candidate} on {result.ExecutionProvider} (`{result.VariantId}`)");
            markdown.AppendLine();
            markdown.AppendLine("| Incident | notify_supervisor | log_incident | Elapsed | Error |");
            markdown.AppendLine("| --- | --- | --- | --- | --- |");
            foreach (var run in result.Runs)
            {
                markdown.AppendLine(
                    $"| {run.IncidentId} | {run.NotifySupervisorCalled} | {run.LogIncidentCalled} | " +
                    $"{run.Elapsed.TotalSeconds:F1}s | {run.Error ?? string.Empty} |");
            }

            markdown.AppendLine();
        }

        File.WriteAllText(markdownPath, markdown.ToString());
    }
}
