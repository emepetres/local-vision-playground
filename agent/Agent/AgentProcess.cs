using Agent.FoundryLocal;
using Agent.Incidents;
using Agent.Observations;
using Agent.Triggers;
using Agent.WorkCells;
using Microsoft.Extensions.AI;

namespace Agent;

/// <summary>The Agent's own identity, printed on startup so a run can be told apart from a script.</summary>
public static class AgentProcess
{
    public const string Name = "Agent";

    /// <summary>
    /// Runs the Agent: loads and validates the Work Cell, prints the header, then follows the
    /// Observations file from the present onward until <paramref name="cancellationToken"/> is
    /// cancelled (issue #61), evaluating its Triggers, raising Incidents, handing each firing
    /// to the model and logging it (issues #63 and #65). This is the one seam the whole Agent
    /// is tested through.
    /// </summary>
    /// <returns>0 on a clean shutdown, 1 when the Work Cell file is refused.</returns>
    public static async Task<int> RunAsync(
        AgentOptions options,
        TextWriter output,
        CancellationToken cancellationToken,
        IIncidentNotifier? notifier = null,
        IClock? clock = null,
        IChatClient? chatClient = null,
        TimeSpan? incidentAgentTimeout = null)
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

        // Only a chat client we created ourselves is ours to dispose — one a caller (a test)
        // handed in is theirs, and may outlive this run.
        FoundryLocalChatClient? ownedChatClient = null;
        if (chatClient is null)
        {
            ownedChatClient = new FoundryLocalChatClient(options.VariantId);
            chatClient = ownedChatClient;
        }

        try
        {
            string modelDescription;
            try
            {
                modelDescription = chatClient is IModelDescriptor descriptor
                    ? await descriptor.DescribeAsync(cancellationToken).ConfigureAwait(false)
                    : "unknown";
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                // Resolving the model is the one thing before the loop starts that talks to
                // the outside world (Foundry Local's catalogue, a download) — a failure here
                // is refused the same way a bad Work Cell file is, rather than crashing with a
                // raw stack trace before "Watching" is ever printed.
                output.WriteLine($"Refused: the model could not be resolved — {ex.Message}");
                return 1;
            }

            PrintHeader(output, workCell, options, modelDescription);

            Directory.CreateDirectory(options.IncidentsDirectory);

            var effectiveClock = clock ?? new SystemClock();
            var triggerEngine = new TriggerEngine(workCell);
            var incidentLog = new IncidentLog(options.IncidentsDirectory, effectiveClock);
            var incidentAgent = new IncidentAgent(chatClient, incidentAgentTimeout);
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

                await HandleLineAsync(
                    output, evt.Text!, triggerEngine, incidentLog, notifier, incidentAgent, effectiveClock, cancellationToken)
                    .ConfigureAwait(false);
            }

            return 0;
        }
        finally
        {
            if (ownedChatClient is not null)
            {
                await ownedChatClient.DisposeAsync().ConfigureAwait(false);
            }
        }
    }

    private static async Task HandleLineAsync(
        TextWriter output,
        string line,
        TriggerEngine triggerEngine,
        IncidentLog incidentLog,
        IIncidentNotifier notifier,
        IncidentAgent incidentAgent,
        IClock clock,
        CancellationToken cancellationToken)
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
                await HandleTriggerEventAsync(output, incidentLog, notifier, incidentAgent, clock, trigger, cancellationToken)
                    .ConfigureAwait(false);
            }
        }

        // A `no_shape` or `failed` Cadence is neither evaluated nor logged: it is no evidence
        // either way (spec #59).
    }

    private static async Task HandleTriggerEventAsync(
        TextWriter output,
        IncidentLog incidentLog,
        IIncidentNotifier notifier,
        IncidentAgent incidentAgent,
        IClock clock,
        TriggerEvent trigger,
        CancellationToken cancellationToken)
    {
        var descriptor = TriggerCatalog.Of(trigger.TriggerKind);
        switch (trigger.Kind)
        {
            case TriggerEventKind.StreakBuilding:
                output.WriteLine(descriptor.StreakBuildingMessage(trigger.InstanceKey, trigger.Count, trigger.N));
                break;

            case TriggerEventKind.Fired:
            {
                var templateSentence = descriptor.Sentence(trigger.InstanceKey);
                var incidentText = BuildIncidentText(descriptor, trigger.RawObservation!, clock.Now);
                var outcome = await incidentAgent.ActAsync(incidentText, templateSentence, cancellationToken).ConfigureAwait(false);

                incidentLog.RecordFired(
                    trigger.IncidentId!, descriptor, trigger.InstanceKey, trigger.RawObservation!, outcome.Sentence,
                    agentActed: outcome.AgentActed, agentActedReason: outcome.AgentActedReason);

                // The Incident is already on record above; a toast the OS refuses to raise
                // (an unpackaged app not registered for notifications, most likely) must not
                // take the whole Watch down with it (AC: "keep running when one Agent turn
                // fails" — the same stance extended to the notifier).
                try
                {
                    notifier.Notify(descriptor.Label, outcome.Sentence);
                    output.WriteLine($"Incident fired — {outcome.Sentence} Actions: notified supervisor, logged incident.");
                }
                catch (Exception ex)
                {
                    output.WriteLine($"Incident fired — {outcome.Sentence} Actions: logged incident. Notification failed: {ex.Message}");
                }
                break;
            }

            case TriggerEventKind.Cleared:
                incidentLog.RecordCleared(trigger.IncidentId!, descriptor);
                output.WriteLine(descriptor.ClearedMessage(trigger.InstanceKey));
                break;
        }
    }

    /// <summary>
    /// The Incident as the model turn receives it (spec #59): the Trigger, its condition in
    /// words, the Observation line exactly as it crossed, and the time. Never an image.
    /// </summary>
    private static string BuildIncidentText(TriggerDescriptor descriptor, string rawObservation, DateTimeOffset time) =>
        $"Trigger: {descriptor.Label}\nCondition: {descriptor.Condition}\nObservation: {rawObservation}\nTime: {time:O}";

    private static void PrintHeader(TextWriter output, WorkCell workCell, AgentOptions options, string modelDescription)
    {
        output.WriteLine($"Agent watching Work Cell '{workCell.Name}' ({options.WorkCellPath})");
        output.WriteLine($"  Model: {modelDescription}");
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
