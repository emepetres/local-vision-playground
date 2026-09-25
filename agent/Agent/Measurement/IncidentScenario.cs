namespace Agent.Measurement;

/// <summary>
/// One synthetic Incident for the tool-call reliability measurement (issue #62). Shaped exactly
/// as the real Agent will receive one per spec item 51: only text — the Trigger's name, its
/// condition in words, the Observation line exactly as it crossed, and the time.
/// </summary>
public sealed record IncidentScenario(string Id, string TriggerName, string Condition, string ObservationLine, string Time)
{
    public string ToPromptText() =>
        $"Trigger: {TriggerName}\nCondition: {Condition}\nObservation: {ObservationLine}\nTime: {Time}";
}
