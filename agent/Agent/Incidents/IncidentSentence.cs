namespace Agent.Incidents;

/// <summary>
/// The template sentence path (issue #63): "this works end to end with no model... this
/// template path is also the one the safety net will use once a model sits in front of it."
/// </summary>
public static class IncidentSentence
{
    public static string ForMissingPart(string partName) => $"The {partName} is missing from the Tray.";
}
