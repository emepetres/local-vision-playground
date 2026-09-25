using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;

namespace Agent.Incidents;

/// <summary>
/// What the model turn settled for one Incident: the sentence the Supervisor reads — the
/// model's own, or the template one when the safety net had to speak for it — and whether
/// the model is the reason nothing more needs doing (issue #65).
/// </summary>
public sealed record IncidentTurnOutcome(string Sentence, bool AgentActed, string AgentActedReason);

/// <summary>
/// Hands one Incident to a Microsoft Agent Framework agent over our own <see cref="IChatClient"/>
/// (issue #65, spec #59). A turn runs only when a Trigger fires, never per Observation, is
/// non-streaming and bounded by <see cref="DefaultTurnTimeout"/>.
/// </summary>
/// <remarks>
/// Neither tool this agent is given ever performs the real Action: each just records that the
/// model asked for it, and with what sentence. <see cref="AgentProcess"/> is the one place
/// that ever really notifies or logs, exactly once, from the <see cref="IncidentTurnOutcome"/>
/// this returns — which is what makes "the Incident is logged exactly once and notified
/// exactly once, whatever the model did" true regardless of how the model behaved.
/// <see cref="ActAsync"/> never throws: an exception, a timeout, a tool call written as text,
/// and a reply that never calls both tools all fall back to the same verdict — agentActed:
/// false, and the template sentence the caller already had to hand.
/// </remarks>
public sealed class IncidentAgent
{
    /// <summary>
    /// A turn on the pinned CPU model takes ~15-25 s (measured, issue #62's benchmark); this
    /// bounds a stall comfortably above that without cutting a normal turn short.
    /// </summary>
    public static readonly TimeSpan DefaultTurnTimeout = TimeSpan.FromSeconds(60);

    private readonly IChatClient _chatClient;
    private readonly TimeSpan _turnTimeout;

    public IncidentAgent(IChatClient chatClient, TimeSpan? turnTimeout = null)
    {
        _chatClient = chatClient;
        _turnTimeout = turnTimeout ?? DefaultTurnTimeout;
    }

    public async Task<IncidentTurnOutcome> ActAsync(string incidentText, string templateSentence, CancellationToken cancellationToken)
    {
        var tracker = new ActionTracker();
        var agent = _chatClient.AsAIAgent(new ChatClientAgentOptions
        {
            ChatOptions = new ChatOptions
            {
                Instructions = IncidentActionTools.Instructions,
                Tools = IncidentActionTools.Build(
                    sentence =>
                    {
                        tracker.NotifySupervisorCalled = true;
                        tracker.Sentence ??= sentence;
                    },
                    sentence =>
                    {
                        tracker.LogIncidentCalled = true;
                        tracker.Sentence ??= sentence;
                    }),
                // An Incident's sentence is short; bounding it keeps a CPU-only turn from
                // wandering into a long generation once it has already answered (mirrors the
                // measurement in ToolCallReliabilityMeasurement).
                MaxOutputTokens = 256,
            },
        });

        string? failureReason = null;
        try
        {
            using var timeoutCts = new CancellationTokenSource(_turnTimeout);
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            var session = await agent.CreateSessionAsync(linkedCts.Token).ConfigureAwait(false);
            await agent.RunAsync(incidentText, session, cancellationToken: linkedCts.Token).ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // The Agent is shutting down mid-turn. The Incident has already fired and its streak
            // is spent, so the safety net still speaks for it — the caller logs and notifies it
            // before the shutdown reaches the follow loop.
            failureReason = "the Agent shut down during the model turn";
        }
        catch (OperationCanceledException)
        {
            failureReason = $"the model turn did not finish within {_turnTimeout.TotalSeconds:F0} s";
        }
        catch (Exception ex)
        {
            failureReason = $"the model turn threw {ex.GetType().Name}: {ex.Message}";
        }

        var sentence = tracker.Sentence ?? templateSentence;

        if (failureReason is not null)
        {
            return new IncidentTurnOutcome(sentence, AgentActed: false, $"{failureReason}: the sentence and the Actions came from the template path");
        }

        if (tracker.NotifySupervisorCalled && tracker.LogIncidentCalled)
        {
            return new IncidentTurnOutcome(sentence, AgentActed: true, "the model called both Actions itself");
        }

        var missing = string.Join(" and ", MissingActions(tracker));
        return new IncidentTurnOutcome(
            sentence, AgentActed: false, $"the model never called {missing}: the sentence and the Actions came from the template path");
    }

    private static IEnumerable<string> MissingActions(ActionTracker tracker)
    {
        if (!tracker.NotifySupervisorCalled)
        {
            yield return "notify_supervisor";
        }

        if (!tracker.LogIncidentCalled)
        {
            yield return "log_incident";
        }
    }

    /// <summary>Whether the model asked for each Action, and the sentence it wrote for them.</summary>
    private sealed class ActionTracker
    {
        public bool NotifySupervisorCalled;
        public bool LogIncidentCalled;
        public string? Sentence;
    }
}
