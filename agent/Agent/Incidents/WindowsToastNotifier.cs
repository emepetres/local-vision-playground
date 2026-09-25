using Microsoft.Toolkit.Uwp.Notifications;

namespace Agent.Incidents;

/// <summary>
/// Raises a Windows desktop toast carrying the Trigger and the sentence, from the
/// unpackaged console app (spec #59, issue #63).
/// </summary>
public sealed class WindowsToastNotifier : IIncidentNotifier
{
    public void Notify(string triggerLabel, string sentence)
    {
        new ToastContentBuilder()
            .AddText(triggerLabel)
            .AddText(sentence)
            .Show();
    }
}
