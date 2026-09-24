using System.Runtime.CompilerServices;
using System.Text;

namespace Agent.Observations;

/// <summary>What one tick of following the Observations file produced (issue #61).</summary>
public enum FollowedEventKind
{
    /// <summary>The file was recreated by a new Watch.</summary>
    Recreated,

    /// <summary>One complete line, exactly as it crossed.</summary>
    Line,
}

public sealed record FollowedEvent(FollowedEventKind Kind, string? Text = null);

/// <summary>
/// Follows the Observations file from the present onward: seeks to its end at start, never
/// replays earlier lines, waits for the file if it does not exist yet, and notices the file
/// being recreated by a new Watch (issue #61).
/// </summary>
/// <remarks>
/// Recreation is told apart from a continuing append by fingerprinting the file's first
/// line, not by file-system metadata: on Windows, deleting and recreating a file under the
/// same name within a few seconds (exactly what `watch --emit` does every run) can reuse
/// both the old creation timestamp (filesystem tunnelling) and the old MFT record, so
/// neither is a reliable "this is a different file" signal here. A shorter length than
/// already read is the other, cheaper tell — most real recreations hit that first.
/// </remarks>
public sealed class ObservationsFollower(string path, TimeSpan? pollInterval = null)
{
    private readonly TimeSpan _pollInterval = pollInterval ?? TimeSpan.FromMilliseconds(100);

    public async IAsyncEnumerable<FollowedEvent> FollowAsync([EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var skipExistingContentOnce = File.Exists(path);
        long position = 0;
        byte[]? firstLineSnapshot = null;

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (!File.Exists(path))
            {
                position = 0;
                firstLineSnapshot = null;
                await Task.Delay(_pollInterval, cancellationToken).ConfigureAwait(false);
                continue;
            }

            FileStream stream;
            try
            {
                stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
            }
            catch (IOException)
            {
                // The file is mid-recreation (deleted, not yet recreated) — try again next tick.
                await Task.Delay(_pollInterval, cancellationToken).ConfigureAwait(false);
                continue;
            }

            using (stream)
            {
                if (skipExistingContentOnce)
                {
                    // Nothing here is replayed, but its first line is still worth fingerprinting,
                    // so a same-size-or-larger recreation right after start is not missed later.
                    firstLineSnapshot = ReadFirstLine(stream);
                    position = stream.Length;
                    skipExistingContentOnce = false;
                }
                else if (IsRecreated(stream, position, firstLineSnapshot))
                {
                    position = 0;
                    firstLineSnapshot = null;
                    yield return new FollowedEvent(FollowedEventKind.Recreated);
                }

                if (stream.Length > position)
                {
                    stream.Seek(position, SeekOrigin.Begin);
                    var buffer = new byte[stream.Length - position];
                    var read = stream.Read(buffer, 0, buffer.Length);
                    var text = Encoding.UTF8.GetString(buffer, 0, read);

                    // Only complete lines are consumed — a line still being written is left for
                    // the next tick, since the emitter flushes a whole line at a time.
                    var lastNewline = text.LastIndexOf('\n');
                    if (lastNewline >= 0)
                    {
                        if (position == 0 && firstLineSnapshot is null)
                        {
                            var firstLineEnd = text.IndexOf('\n');
                            firstLineSnapshot = Encoding.UTF8.GetBytes(text[..(firstLineEnd + 1)]);
                        }

                        foreach (var rawLine in text[..lastNewline].Split('\n'))
                        {
                            var line = rawLine.TrimEnd('\r');
                            if (line.Length > 0)
                            {
                                yield return new FollowedEvent(FollowedEventKind.Line, line);
                            }
                        }

                        position += Encoding.UTF8.GetByteCount(text[..(lastNewline + 1)]);
                    }
                }
            }

            await Task.Delay(_pollInterval, cancellationToken).ConfigureAwait(false);
        }
    }

    private static bool IsRecreated(FileStream stream, long position, byte[]? firstLineSnapshot)
    {
        if (stream.Length < position)
        {
            return true;
        }

        if (firstLineSnapshot is null || stream.Length < firstLineSnapshot.Length)
        {
            return firstLineSnapshot is not null;
        }

        var buffer = new byte[firstLineSnapshot.Length];
        stream.Seek(0, SeekOrigin.Begin);
        var read = stream.Read(buffer, 0, buffer.Length);
        return read != buffer.Length || !buffer.AsSpan().SequenceEqual(firstLineSnapshot);
    }

    private static byte[]? ReadFirstLine(FileStream stream)
    {
        stream.Seek(0, SeekOrigin.Begin);
        var buffer = new byte[stream.Length];
        var read = stream.Read(buffer, 0, buffer.Length);
        var text = Encoding.UTF8.GetString(buffer, 0, read);
        var newline = text.IndexOf('\n');
        return newline < 0 ? null : Encoding.UTF8.GetBytes(text[..(newline + 1)]);
    }
}
