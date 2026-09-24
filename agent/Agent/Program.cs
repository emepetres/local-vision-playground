using Agent;
using Agent.Measurement;

if (args is ["measure", .. var measureArgs])
{
    var smoke = measureArgs.Contains("--smoke");
    var full = measureArgs.Contains("--full");
    var only = measureArgs
        .SkipWhile(a => a != "--only")
        .Skip(1)
        .TakeWhile(a => !a.StartsWith("--"))
        .ToList();
    var incidents = smoke
        ? IncidentScenarios.All.Take(2).ToList()
        : full
            ? null
            : IncidentScenarios.All.Take(5).ToList();
    var combinations = smoke
        ? new List<(string, string, string)> { ("qwen2.5-1.5b-instruct", "CPU", "qwen2.5-1.5b-instruct-generic-cpu:4") }
        : only.Count > 0
            ? ToolCallReliabilityMeasurement.Combinations
                .Where(c => only.Any(o => c.VariantId.Contains(o, StringComparison.OrdinalIgnoreCase)))
                .ToList()
            : null;
    var results = await ToolCallReliabilityMeasurement.RunAsync(incidents: incidents, combinations: combinations);
    var benchmarksDir = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..", "docs", "benchmarks");
    Directory.CreateDirectory(benchmarksDir);
    var stamp = DateTimeOffset.Now.ToString("yyyyMMdd-HHmmss");
    ToolCallReliabilityReport.Write(
        results,
        Path.Combine(benchmarksDir, $"tool-call-reliability-zenbook-{stamp}.json"),
        Path.Combine(benchmarksDir, $"tool-call-reliability-zenbook-{stamp}.md"));
    return;
}

Console.WriteLine(AgentProcess.Name);



