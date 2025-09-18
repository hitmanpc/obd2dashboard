using System;
using System.Collections.Generic;
using System.Linq;

namespace ObdDashboard.Configuration
{
     public static class ObdPidConfiguration
    {
        public static readonly Dictionary<string, ObdPid> SupportedPids = new()
        {
            {
                "RPM", new ObdPid
                {
                    Command = "010C",
                    Name = "RPM",
                    Description = "Engine RPM",
                    Unit = "rpm",
                    DefaultValue = "0",
                    Parser = ParseRpm
                }
            },
            {
                "Speed", new ObdPid
                {
                    Command = "010D",
                    Name = "Speed",
                    Description = "Vehicle Speed",
                    Unit = "km/h", // Will be modified based on unit preference
                    DefaultValue = "0",
                    Parser = ParseSpeed
                }
            },
            {
                "Throttle", new ObdPid
                {
                    Command = "0111",
                    Name = "Throttle",
                    Description = "Throttle Position",
                    Unit = "%",
                    DefaultValue = "0",
                    Parser = ParseThrottle
                }
            },
            {
                "CoolantTemp", new ObdPid
                {
                    Command = "0105",
                    Name = "CoolantTemp",
                    Description = "Engine Coolant Temperature",
                    Unit = "°C",
                    DefaultValue = "0",
                    Parser = ParseCoolantTemp
                }
            },
            {
                "EngineLoad", new ObdPid
                {
                    Command = "0104",
                    Name = "EngineLoad",
                    Description = "Calculated Engine Load",
                    Unit = "%",
                    DefaultValue = "0",
                    IsEnabled = false, // Disabled by default
                    Parser = ParseEngineLoad
                }
            },
            {
                "IntakeTemp", new ObdPid
                {
                    Command = "010F",
                    Name = "IntakeTemp",
                    Description = "Intake Air Temperature",
                    Unit = "°C",
                    DefaultValue = "0",
                    IsEnabled = false, // Disabled by default
                    Parser = ParseIntakeTemp
                }
            },
            {
                "MAF", new ObdPid
                {
                    Command = "0110",
                    Name = "MAF",
                    Description = "Mass Air Flow Rate",
                    Unit = "g/s",
                    DefaultValue = "0",
                    IsEnabled = false, // Disabled by default
                    Parser = ParseMaf
                }
            }
        };

        // Parser functions
        private static string ParseRpm(byte[] data, string speedUnit)
        {
            if (data.Length < 2) return "0";
            int rpm = (int)Math.Round(((data[0] * 256) + data[1]) / 4.0);
            return rpm.ToString();
        }

        private static string ParseSpeed(byte[] data, string speedUnit)
        {
            if (data.Length < 1) return "0";
            if (speedUnit == "mph")
            {
                double mph = Math.Round(data[0] * 0.621371, 1);
                return mph.ToString();
            }
            return data[0].ToString();
        }

        private static string ParseThrottle(byte[] data, string speedUnit)
        {
            if (data.Length < 1) return "0";
            double throttle = (data[0] * 100.0) / 255.0;
            return $"{throttle:F1}";
        }

        private static string ParseCoolantTemp(byte[] data, string speedUnit)
        {
            if (data.Length < 1) return "0";
            int temp = data[0] - 40;
            return temp.ToString();
        }

        private static string ParseEngineLoad(byte[] data, string speedUnit)
        {
            if (data.Length < 1) return "0";
            double load = (data[0] * 100.0) / 255.0;
            return $"{load:F1}";
        }

        private static string ParseIntakeTemp(byte[] data, string speedUnit)
        {
            if (data.Length < 1) return "0";
            int temp = data[0] - 40;
            return temp.ToString();
        }

        private static string ParseMaf(byte[] data, string speedUnit)
        {
            if (data.Length < 2) return "0";
            double maf = ((data[0] * 256) + data[1]) / 100.0;
            return $"{maf:F2}";
        }

        public static IEnumerable<ObdPid> GetEnabledPids()
        {
            return SupportedPids.Values.Where(p => p.IsEnabled);
        }

        public static ObdPid GetPidByCommand(string command)
        {
            return SupportedPids.Values.FirstOrDefault(p => p.Command == command);
        }

        public static ObdPid GetPidByName(string name)
        {
            return SupportedPids.TryGetValue(name, out var pid) ? pid : null;
        }
    }
}