using System.Collections.Generic;

namespace ObdDashboard.Configuration
{
    public class ObdMode
    {
        public string RequestMode { get; set; } = string.Empty;
        public string ResponseHeader { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public static class ObdModeConfiguration
    {
        public static readonly Dictionary<string, ObdMode> SupportedModes = new()
        {
            {
                "01", new ObdMode
                {
                    RequestMode = "01",
                    ResponseHeader = "41",
                    Description = "Show current data"
                }
            },
            {
                "09", new ObdMode
                {
                    RequestMode = "09",
                    ResponseHeader = "49",
                    Description = "Vehicle information"
                }
            },
            {
                "03", new ObdMode
                {
                    RequestMode = "03",
                    ResponseHeader = "43",
                    Description = "Show stored DTCs"
                }
            },
            {
                "22", new ObdMode
                {
                    RequestMode = "22",
                    ResponseHeader = "62",
                    Description = "Manufacturer-specific data"
                }
            },
        };

        public static string GetResponseHeader(string mode)
        {
            return SupportedModes.TryGetValue(mode, out var modeConfig)
                ? modeConfig.ResponseHeader
                : "41"; // Default fallback to mode 01 response header aka live mode
        }
    }
}