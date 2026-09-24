using Agent.Observations;
using Agent.WorkCells;

namespace Agent;

/// <summary>The Agent's own identity, printed on startup so a run can be told apart from a script.</summary>
public static class AgentProcess
{
    public const string Name = "Agent";

    /// <summary>
    /// Runs the Agent: loads and validates the Work Cell, prints the header, then follows the
    /// Observations file from the present onward until <paramref name="cancellationToken"/> is
    /// cancelled (issue #61). This is the one seam the whole Agent is tested through.
    /// </summary>
    /// <returns>0 on a clean shutdown, 1 when the Work Cell file is refused.</returns>
    public static async Task<int> RunAsync(AgentOptions options, TextWriter output, CancellationToken cancellationToken)
    {
        WorkCell workCell;
        try
        {
            workCell = WorkCellFile.Load(options.WorkCellPath);
        }
        catch (WorkCellConfigurationException ex)
        {
            output.WriteLine($"Refused: {ex.Message}");
            return 1;
        }

        PrintHeader(output, workCell, options);

        Directory.CreateDirectory(options.IncidentsDirectory);

        output.WriteLine($"Watching {options.ObservationsPath} for the present onward...");

        var follower = new ObservationsFollower(options.ObservationsPath);
        await foreach (var evt in follower.FollowAsync(cancellationToken).WithCancellation(cancellationToken))
        {
            if (evt.Kind == FollowedEventKind.Recreated)
            {
                // The new Watch's own watch_start line, parsed just below, is what gets
                // reported — recreation on its own carries nothing worth printing twice.
                continue;
            }

            HandleLine(output, evt.Text!);
        }

        return 0;
    }

    private static void HandleLine(TextWriter output, string line)
    {
        ObservationLine parsed;
        try
        {
            parsed = ObservationLineParser.Parse(line);
        }
        catch (FormatException ex)
        {
            output.WriteLine($"Skipped a line that did not parse ({ex.Message}): {line}");
            return;
        }

        if (parsed is ObservationLine.WatchStarted started)
        {
            output.WriteLine(
                $"New Watch — variant {started.Variant}, every {started.Cadence}s. Every Trigger re-armed.");
        }

        // A CadenceReached line is tested against the Triggers from issue #63 onward.
    }

    private static void PrintHeader(TextWriter output, WorkCell workCell, AgentOptions options)
    {
        output.WriteLine($"Agent watching Work Cell '{workCell.Name}' ({options.WorkCellPath})");
        output.WriteLine($"  Tray expects: {Describe(workCell.ExpectedParts)}");
        output.WriteLine($"  Zone allows: {Describe(workCell.AllowedObjects)}");

        if (workCell.Triggers.Count == 0)
        {
            output.WriteLine("Triggers in force: none");
            return;
        }

        output.WriteLine("Triggers in force:");
        foreach (var trigger in workCell.Triggers)
        {
            output.WriteLine($"  - {trigger.Label} (N={trigger.N}): {trigger.Condition}");
        }
    }

    private static string Describe(IReadOnlyList<NamedObject> items) =>
        items.Count == 0 ? "(none)" : string.Join(", ", items.Select(i => i.Name));
}
