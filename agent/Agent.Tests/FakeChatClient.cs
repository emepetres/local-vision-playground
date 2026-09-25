using System.Runtime.CompilerServices;
using Agent.FoundryLocal;
using Microsoft.Extensions.AI;

namespace Agent.Tests;

/// <summary>
/// A scripted <see cref="IChatClient"/> for whole-Agent Incident tests (issue #65). Each call
/// to <see cref="GetResponseAsync"/> dequeues the next scripted response; once the script runs
/// out it falls back to a plain text reply that calls no tool, so a fixture that never scripts
/// anything drives every Incident down the safety net's template path — exactly what the
/// pre-#65 Incident tests already assert.
/// </summary>
public sealed class FakeChatClient : IChatClient, IModelDescriptor
{
    private readonly Queue<Func<CancellationToken, Task<ChatResponse>>> _script = new();

    public string Description { get; set; } = "fake-model (fake, for tests)";

    /// <summary>What each call received, in order — what the Agent actually hands the chat client.</summary>
    public List<(IReadOnlyList<ChatMessage> Messages, ChatOptions? Options)> Calls { get; } = [];

    /// <summary>Scripts a response where the model calls each named tool with the given sentence.</summary>
    public void EnqueueToolCalls(params (string Name, string Sentence)[] calls) =>
        _script.Enqueue(_ => Task.FromResult(ToolCallResponse(calls)));

    /// <summary>Scripts a plain text reply — an answer in prose, or a tool call written as text; the Agent cannot tell the two apart.</summary>
    public void EnqueueText(string text) =>
        _script.Enqueue(_ => Task.FromResult(TextResponse(text)));

    public void EnqueueThrow(Exception exception) =>
        _script.Enqueue(_ => throw exception);

    /// <summary>Scripts a turn that never returns inside <paramref name="delay"/>, for the timeout safety-net path.</summary>
    public void EnqueueStall(TimeSpan delay) =>
        _script.Enqueue(async ct =>
        {
            await Task.Delay(delay, ct).ConfigureAwait(false);
            return TextResponse("(stalled)");
        });

    public Task<ChatResponse> GetResponseAsync(
        IEnumerable<ChatMessage> messages, ChatOptions? options = null, CancellationToken cancellationToken = default)
    {
        lock (Calls)
        {
            Calls.Add((messages.ToList(), options));
        }

        if (_script.Count == 0)
        {
            return Task.FromResult(TextResponse("acknowledged"));
        }

        return _script.Dequeue()(cancellationToken);
    }

    public async IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(
        IEnumerable<ChatMessage> messages, ChatOptions? options = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var response = await GetResponseAsync(messages, options, cancellationToken).ConfigureAwait(false);
        foreach (var update in response.ToChatResponseUpdates())
        {
            yield return update;
        }
    }

    public object? GetService(Type serviceType, object? serviceKey = null) =>
        serviceKey is null && serviceType.IsInstanceOfType(this) ? this : null;

    public void Dispose()
    {
    }

    public Task<string> DescribeAsync(CancellationToken cancellationToken = default) => Task.FromResult(Description);

    private static ChatResponse ToolCallResponse((string Name, string Sentence)[] calls)
    {
        var contents = calls
            .Select(call => (AIContent)new FunctionCallContent(
                Guid.NewGuid().ToString("N"), call.Name, new Dictionary<string, object?> { ["sentence"] = call.Sentence }))
            .ToList();
        return new ChatResponse(new ChatMessage(ChatRole.Assistant, contents)) { FinishReason = ChatFinishReason.ToolCalls };
    }

    private static ChatResponse TextResponse(string text) =>
        new(new ChatMessage(ChatRole.Assistant, text)) { FinishReason = ChatFinishReason.Stop };
}
