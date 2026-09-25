using System.Text;

namespace Agent.Tests;

/// <summary>
/// A <see cref="TextWriter"/> the test thread can read from while the Agent writes to it on
/// its own background task — a plain <see cref="StringWriter"/> is not safe for that.
/// </summary>
public sealed class SynchronizedStringWriter : TextWriter
{
    private readonly StringBuilder _builder = new();
    private readonly object _lock = new();

    public override Encoding Encoding => Encoding.UTF8;

    public override void WriteLine(string? value)
    {
        lock (_lock)
        {
            _builder.AppendLine(value);
        }
    }

    public override void Write(char value)
    {
        lock (_lock)
        {
            _builder.Append(value);
        }
    }

    public override string ToString()
    {
        lock (_lock)
        {
            return _builder.ToString();
        }
    }
}
