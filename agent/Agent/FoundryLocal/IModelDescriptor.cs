namespace Agent.FoundryLocal;

/// <summary>
/// Describes which model and Execution Provider actually answers, for the Agent's header
/// (issue #65: "The header states the model and its Execution Provider"). Only the chat
/// client that talks to a real model needs to resolve one; a fake used in tests can return
/// whatever it likes, since there is nothing here to prove against the real Foundry Local
/// surface (mirrors the stance in ADR-0015).
/// </summary>
public interface IModelDescriptor
{
    Task<string> DescribeAsync(CancellationToken cancellationToken = default);
}
