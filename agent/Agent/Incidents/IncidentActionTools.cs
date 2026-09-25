using System.ComponentModel;
using Microsoft.Extensions.AI;

namespace Agent.Incidents;

/// <summary>
/// The one definition of what a model turn over an Incident is told (nothing) and which two
/// Actions it is given — shared by <see cref="IncidentAgent"/> (issue #65) and
/// <c>ToolCallReliabilityMeasurement</c> (issue #62), so the measurement that picked the
/// pinned model and the Agent that runs it are always asking the same question.
/// </summary>
internal static class IncidentActionTools
{
    /// <summary>
    /// None, on purpose: the turn carries only the Incident text and the two tool definitions.
    /// Every system prompt measured on the pinned model pulled it off its native tool-call
    /// format — prose first and the calls written as JSON text, bare JSON the parser does not
    /// recognise, or one call and then narration — and cost it anything from 2 to 10 of 10
    /// Incidents. Without one it calls both tools, 10/10 (ADR-0015). Setting this changes what
    /// the turn and the measurement both send, so re-run the measurement before pinning.
    /// </summary>
    public static readonly string? Instructions = null;

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
