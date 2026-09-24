using Agent.Observations;
using Agent.WorkCells;

namespace Agent.Triggers;

/// <summary>What a Trigger instance's streak did on one `objects` Cadence (issue #63).</summary>
public enum TriggerEventKind
{
    /// <summary>The condition holds, but not yet on N consecutive Observations.</summary>
    StreakBuilding,

    /// <summary>The condition has now held on N consecutive Observations: a new Incident.</summary>
    Fired,

    /// <summary>The condition has failed on N consecutive Observations: the Incident closes.</summary>
    Cleared,
}

/// <summary>
/// One Trigger instance crossing a streak boundary. <see cref="InstanceKey"/> names which
/// instance of the Trigger this is — for the missing-part Trigger, the expected part's
/// canonical name (spec #59: "each expected part is its own Incident").
/// </summary>
public sealed record TriggerEvent(
    TriggerEventKind Kind,
    TriggerKind TriggerKind,
    string InstanceKey,
    int Count,
    int N,
    string? IncidentId = null,
    string? RawObservation = null);

/// <summary>
/// Evaluates the Work Cell's Triggers against each `objects` Cadence and tracks every
/// Trigger instance's streak (spec #59, issue #63). Only the missing-part Trigger is
/// evaluated so far — the no-gloves and Foreign Object Triggers follow the talk, per the
/// spec's order of work.
/// </summary>
/// <remarks>
/// The caller only calls <see cref="Evaluate"/> for a Cadence whose outcome is `objects`; a
/// `no_shape` or `failed` Cadence is never passed in, which is what leaves every streak
/// exactly where it was (AC: "no_shape and failed Observations leave the streak exactly
/// where it was").
/// </remarks>
public sealed class TriggerEngine
{
    private sealed class InstanceState
    {
        public bool Fired;
        public int HoldStreak;
        public int FailStreak;
        public string? IncidentId;
    }

    private readonly TriggerConfig? _missingPart;
    private readonly IReadOnlyList<NamedObject> _expectedParts;
    private readonly Dictionary<string, InstanceState> _states = new(StringComparer.OrdinalIgnoreCase);

    public TriggerEngine(WorkCell workCell)
    {
        _missingPart = workCell.Triggers.FirstOrDefault(t => t.Kind == TriggerKind.MissingPart);
        _expectedParts = workCell.ExpectedParts;
        ReArmAll();
    }

    /// <summary>Re-arms every Trigger instance: a new Watch never carries a streak into the next (spec #59).</summary>
    public void ReArmAll()
    {
        _states.Clear();
        if (_missingPart is null)
        {
            return;
        }

        foreach (var part in _expectedParts)
        {
            _states[part.Name] = new InstanceState();
        }
    }

    public IReadOnlyList<TriggerEvent> Evaluate(IReadOnlyList<ObservedObject> objects, string rawObservation)
    {
        var events = new List<TriggerEvent>();
        if (_missingPart is null)
        {
            return events;
        }

        var present = PresentParts(objects);
        var n = _missingPart.N;

        foreach (var part in _expectedParts)
        {
            var state = _states[part.Name];
            var missing = !present.Contains(part.Name);

            if (!state.Fired)
            {
                EvaluateArmed(part.Name, state, missing, n, rawObservation, events);
            }
            else
            {
                EvaluateFired(part.Name, state, missing, n, events);
            }
        }

        return events;
    }

    private static void EvaluateArmed(
        string partName, InstanceState state, bool missing, int n, string rawObservation, List<TriggerEvent> events)
    {
        if (!missing)
        {
            state.HoldStreak = 0;
            return;
        }

        state.HoldStreak++;
        if (state.HoldStreak < n)
        {
            events.Add(new TriggerEvent(TriggerEventKind.StreakBuilding, TriggerKind.MissingPart, partName, state.HoldStreak, n));
            return;
        }

        state.Fired = true;
        state.HoldStreak = 0;
        state.FailStreak = 0;
        state.IncidentId = Guid.NewGuid().ToString("N");
        events.Add(new TriggerEvent(TriggerEventKind.Fired, TriggerKind.MissingPart, partName, n, n, state.IncidentId, rawObservation));
    }

    private static void EvaluateFired(string partName, InstanceState state, bool missing, int n, List<TriggerEvent> events)
    {
        if (missing)
        {
            state.FailStreak = 0;
            return;
        }

        state.FailStreak++;
        if (state.FailStreak < n)
        {
            return;
        }

        var incidentId = state.IncidentId!;
        state.Fired = false;
        state.FailStreak = 0;
        state.IncidentId = null;
        events.Add(new TriggerEvent(TriggerEventKind.Cleared, TriggerKind.MissingPart, partName, n, n, incidentId));
    }

    private HashSet<string> PresentParts(IReadOnlyList<ObservedObject> objects)
    {
        var present = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var obj in objects)
        {
            if (obj.Where is not ("tray" or "zone" or "hand"))
            {
                continue;
            }

            foreach (var part in _expectedParts)
            {
                if (Matches(part, obj.Name))
                {
                    present.Add(part.Name);
                }
            }
        }

        return present;
    }

    private static bool Matches(NamedObject named, string observedName) =>
        string.Equals(named.Name, observedName, StringComparison.OrdinalIgnoreCase) ||
        named.Synonyms.Any(s => string.Equals(s, observedName, StringComparison.OrdinalIgnoreCase));
}
