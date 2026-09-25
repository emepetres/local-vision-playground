using Agent.Incidents;
using Agent.Observations;
using Agent.Triggers;
using Agent.WorkCells;

namespace Agent;

/// <summary>The Agent's own identity, printed on startup so a run can be told apart from a script.</summary>
public static class AgentProcess
{
    public const string Name = "Agent";

    /// <summary>The reason recorded on every fired Incident's log entry, until a model sits in front of the Trigger engine (issue #63).</summary>
    private const string NoModelReason = "no model turn: the sentence and the Actions came from the template path";

    /// <summary>
    /// Runs the Agent: loads and validates the Work Cell, prints the header, then follows the
    /// Observations file from the present onward until <paramref name="cancellationToken"/> is
    /// cancelled (issue #61), evaluating its Triggers, raising Incidents and logging them
    /// (issue #63). This is the one seam the whole Agent is tested through.
    /// </summary>
    /// <returns>0 on a clean shutdown, 1 when the Work Cell file is refused.</returns>
    public static async Task<int> RunAsync(
        AgentOptions options,
        TextWriter output,
        CancellationToken cancellationToken,
        IIncidentNotifier? notifier = null,
        IClock? clock = null)
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

        var triggerEngine = new TriggerEngine(workCell);
        var incidentLog = new IncidentLog(options.IncidentsDirectory, clock ?? new SystemClock());
        notifier ??= new WindowsToastNotifier();

        output.WriteLine($"Watching {options.ObservationsPath} for the present onward...");

        var follower = new ObservationsFollower(options.ObservationsPath);
        await foreach (var evt in follower.FollowAsync(cancellationToken).WithCancellation(cancellationToken))
        {
            if (evt.Kind == FollowedEventKind.Recreated)
            {
                // The new Watch's own watch_start line, parsed just below, is what re-arms
                // and reports — recreation on its own carries nothing worth printing twice.
                continue;
            }

            HandleLine(output, evt.Text!, triggerEngine, incidentLog, notifier);
        }

        return 0;
    }

    private static void HandleLine(
        TextWriter output, string line, TriggerEngine triggerEngine, IncidentLog incidentLog, IIncidentNotifier notifier)
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
            triggerEngine.ReArmAll();
            output.WriteLine(
                $"New Watch — variant {started.Variant}, every {started.Cadence}s. Every Trigger re-armed.");
            return;
        }

        if (parsed is ObservationLine.CadenceReached { Outcome: Outcome.Objects } cadence)
        {
            foreach (var trigger in triggerEngine.Evaluate(cadence.Objects, line))
            {
                HandleTriggerEvent(output, incidentLog, notifier, trigger);
            }
        }

        // A `no_shape` or `failed` Cadence is neither evaluated nor logged: it is no evidence
        // either way (spec #59).
    }

    private static void HandleTriggerEvent(TextWriter output, IncidentLog incidentLog, IIncidentNotifier notifier, TriggerEvent trigger)
    {
        var descriptor = TriggerCatalog.Of(trigger.TriggerKind);
        switch (trigger.Kind)
        {
            case TriggerEventKind.StreakBuilding:
                output.WriteLine(descriptor.StreakBuildingMessage(trigger.InstanceKey, trigger.Count, trigger.N));
                break;

            case TriggerEventKind.Fired:
            {
                var sentence = descriptor.Sentence(trigger.InstanceKey);
                incidentLog.RecordFired(
                    trigger.IncidentId!, descriptor, trigger.InstanceKey, trigger.RawObservation!, sentence,
                    agentActed: false, agentActedReason: NoModelReason);

                // The Incident is already on record above; a toast the OS refuses to raise
                // (an unpackaged app not registered for notifications, most likely) must not
                // take the whole Watch down with it (AC: "keep running when one Agent turn
                // fails" — the same stance extended to the notifier).
                try
                {
                    notifier.Notify(descriptor.Label, sentence);
                    output.WriteLine($"Incident fired — {sentence} Actions: notified supervisor, logged incident.");
                }
                catch (Exception ex)
                {
                    output.WriteLine($"Incident fired — {sentence} Actions: logged incident. Notification failed: {ex.Message}");
                }
                break;
            }

            case TriggerEventKind.Cleared:
                incidentLog.RecordCleared(trigger.IncidentId!, descriptor);
                output.WriteLine(descriptor.ClearedMessage(trigger.InstanceKey));
                break;
        }
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
