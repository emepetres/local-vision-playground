using Agent.Incidents;

namespace Agent.Tests;

/// <summary>A clock the test controls, so an Incident log entry's time is not a race with the wall (issue #63).</summary>
public sealed class FakeClock : IClock
{
    public DateTimeOffset Now { get; set; } = new(2026, 9, 24, 10, 0, 0, TimeSpan.FromHours(2));
}
