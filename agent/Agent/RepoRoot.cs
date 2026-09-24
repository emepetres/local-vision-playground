namespace Agent;

/// <summary>
/// Locates the repository root from any working directory, so the Agent's defaults (issue
/// #61) resolve to the same well-known paths whether it is started from `agent/`,
/// `agent/Agent/`, or the repository root.
/// </summary>
public static class RepoRoot
{
    private const string Marker = "CLAUDE.md";

    public static string Find(string startDirectory)
    {
        for (var dir = new DirectoryInfo(startDirectory); dir is not null; dir = dir.Parent)
        {
            if (File.Exists(Path.Combine(dir.FullName, Marker)))
            {
                return dir.FullName;
            }
        }

        throw new DirectoryNotFoundException(
            $"could not locate the repository root ({Marker} not found above '{startDirectory}')");
    }
}
