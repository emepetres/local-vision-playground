namespace Agent.Incidents;

/// <summary>
/// The current local time, as an Incident log entry records it (spec #59: "local time with
/// its offset"). A port so tests can fix the clock rather than race the wall (issue #63).
/// </summary>
public interface IClock
{
    DateTimeOffset Now { get; }
}

public sealed class SystemClock : IClock
{
    public DateTimeOffset Now => DateTimeOffset.Now;
}
