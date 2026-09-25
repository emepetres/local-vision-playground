using System.ComponentModel;
using Microsoft.Extensions.AI;

namespace Agent.Incidents;

/// <summary>
/// The one definition of what a model turn over an Incident is told and which two Actions it
/// is given — shared by <see cref="IncidentAgent"/> (issue #65) and
/// <c>ToolCallReliabilityMeasurement</c> (issue #62), so the measurement that picked the
/// pinned model and the Agent that runs it are always asking the same question.
/// </summary>
internal static class IncidentActionTools
{
    public const string Instructions =
        "You are the safety agent for a Work Cell. Every message you receive describes one Incident " +
        "as plain text: a Trigger name, its condition, the Observation line that crossed it, and the " +
        "time. Write one short sentence describing the Incident for a Supervisor to read, then call " +
        "notify_supervisor with that sentence and call log_incident with that same sentence. Always " +
        "call both tools exactly once each; never only describe them in your reply.";

    /// <summary>
    /// The <c>notify_supervisor</c> and <c>log_incident</c> tools, reporting each call's
    /// sentence to the given callback rather than performing the real Action themselves — it
    /// is always the caller's job to decide what a call (or its absence) means.
    /// </summary>
    public static List<AITool> Build(Action<string> onNotifySupervisor, Action<string> onLogIncident) =>
    [
        AIFunctionFactory.Create(
            ([Description("The sentence describing the Incident.")] string sentence) =>
            {
                onNotifySupervisor(sentence);
                return "notified";
            },
            "notify_supervisor",
            "Notify the on-call Supervisor about an Incident.",
            null),
        AIFunctionFactory.Create(
            ([Description("The sentence describing the Incident.")] string sentence) =>
            {
                onLogIncident(sentence);
                return "logged";
            },
            "log_incident",
            "Log an Incident to the incident log.",
            null),
    ];
}
