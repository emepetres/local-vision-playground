using System.Text.Json;
using System.Text.Json.Serialization;

namespace Agent.WorkCells;

/// <summary>Reads and validates a Work Cell file (issue #61).</summary>
public static class WorkCellFile
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
    };

    /// <exception cref="WorkCellConfigurationException">
    /// The file names an unknown Trigger or one not built yet, gives one an N below one, turns
    /// the missing-part Trigger on over an empty Tray, or the no-gloves Trigger on with no
    /// bare-hand names.
    /// </exception>
    public static WorkCell Load(string path)
    {
        if (!File.Exists(path))
        {
            throw new WorkCellConfigurationException($"the Work Cell file '{path}' does not exist");
        }

        WorkCellDto? dto;
        try
        {
            var json = File.ReadAllText(path);
            dto = JsonSerializer.Deserialize<WorkCellDto>(json, SerializerOptions);
        }
        catch (JsonException ex)
        {
            throw new WorkCellConfigurationException($"the Work Cell file '{path}' is not valid JSON: {ex.Message}");
        }

        if (dto is null)
        {
            throw new WorkCellConfigurationException($"the Work Cell file '{path}' is empty");
        }

        var expectedParts = ToNamedObjects(dto.Tray?.ExpectedParts);
        var allowedObjects = ToNamedObjects(dto.Zone?.AllowedObjects);
        var bareHandNames = dto.Hands?.Bare ?? [];
        var glovedHandNames = dto.Hands?.Gloved ?? [];
        var triggers = ToTriggers(dto.Triggers, path);

        if (triggers.Any(t => t.Kind == TriggerKind.MissingPart) && expectedParts.Count == 0)
        {
            throw new WorkCellConfigurationException(
                $"the Work Cell file '{path}' turns the missing-part Trigger on, but the Tray's expected parts list is empty");
        }

        if (triggers.Any(t => t.Kind == TriggerKind.NoGloves) && bareHandNames.Count == 0)
        {
            throw new WorkCellConfigurationException(
                $"the Work Cell file '{path}' turns the no-gloves Trigger on, but the hands' bare names list is empty");
        }

        var name = string.IsNullOrWhiteSpace(dto.Name)
            ? Path.GetFileNameWithoutExtension(path)
            : dto.Name;

        return new WorkCell(name, path, expectedParts, allowedObjects, bareHandNames, glovedHandNames, triggers);
    }

    private static List<NamedObject> ToNamedObjects(List<NamedObjectDto>? items) =>
        (items ?? []).Select(i => new NamedObject(i.Name ?? string.Empty, i.Synonyms ?? [])).ToList();

    private static List<TriggerConfig> ToTriggers(Dictionary<string, TriggerDto>? triggers, string path)
    {
        var result = new List<TriggerConfig>();
        foreach (var (key, value) in triggers ?? [])
        {
            if (!TriggerCatalog.TryParseKey(key, out var kind))
            {
                var known = string.Join(", ", TriggerCatalog.All.Select(d => d.JsonKey));
                throw new WorkCellConfigurationException(
                    $"the Work Cell file '{path}' names an unknown Trigger '{key}' (known: {known})");
            }

            if (kind == TriggerKind.ForeignObject)
            {
                // Named in the catalogue, but TriggerEngine does not evaluate it yet: accepting it
                // would put a Trigger in force that can never fire.
                throw new WorkCellConfigurationException(
                    $"the Work Cell file '{path}' turns on Trigger '{key}', which is not built yet (issue #70)");
            }

            if (value is null)
            {
                throw new WorkCellConfigurationException(
                    $"the Work Cell file '{path}' gives Trigger '{key}' no configuration");
            }

            if (value.N < 1)
            {
                throw new WorkCellConfigurationException(
                    $"the Work Cell file '{path}' gives Trigger '{key}' an N of {value.N}, which must be at least 1");
            }

            result.Add(new TriggerConfig(kind, value.N));
        }

        return result;
    }

    private sealed class WorkCellDto
    {
        public string? Name { get; set; }
        public TrayDto? Tray { get; set; }
        public ZoneDto? Zone { get; set; }
        public HandsDto? Hands { get; set; }
        public Dictionary<string, TriggerDto>? Triggers { get; set; }
    }

    private sealed class TrayDto
    {
        public List<NamedObjectDto>? ExpectedParts { get; set; }
    }

    private sealed class ZoneDto
    {
        public List<NamedObjectDto>? AllowedObjects { get; set; }
    }

    private sealed class NamedObjectDto
    {
        public string? Name { get; set; }
        public List<string>? Synonyms { get; set; }
    }

    private sealed class HandsDto
    {
        public List<string>? Bare { get; set; }
        public List<string>? Gloved { get; set; }
    }

    private sealed class TriggerDto
    {
        [JsonPropertyName("n")]
        public int N { get; set; } = 2;
    }
}
