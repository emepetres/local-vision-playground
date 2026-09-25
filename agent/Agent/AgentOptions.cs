namespace Agent;

/// <summary>
/// The Agent's command line (issue #61): every path defaults to the well-known one so two
/// panes need no flags, and each can be overridden.
/// </summary>
public sealed record AgentOptions(string ObservationsPath, string WorkCellPath, string IncidentsDirectory, string? VariantId)
{
    public static AgentOptions Parse(string[] args, string repoRoot)
    {
        string? observations = null;
        string? workCell = null;
        string? incidents = null;
        string? variant = null;

        for (var i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--observations":
                    observations = RequireValue(args, ref i);
                    break;
                case "--work-cell":
                    workCell = RequireValue(args, ref i);
                    break;
                case "--incidents":
                    incidents = RequireValue(args, ref i);
                    break;
                case "--variant":
                    variant = RequireValue(args, ref i);
                    break;
                default:
                    throw new ArgumentException($"unknown argument '{args[i]}'");
            }
        }

        return new AgentOptions(
            observations ?? Path.Combine(repoRoot, "vision", "observations.jsonl"),
            workCell ?? Path.Combine(repoRoot, "agent", "work-cell.json"),
            incidents ?? Path.Combine(repoRoot, "agent", "incidents"),
            variant);
    }

    private static string RequireValue(string[] args, ref int i)
    {
        var flag = args[i];
        if (i + 1 >= args.Length)
        {
            throw new ArgumentException($"'{flag}' needs a value");
        }

        return args[++i];
    }
}
