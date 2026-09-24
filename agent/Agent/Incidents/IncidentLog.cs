using System.Text.Json.Nodes;
using Agent.WorkCells;

namespace Agent.Incidents;

/// <summary>
/// The incident log (spec #59, issue #63): JSON Lines, append-only, in the Incidents
/// directory. Never a Frame, a path to one, or image data — a <c>fired</c> entry carries the
/// Incident id, the Trigger, its condition, the Observation exactly as it crossed, the
/// sentence, whether the Agent's own template acted (and why), and local time with offset. A
/// <c>cleared</c> entry carries the Incident id, the Trigger and the time.
/// </summary>
public sealed class IncidentLog(string directory, IClock clock)
{
    private readonly string _path = Path.Combine(directory, "incidents.jsonl");

    public void RecordFired(
        string incidentId,
        TriggerDescriptor trigger,
        string instanceKey,
        string rawObservation,
        string sentence,
        bool agentActed,
        string agentActedReason)
    {
        var entry = new JsonObject
        {
            ["type"] = "fired",
            ["incident_id"] = incidentId,
            ["trigger"] = trigger.JsonKey,
            ["condition"] = trigger.Condition,
            ["part"] = instanceKey,
            ["observation"] = JsonNode.Parse(rawObservation),
            ["sentence"] = sentence,
            ["agent_acted"] = agentActed,
            ["agent_acted_reason"] = agentActedReason,
            ["time"] = clock.Now.ToString("O"),
        };
        Append(entry);
    }

    public void RecordCleared(string incidentId, TriggerDescriptor trigger)
    {
        var entry = new JsonObject
        {
            ["type"] = "cleared",
            ["incident_id"] = incidentId,
            ["trigger"] = trigger.JsonKey,
            ["time"] = clock.Now.ToString("O"),
        };
        Append(entry);
    }

    private void Append(JsonObject entry)
    {
        Directory.CreateDirectory(directory);
        File.AppendAllText(_path, entry.ToJsonString() + "\n");
    }
}
