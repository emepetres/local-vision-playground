using Agent;

namespace Agent.Tests;

public class AgentProcessTests
{
    [Fact]
    public void Name_IsAgent()
    {
        Assert.Equal("Agent", AgentProcess.Name);
    }
}
