using Agent.Incidents;

namespace Agent.Tests;

/// <summary>Records every notification requested, so a test can assert on toasts without a real one (issue #63).</summary>
public sealed class FakeNotifier : IIncidentNotifier
{
    private readonly List<(string TriggerLabel, string Sentence)> _calls = [];
    private readonly object _lock = new();

    /// <summary>Set to make every call throw, as a real toast can when the app is not registered for notifications.</summary>
    public bool ThrowOnNotify { get; set; }

    public void Notify(string triggerLabel, string sentence)
    {
        lock (_lock)
        {
            _calls.Add((triggerLabel, sentence));
        }

        if (ThrowOnNotify)
        {
            throw new InvalidOperationException("the fake notifier was told to fail");
        }
    }

    public IReadOnlyList<(string TriggerLabel, string Sentence)> Calls
    {
        get
        {
            lock (_lock)
            {
                return _calls.ToList();
            }
        }
    }
}
