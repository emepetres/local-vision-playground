namespace Agent.Observations;

/// <summary>One outcome a Cadence line can come to (ADR-0014, `watch --emit`'s contract).</summary>
public enum Outcome
{
    Objects,
    NoShape,
    Failed,
}

/// <summary>One object a Cadence reported, and where it was (issue #64's `where`).</summary>
public sealed record ObservedObject(string Name, int Count, string? Where);

/// <summary>Cadences skipped and Stale Frames discarded before a Cadence was reached late.</summary>
public sealed record Shortfall(int SkippedCadences, int StaleFrames);

/// <summary>One line of the Observations file, as `watch --emit` writes it.</summary>
public abstract record ObservationLine
{
    /// <summary>The first line of every Watch: what it was asked for and which Variant answers it.</summary>
    public sealed record WatchStarted(DateTimeOffset Time, string Variant, double Cadence) : ObservationLine;

    /// <summary>One Cadence reached, whichever outcome it came to.</summary>
    public sealed record CadenceReached(
        int Cadence,
        DateTimeOffset Time,
        string Variant,
        Outcome Outcome,
        IReadOnlyList<ObservedObject> Objects,
        string? Reason,
        string? Error,
        bool Truncated,
        Shortfall? Shortfall) : ObservationLine;
}
