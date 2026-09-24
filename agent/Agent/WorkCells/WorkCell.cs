namespace Agent.WorkCells;

/// <summary>
/// A canonical name plus the synonyms the model uses for the same thing (issue #61), so
/// that "solder iron" and "soldering iron" count as the same Tray part or Zone object.
/// </summary>
public sealed record NamedObject(string Name, IReadOnlyList<string> Synonyms);

/// <summary>The three Triggers a Work Cell can put in force (spec #59).</summary>
public enum TriggerKind
{
    MissingPart,
    NoGloves,
    ForeignObject,
}

/// <summary>
/// A Trigger's fixed identity: the JSON key a Work Cell file names it by, its label and its
/// condition in words. The one place these are written down, so a fourth Trigger is added
/// here once rather than in every switch that used to read on <see cref="TriggerKind"/>.
/// </summary>
public sealed record TriggerDescriptor(TriggerKind Kind, string JsonKey, string Label, string Condition);

public static class TriggerCatalog
{
    public static readonly IReadOnlyList<TriggerDescriptor> All =
    [
        new(TriggerKind.MissingPart, "missing_part",
            "part missing from the tray",
            "an expected part is in neither the Tray nor the Zone"),
        new(TriggerKind.NoGloves, "no_gloves",
            "working without gloves",
            "a bare hand is visible"),
        new(TriggerKind.ForeignObject, "foreign_object",
            "foreign object in the zone",
            "something on the Zone that neither the Zone's nor the Tray's list names"),
    ];

    public static TriggerDescriptor Of(TriggerKind kind) => All.First(d => d.Kind == kind);

    public static bool TryParseKey(string key, out TriggerKind kind)
    {
        foreach (var descriptor in All)
        {
            if (string.Equals(descriptor.JsonKey, key, StringComparison.OrdinalIgnoreCase))
            {
                kind = descriptor.Kind;
                return true;
            }
        }

        kind = default;
        return false;
    }
}

/// <summary>One Trigger in force, with its condition in words and its N (issue #61).</summary>
public sealed record TriggerConfig(TriggerKind Kind, int N)
{
    public string Label => TriggerCatalog.Of(Kind).Label;

    public string Condition => TriggerCatalog.Of(Kind).Condition;
}

/// <summary>
/// The station a Watch is pointed at (CONTEXT.md): the Tray's expected parts, the Zone's
/// allowed objects, the hand-name sets and the Triggers in force. Loaded from a plain JSON
/// file and validated at start (issue #61).
/// </summary>
public sealed record WorkCell(
    string Name,
    string SourcePath,
    IReadOnlyList<NamedObject> ExpectedParts,
    IReadOnlyList<NamedObject> AllowedObjects,
    IReadOnlyList<string> BareHandNames,
    IReadOnlyList<string> GlovedHandNames,
    IReadOnlyList<TriggerConfig> Triggers);

/// <summary>
/// Refuses a Work Cell file whose Triggers, N or Tray cannot be trusted, with the reason
/// (issue #61: "a typo does not become a silent Trigger that never fires").
/// </summary>
public sealed class WorkCellConfigurationException(string reason) : Exception(reason);
