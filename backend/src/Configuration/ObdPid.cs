using System;

namespace ObdDashboard.Configuration
{
    /// <summary>
    /// Represents an OBD PID (Parameter ID) configuration.
    /// </summary>
    public class ObdPid
    {
        public string Command { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public Func<byte[], string, string> Parser { get; set; }
        public string DefaultValue { get; set; }
        public bool IsEnabled { get; set; } = true;
    }
}