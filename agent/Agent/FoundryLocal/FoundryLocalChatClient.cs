using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.AI.Foundry.Local;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging.Abstractions;

namespace Agent.FoundryLocal;

/// <summary>
/// Our own <see cref="IChatClient"/> over the typed chat session of Foundry Local 2.0.1
/// (ADR superseding ADR-0002). This is the only type in the codebase that references
/// Foundry Local — every other type talks to the Agent through <see cref="IChatClient"/>.
/// </summary>
/// <remarks>
/// Each call opens a fresh <see cref="ChatSession"/>, replays the whole message history
/// Agent Framework hands it as one <see cref="Request"/>, and disposes the session again:
/// the native session never carries turns from one request to the next, because Agent
/// Framework already resends the full history on every call. Streaming is served by the
/// non-streaming path — Foundry Local's own streaming loses tool calls — so
/// <see cref="GetStreamingResponseAsync"/> wraps a single <see cref="GetResponseAsync"/>
/// call.
/// </remarks>
public sealed class FoundryLocalChatClient : IChatClient, IAsyncDisposable
{
    /// <summary>
    /// The app name <c>vision/</c> registers its <c>Configuration</c> under
    /// (<c>vision/src/vision/inference.py</c>, <c>APP_NAME</c>). Foundry Local derives its
    /// per-app model cache directory from this name, so using the same one here is what
    /// shares the cache directory between the two processes — there is no separate
    /// "cache dir" setting to point at.
    /// </summary>
    private const string SharedAppName = "local-vision-playground";

    /// <summary>
    /// The pinned default Variant id, settled by the tool-call reliability measurement on
    /// the Zenbook (see the ADR and <c>docs/benchmarks/</c>). Resolving by a full variant id
    /// needs no catalogue and no network once the variant is already cached. The measurement
    /// found only the plain (unaccelerated) CPU build reliable: both `openvino-gpu` and
    /// `openvino-npu` consistently dropped one of the two tool calls, every run.
    /// </summary>
    public const string DefaultVariantId = "qwen2.5-1.5b-instruct-generic-cpu:4";

    private static int s_telemetryDisabled;

    private readonly string _variantId;
    private readonly SemaphoreSlim _modelLock = new(1, 1);
    private IModel? _model;

    public FoundryLocalChatClient(string? variantId = null)
    {
        // Must run before the native library loads, which the first Foundry Local call
        // below triggers — a static constructor is not early enough to guarantee ordering
        // across multiple instances, so every constructor call sets it (mirrors backlog
        // item 10 in vision/, where the same env var is set ahead of the first lazy import).
        if (Interlocked.Exchange(ref s_telemetryDisabled, 1) == 0)
        {
            Environment.SetEnvironmentVariable("ORT_TELEMETRY_DISABLED", "1");
        }

        _variantId = variantId ?? DefaultVariantId;
    }

    public async Task<ChatResponse> GetResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var model = await ResolveModelAsync(cancellationToken).ConfigureAwait(false);

        using var session = new ChatSession(model);
        foreach (var tool in ToolDefinitionsOf(options))
        {
            session.AddToolDefinition(tool.Name, tool.Description ?? string.Empty, tool.JsonSchema.GetRawText());
        }

        using var request = BuildRequest(messages, options);
        using var response = await session.ProcessRequestAsync(request, cancellationToken).ConfigureAwait(false);

        return ToChatResponse(response);
    }

    public async IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        // Foundry Local's own streaming path drops tool calls (the reason for this whole
        // adapter, per the ADR); a non-streaming call served as one update never can.
        var response = await GetResponseAsync(messages, options, cancellationToken).ConfigureAwait(false);
        foreach (var update in response.ToChatResponseUpdates())
        {
            yield return update;
        }
    }

    public object? GetService(Type serviceType, object? serviceKey = null)
    {
        return serviceKey is null && serviceType.IsInstanceOfType(this) ? this : null;
    }

    public void Dispose()
    {
        // Best-effort: IModel only exposes an async unload. A synchronous Dispose() cannot
        // await it, so the Agent Framework agents this client backs should prefer
        // DisposeAsync() — this path still unloads, just blocking the calling thread.
        DisposeAsync().AsTask().GetAwaiter().GetResult();
    }

    public async ValueTask DisposeAsync()
    {
        if (_model is not null)
        {
            await _model.UnloadAsync().ConfigureAwait(false);
        }

        _modelLock.Dispose();
    }

    private async Task<IModel> ResolveModelAsync(CancellationToken cancellationToken)
    {
        if (_model is not null)
        {
            return _model;
        }

        await _modelLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (_model is not null)
            {
                return _model;
            }

            if (!FoundryLocalManager.IsInitialized)
            {
                var configuration = new Configuration
                {
                    AppName = SharedAppName,
                    DisableNonessentialTelemetry = true,
                };
                await FoundryLocalManager.CreateAsync(configuration, NullLogger.Instance, cancellationToken)
                    .ConfigureAwait(false);
            }

            var manager = FoundryLocalManager.Instance;
            var catalog = await manager.GetCatalogAsync(cancellationToken).ConfigureAwait(false);
            var model = await catalog.GetModelVariantAsync(_variantId, cancellationToken).ConfigureAwait(false)
                ?? throw new FoundryLocalException($"'{_variantId}' does not resolve to a cached or catalogued Variant (run `foundry model list`).");

            if (!await model.IsCachedAsync(cancellationToken).ConfigureAwait(false))
            {
                await model.DownloadAsync(_ => { }, cancellationToken).ConfigureAwait(false);
            }

            await EnsureExecutionProviderRegisteredAsync(manager, model, cancellationToken).ConfigureAwait(false);

            await model.LoadAsync(cancellationToken).ConfigureAwait(false);

            _model = model;
            return model;
        }
        finally
        {
            _modelLock.Release();
        }
    }

    /// <summary>
    /// Some Variants (the <c>openvino-*</c> ones on this machine) need their Execution Provider
    /// downloaded and registered before <see cref="IModel.LoadAsync"/> — a plain <c>LoadAsync</c>
    /// call fails with "requires OpenVINOExecutionProvider which is not registered" otherwise.
    /// Found during the tool-call reliability measurement, where the NPU and iGPU legs of the
    /// OpenVINO candidate errored out until this ran first.
    /// </summary>
    private static async Task EnsureExecutionProviderRegisteredAsync(
        FoundryLocalManager manager,
        IModel model,
        CancellationToken cancellationToken)
    {
        var info = model.Info;
        if (info is null)
        {
            return;
        }

        var requiredEp = info.Runtime?.ExecutionProvider;
        if (string.IsNullOrEmpty(requiredEp))
        {
            return;
        }

        if ((manager.DiscoverEps() ?? []).Any(ep => ep.Name == requiredEp && ep.IsRegistered))
        {
            return;
        }

        await manager.DownloadAndRegisterEpsAsync([requiredEp], cancellationToken).ConfigureAwait(false);
    }

    private static IEnumerable<AIFunctionDeclaration> ToolDefinitionsOf(ChatOptions? options)
    {
        if (options?.Tools is not { Count: > 0 } tools)
        {
            yield break;
        }

        foreach (var tool in tools)
        {
            if (tool is AIFunctionDeclaration declaration)
            {
                yield return declaration;
            }
        }
    }

    private static Request BuildRequest(IEnumerable<ChatMessage> messages, ChatOptions? options)
    {
        var request = new Request();
        foreach (var message in messages)
        {
            AddMessage(request, message);
        }

        request.SetOptions(ToRequestOptions(options));
        return request;
    }

    private static void AddMessage(Request request, ChatMessage message)
    {
        if (message.Role == ChatRole.Tool)
        {
            // A tool-role message carries the result(s) of function calls the assistant
            // made in an earlier turn — each becomes its own item, sibling to the
            // ToolCallItem it answers, since Foundry Local has no wrapping "message" for it.
            foreach (var content in message.Contents)
            {
                if (content is FunctionResultContent result)
                {
                    request.AddItem(new ToolResultItem(result.CallId, FormatToolResult(result.Result)), takeOwnership: true);
                }
            }

            return;
        }

        var text = message.Text;
        if (!string.IsNullOrEmpty(text))
        {
            request.AddItem(ToMessageItem(message.Role, text, message.AuthorName), takeOwnership: true);
        }

        foreach (var content in message.Contents)
        {
            if (content is FunctionCallContent call)
            {
                var arguments = JsonSerializer.Serialize(call.Arguments);
                request.AddItem(new ToolCallItem(call.CallId, call.Name, arguments), takeOwnership: true);
            }
        }
    }

    private static string FormatToolResult(object? result) => result switch
    {
        null => string.Empty,
        string s => s,
        _ => JsonSerializer.Serialize(result),
    };

    private static MessageItem ToMessageItem(ChatRole role, string text, string? name)
    {
        var authorName = name ?? string.Empty;
        if (role == ChatRole.System)
        {
            return MessageItem.System(text, authorName);
        }

        if (role == ChatRole.Assistant)
        {
            return MessageItem.Assistant(text, authorName);
        }

        return MessageItem.User(text, authorName);
    }

    private static RequestOptions ToRequestOptions(ChatOptions? options)
    {
        var requestOptions = new RequestOptions
        {
            Search = new SearchOptions
            {
                Temperature = options?.Temperature,
                TopP = options?.TopP,
                TopK = options?.TopK,
                MaxOutputTokens = options?.MaxOutputTokens is { } maxOutputTokens ? (int)maxOutputTokens : null,
                FrequencyPenalty = options?.FrequencyPenalty,
                PresencePenalty = options?.PresencePenalty,
                // checked: Foundry Local's Seed is an int; a caller-supplied long outside its
                // range must fail loudly rather than silently reproduce a different run.
                Seed = options?.Seed is { } seed ? checked((int)seed) : null,
            },
            ToolChoice = ToToolChoice(options?.ToolMode),
        };
        return requestOptions;
    }

    private static ToolChoice? ToToolChoice(ChatToolMode? mode) => mode switch
    {
        null => null,
        NoneChatToolMode => ToolChoice.None,
        RequiredChatToolMode => ToolChoice.Required,
        _ => ToolChoice.Auto,
    };

    private static ChatResponse ToChatResponse(Response response)
    {
        var contents = new List<AIContent>();
        for (var i = 0; i < response.ItemCount; i++)
        {
            using var item = response.GetItem(i);
            switch (item)
            {
                case ToolCallItem call:
                    contents.Add(new FunctionCallContent(call.CallId, call.Name, ParseArguments(call.Arguments)));
                    break;
                case MessageItem message when message.IsSimpleText():
                    contents.Add(new TextContent(message.GetSimpleText()));
                    break;
                case TextItem text:
                    contents.Add(new TextContent(text.Text));
                    break;
            }
        }

        var chatResponse = new ChatResponse(new ChatMessage(ChatRole.Assistant, contents))
        {
            FinishReason = ToFinishReason(response.FinishReason),
        };

        var usage = response.GetUsage();
        chatResponse.Usage = new UsageDetails
        {
            InputTokenCount = usage.PromptTokens,
            OutputTokenCount = usage.CompletionTokens,
            TotalTokenCount = usage.TotalTokens,
        };

        return chatResponse;
    }

    private static IDictionary<string, object?> ParseArguments(string argumentsJson)
    {
        if (string.IsNullOrWhiteSpace(argumentsJson))
        {
            return new Dictionary<string, object?>();
        }

        using var document = JsonDocument.Parse(argumentsJson);
        var arguments = new Dictionary<string, object?>();
        foreach (var property in document.RootElement.EnumerateObject())
        {
            arguments[property.Name] = property.Value.Clone();
        }

        return arguments;
    }

    private static ChatFinishReason? ToFinishReason(FinishReason reason) => reason switch
    {
        Microsoft.AI.Foundry.Local.FinishReason.Stop => ChatFinishReason.Stop,
        Microsoft.AI.Foundry.Local.FinishReason.Length => ChatFinishReason.Length,
        Microsoft.AI.Foundry.Local.FinishReason.ToolCalls => ChatFinishReason.ToolCalls,
        _ => null,
    };
}
