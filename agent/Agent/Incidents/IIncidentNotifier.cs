namespace Agent.Incidents;

/// <summary>
/// Raises the desktop notification a Supervisor sees when an Incident fires (issue #63). A
/// port behind the concrete Windows toast so tests can observe it without a real one.
/// </summary>
public interface IIncidentNotifier
{
    void Notify(string triggerLabel, string sentence);
}
