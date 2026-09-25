namespace Agent.Tests;

/// <summary>
/// Drives the whole Agent (<see cref="AgentProcess.RunAsync"/>) over real files in a
/// temporary directory — the one seam issue #61 is tested through.
/// </summary>
public sealed class AgentFixture : IAsyncDisposable
{
    private readonly string _directory;
    private Task<int>? _runTask;
    private CancellationTokenSource? _cts;

    public AgentFixture()
    {
        _directory = Path.Combine(Path.GetTempPath(), "agent-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_directory);
        Writer = new SynchronizedStringWriter();
        Options = new AgentOptions(
            Path.Combine(_directory, "observations.jsonl"),
            Path.Combine(_directory, "work-cell.json"),
            Path.Combine(_directory, "incidents"),
            null);
    }

    public AgentOptions Options { get; }

    public SynchronizedStringWriter Writer { get; }

    public FakeClock Clock { get; } = new();

    public FakeNotifier Notifier { get; } = new();

    public FakeChatClient ChatClient { get; } = new();

    /// <summary>
    /// Short by default so a scripted stall (issue #65's timeout safety-net path) does not
    /// make every other test wait out the real 60 s bound.
    /// </summary>
    public TimeSpan IncidentAgentTimeout { get; set; } = TimeSpan.FromMilliseconds(500);

    public string Output => Writer.ToString();

    public void WriteWorkCell(string json) => File.WriteAllText(Options.WorkCellPath, json.Trim());

    public void WriteDefaultWorkCell() => WriteWorkCell("""
        {
          "tray": { "expected_parts": [{ "name": "widget", "synonyms": [] }] },
          "zone": { "allowed_objects": [{ "name": "widget", "synonyms": [] }] },
          "hands": { "bare": ["bare hand"], "gloved": ["gloved hand"] },
          "triggers": {}
        }
        """);

    /// <summary>A Work Cell with one expected Tray part and the missing-part Trigger on, for issue #63's Incident tests.</summary>
    public void WriteWorkCellWithMissingPartTrigger(int n = 2, string partName = "widget") => WriteWorkCell($$"""
        {
          "tray": { "expected_parts": [{ "name": "{{partName}}", "synonyms": ["{{partName}} synonym"] }] },
          "zone": { "allowed_objects": [{ "name": "{{partName}}", "synonyms": [] }] },
          "hands": { "bare": ["bare hand"], "gloved": ["gloved hand"] },
          "triggers": { "missing_part": { "n": {{n}} } }
        }
        """);

    /// <summary>A Work Cell with the no-gloves Trigger on, for issue #66's Incident tests.</summary>
    public void WriteWorkCellWithNoGlovesTrigger(int n = 2) => WriteWorkCell($$"""
        {
          "tray": { "expected_parts": [] },
          "zone": { "allowed_objects": [] },
          "hands": { "bare": ["bare hand"], "gloved": ["gloved hand"] },
          "triggers": { "no_gloves": { "n": {{n}} } }
        }
        """);

    /// <summary>
    /// Reads the incident log, retrying past a transient sharing violation from the Agent's
    /// own append still in flight on its background task.
    /// </summary>
    public IReadOnlyList<string> ReadIncidentLogLines()
    {
        var path = Path.Combine(Options.IncidentsDirectory, "incidents.jsonl");
        if (!File.Exists(path))
        {
            return [];
        }

        for (var attempt = 0; ; attempt++)
        {
            try
            {
                using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                using var reader = new StreamReader(stream);
                return reader.ReadToEnd()
                    .Split('\n')
                    .Select(l => l.TrimEnd('\r'))
                    .Where(l => l.Length > 0)
                    .ToList();
            }
            catch (IOException) when (attempt < 20)
            {
                Thread.Sleep(10);
            }
        }
    }

    public void WriteObservations(string content) => File.WriteAllText(Options.ObservationsPath, Normalize(content));

    public void AppendObservations(string content) => File.AppendAllText(Options.ObservationsPath, Normalize(content));

    public void RecreateObservations(string content)
    {
        File.Delete(Options.ObservationsPath);
        File.WriteAllText(Options.ObservationsPath, Normalize(content));
    }

    private static string Normalize(string content) => content.Trim() + "\n";

    /// <summary>
    /// Starts the Agent on a background task. Disposing the result stops it. Cancelling is a
    /// clean shutdown, so an exception escaping the run fails the test when the fixture is
    /// disposed.
    /// </summary>
    public IDisposable Start()
    {
        _cts = new CancellationTokenSource();
        var token = _cts.Token;
        _runTask = Task.Run(
            () => AgentProcess.RunAsync(Options, Writer, token, Notifier, Clock, ChatClient, IncidentAgentTimeout),
            CancellationToken.None);

        return new Stoppable(this);
    }

    /// <summary>Stops the Agent the way Ctrl+C does and returns its exit code.</summary>
    public async Task<int> StopAsync()
    {
        await _cts!.CancelAsync();
        return await _runTask!;
    }

    public async Task WaitForOutputAsync(Func<string, bool> predicate, TimeSpan? timeout = null)
    {
        var deadline = DateTime.UtcNow + (timeout ?? TimeSpan.FromSeconds(5));
        while (!predicate(Output))
        {
            if (DateTime.UtcNow > deadline)
            {
                throw new TimeoutException($"condition never held. Output so far:\n{Output}");
            }

            await Task.Delay(20);
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_cts is not null)
        {
            await _cts.CancelAsync();
        }

        if (_runTask is not null)
        {
            await _runTask;
        }

        _cts?.Dispose();

        try
        {
            Directory.Delete(_directory, recursive: true);
        }
        catch (IOException)
        {
            // Best-effort cleanup: a lingering handle on a slow CI disk should not fail the test.
        }
    }

    private sealed class Stoppable(AgentFixture fixture) : IDisposable
    {
        public void Dispose()
        {
            fixture._cts?.Cancel();
        }
    }
}
