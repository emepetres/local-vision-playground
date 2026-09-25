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
/// Trigger instance's streak (spec #59, issues #63 and #66). The Foreign Object Trigger
/// follows the talk, per the spec's order of work.
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

    /// <summary>The single no-gloves Incident's instance key (spec #66: "one Incident at a time").</summary>
    private const string HandsInstanceKey = "hands";

    private readonly TriggerConfig? _missingPart;
    private readonly TriggerConfig? _noGloves;
    private readonly IReadOnlyList<NamedObject> _expectedParts;
    private readonly IReadOnlyList<string> _bareHandNames;
    private readonly IReadOnlyList<string> _glovedHandNames;
    private readonly IReadOnlyList<string> _plainHandNames;
    private readonly Dictionary<string, InstanceState> _states = new(StringComparer.OrdinalIgnoreCase);
    private InstanceState? _handsState;

    public TriggerEngine(WorkCell workCell)
    {
        _missingPart = workCell.Triggers.FirstOrDefault(t => t.Kind == TriggerKind.MissingPart);
        _noGloves = workCell.Triggers.FirstOrDefault(t => t.Kind == TriggerKind.NoGloves);
        _expectedParts = workCell.ExpectedParts;
        _bareHandNames = workCell.BareHandNames;
        _glovedHandNames = workCell.GlovedHandNames;
        _plainHandNames = workCell.PlainHandNames;
        ReArmAll();
    }

    /// <summary>Re-arms every Trigger instance: a new Watch never carries a streak into the next (spec #59).</summary>
    public void ReArmAll()
    {
        _states.Clear();
        _handsState = null;

        if (_missingPart is not null)
        {
            foreach (var part in _expectedParts)
            {
                _states[part.Name] = new InstanceState();
            }
        }

        if (_noGloves is not null)
        {
            _handsState = new InstanceState();
        }
    }

    public IReadOnlyList<TriggerEvent> Evaluate(IReadOnlyList<ObservedObject> objects, string rawObservation)
    {
        var events = new List<TriggerEvent>();

        if (_missingPart is not null)
        {
            EvaluateMissingPart(objects, rawObservation, events);
        }

        if (_noGloves is not null)
        {
            EvaluateNoGloves(objects, rawObservation, events);
        }

        return events;
    }

    private void EvaluateMissingPart(IReadOnlyList<ObservedObject> objects, string rawObservation, List<TriggerEvent> events)
    {
        var present = PresentParts(objects);
        var n = _missingPart!.N;

        foreach (var part in _expectedParts)
        {
            var state = _states[part.Name];
            var missing = !present.Contains(part.Name);

            if (!state.Fired)
            {
                EvaluateArmed(TriggerKind.MissingPart, part.Name, state, missing, n, rawObservation, events);
            }
            else
            {
                EvaluateFired(TriggerKind.MissingPart, part.Name, state, missing, n, events);
            }
        }
    }

    /// <summary>Whether a Cadence's objects name a bare hand, a gloved hand, or neither (spec #66).</summary>
    private enum HandState
    {
        Bare,
        Gloved,
        Neutral,
    }

    /// <summary>
    /// A named bare hand wins; then a gloved one. A plain hand (the <c>plain</c> list, empty
    /// unless the Work Cell file opts in) counts as bare only when no gloved hand shares its
    /// Cadence: the 4B on the live Work Cell says "hand" for a bare hand, but beside a
    /// "gloved hand" the plain one is more likely the same gloved hand named twice.
    /// </summary>
    private HandState DetermineHandState(IReadOnlyList<ObservedObject> objects)
    {
        if (AnyNamed(objects, _bareHandNames))
        {
            return HandState.Bare;
        }

        if (AnyNamed(objects, _glovedHandNames))
        {
            return HandState.Gloved;
        }

        if (AnyNamed(objects, _plainHandNames))
        {
            return HandState.Bare;
        }

        return HandState.Neutral;
    }

    private static bool AnyNamed(IReadOnlyList<ObservedObject> objects, IReadOnlyList<string> names) =>
        objects.Any(o => names.Any(n => string.Equals(n, o.Name, StringComparison.OrdinalIgnoreCase)));

    /// <summary>
    /// The no-gloves Trigger (spec #66): a bare hand anywhere counts, `where` is never read,
    /// and one bare hand is enough — there is one Incident, not one per hand. A plain "hand",
    /// matching no hand-name set, is neutral while armed: it leaves the streak toward
    /// firing exactly where it was (counting it as bare added false Triggers on the 2B, per
    /// the spike). Clearing only needs no bare hand reported, so a plain "hand" (like a
    /// gloved one) still counts toward it — <c>bare</c> is what <see cref="EvaluateArmed"/>
    /// and <see cref="EvaluateFired"/> know as "missing", the condition that is bad news.
    /// </summary>
    private void EvaluateNoGloves(IReadOnlyList<ObservedObject> objects, string rawObservation, List<TriggerEvent> events)
    {
        var n = _noGloves!.N;
        var state = _handsState!;
        var handState = DetermineHandState(objects);
        var bare = handState == HandState.Bare;

        if (!state.Fired)
        {
            if (handState == HandState.Neutral)
            {
                return;
            }

            EvaluateArmed(TriggerKind.NoGloves, HandsInstanceKey, state, bare, n, rawObservation, events);
            return;
        }

        EvaluateFired(TriggerKind.NoGloves, HandsInstanceKey, state, bare, n, events);
    }

    private static void EvaluateArmed(
        TriggerKind kind, string instanceKey, InstanceState state, bool missing, int n, string rawObservation, List<TriggerEvent> events)
    {
        if (!missing)
        {
            state.HoldStreak = 0;
            return;
        }

        state.HoldStreak++;
        if (state.HoldStreak < n)
        {
            events.Add(new TriggerEvent(TriggerEventKind.StreakBuilding, kind, instanceKey, state.HoldStreak, n));
            return;
        }

        state.Fired = true;
        state.HoldStreak = 0;
        state.FailStreak = 0;
        state.IncidentId = Guid.NewGuid().ToString("N");
        events.Add(new TriggerEvent(TriggerEventKind.Fired, kind, instanceKey, n, n, state.IncidentId, rawObservation));
    }

    private static void EvaluateFired(TriggerKind kind, string instanceKey, InstanceState state, bool missing, int n, List<TriggerEvent> events)
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
        events.Add(new TriggerEvent(TriggerEventKind.Cleared, kind, instanceKey, n, n, incidentId));
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
