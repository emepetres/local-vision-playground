using System.Text.Json;

namespace Agent.Observations;

/// <summary>
/// Parses one line of the Observations file against the contract fixed by ADR-0014 and
/// `docs/fixtures/watch-emit-contract.jsonl`. A line that does not parse is the reader's
/// concern (issue #61: "reported once and skipped"), not this class's — it only throws.
/// </summary>
public static class ObservationLineParser
{
    /// <exception cref="FormatException">The line is not valid JSON, or not a line this contract defines.</exception>
    public static ObservationLine Parse(string line)
    {
        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(line);
        }
        catch (JsonException ex)
        {
            throw new FormatException($"not valid JSON: {ex.Message}", ex);
        }

        using (document)
        {
            var root = document.RootElement;
            var type = RequireString(root, "type");
            return type switch
            {
                "watch_start" => ParseWatchStarted(root),
                "cadence" => ParseCadenceReached(root),
                _ => throw new FormatException($"unknown line type '{type}'"),
            };
        }
    }

    private static ObservationLine.WatchStarted ParseWatchStarted(JsonElement root) =>
        new(RequireDateTimeOffset(root, "time"), RequireString(root, "variant"), RequireDouble(root, "cadence"));

    private static ObservationLine.CadenceReached ParseCadenceReached(JsonElement root)
    {
        var outcomeText = RequireString(root, "outcome");
        var outcome = outcomeText switch
        {
            "objects" => Outcome.Objects,
            "no_shape" => Outcome.NoShape,
            "failed" => Outcome.Failed,
            _ => throw new FormatException($"unknown outcome '{outcomeText}'"),
        };

        var objects = outcome == Outcome.Objects
            ? ParseObjects(RequireProperty(root, "objects"))
            : [];

        return new ObservationLine.CadenceReached(
            RequireInt(root, "cadence"),
            RequireDateTimeOffset(root, "time"),
            RequireString(root, "variant"),
            outcome,
            objects,
            outcome == Outcome.NoShape ? RequireString(root, "reason") : null,
            outcome == Outcome.Failed ? RequireString(root, "error") : null,
            OptionalBool(root, "truncated") ?? false,
            ParseShortfall(root));
    }

    private static IReadOnlyList<ObservedObject> ParseObjects(JsonElement array)
    {
        if (array.ValueKind != JsonValueKind.Array)
        {
            throw new FormatException("'objects' is not an array");
        }

        var objects = new List<ObservedObject>();
        foreach (var item in array.EnumerateArray())
        {
            objects.Add(new ObservedObject(
                RequireString(item, "name"),
                RequireInt(item, "count"),
                OptionalString(item, "where")));
        }

        return objects;
    }

    private static Shortfall? ParseShortfall(JsonElement root)
    {
        if (!root.TryGetProperty("shortfall", out var shortfall) || shortfall.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return new Shortfall(RequireInt(shortfall, "skipped_cadences"), RequireInt(shortfall, "stale_frames"));
    }

    private static JsonElement RequireProperty(JsonElement element, string name)
    {
        if (!element.TryGetProperty(name, out var value))
        {
            throw new FormatException($"missing '{name}'");
        }

        return value;
    }

    private static string RequireString(JsonElement element, string name)
    {
        var value = RequireProperty(element, name);
        return value.ValueKind == JsonValueKind.String
            ? value.GetString()!
            : throw new FormatException($"'{name}' is not a string");
    }

    private static string? OptionalString(JsonElement element, string name) =>
        element.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static int RequireInt(JsonElement element, string name)
    {
        var value = RequireProperty(element, name);
        return value.TryGetInt32(out var i) ? i : throw new FormatException($"'{name}' is not an integer");
    }

    private static double RequireDouble(JsonElement element, string name)
    {
        var value = RequireProperty(element, name);
        return value.TryGetDouble(out var d) ? d : throw new FormatException($"'{name}' is not a number");
    }

    private static bool? OptionalBool(JsonElement element, string name) =>
        element.TryGetProperty(name, out var value) && value.ValueKind is JsonValueKind.True or JsonValueKind.False
            ? value.GetBoolean()
            : null;

    private static DateTimeOffset RequireDateTimeOffset(JsonElement element, string name)
    {
        var text = RequireString(element, name);
        return DateTimeOffset.TryParse(text, out var value)
            ? value
            : throw new FormatException($"'{name}' is not an ISO 8601 time");
    }
}
