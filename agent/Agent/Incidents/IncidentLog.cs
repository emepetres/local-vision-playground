using System.Text.Json.Nodes;
using Agent.WorkCells;

namespace Agent.Incidents;

/// <summary>
/// The incident log (spec #59, issue #63): JSON Lines, append-only, in the Incidents
/// directory. Never a Frame, a path to one, or image data — a <c>fired</c> entry carries the
/// Incident id, the Trigger, its condition, the part (missing-part only), the Observation exactly as it crossed, the
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
        };

        // Only the missing-part Trigger is one Incident per part; the no-gloves one has a single
        // instance, and its key names no part.
        if (trigger.Kind == TriggerKind.MissingPart)
        {
            entry["part"] = instanceKey;
        }

        entry["observation"] = JsonNode.Parse(rawObservation);
        entry["sentence"] = sentence;
        entry["agent_acted"] = agentActed;
        entry["agent_acted_reason"] = agentActedReason;
        entry["time"] = clock.Now.ToString("O");
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
