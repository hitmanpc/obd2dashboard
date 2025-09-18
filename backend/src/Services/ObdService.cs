using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Text.Json;
using System.Threading;
using ObdDashboard.Configuration;
using ObdDashboard.Communication;

namespace ObdDashboard.Services
{
    public class ObdService
    {
        private readonly AtCommandManager _atCommandManager;

        public ObdService()
        {
            _atCommandManager = new AtCommandManager();
        }

        public bool TryConnect(string portName, out SerialPort serial)
        {
            try
            {
                Console.WriteLine($"Attempting to open port: {portName}");
                serial = new SerialPort(portName, 38400)
                {
                    ReadTimeout = 500,
                    WriteTimeout = 500
                };
                serial.Open();
                Console.WriteLine($"Port {portName} opened successfully.");
                serial.DiscardInBuffer();

                // Test connection using AT command manager
                if (_atCommandManager.TestConnection(serial))
                {
                    Console.WriteLine("ELM327 detected successfully");
                    return true;
                }

                Console.WriteLine("ELM327 not detected in response");
                serial.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to connect to {portName}: {ex.Message}");
            }

            serial = null!;
            return false;
        }

        public bool InitElm(SerialPort serial)
        {
            return _atCommandManager.InitializeElm327(serial);
        }

        public string QueryLiveData(SerialPort serial, string speedUnit = "km/h")
        {
            var results = new Dictionary<string, string>
            {
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["SpeedUnit"] = speedUnit
            };

            // Query each enabled PID with error handling
            foreach (var pidConfig in ObdPidConfiguration.GetEnabledPids())
            {
                try
                {
                    var rawResponse = Query(serial, pidConfig.Command);
                    results[pidConfig.Name] = ParseObdResponse(rawResponse, pidConfig, speedUnit);
                }
                catch (Exception ex)
                {
                    results[pidConfig.Name] = $"Error: {ex.Message}";
                }
            }

            return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
        }
        private string ParseObdResponse(string response, ObdPid pidConfig, string speedUnit = "km/h")
        {
            try
            {
                // Clean up the response
                var clean = response.Trim().ToUpper()
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .Replace(">", "")
                    .Replace(" ", "");

                Console.WriteLine($"Parsing cleaned response for {pidConfig.Command}: {clean}");

                string pidSuffix = pidConfig.Command.Substring(2);
                string searchPattern = $"41{pidSuffix}";
                int pidIndex = clean.IndexOf(searchPattern);

                if (pidIndex == -1)
                {
                    if (clean.StartsWith("41") && clean.Length >= 4)
                    {
                        pidSuffix = clean.Substring(2, 2);
                        pidIndex = 0;
                    }
                    else
                    {
                        return $"No valid PID {pidSuffix} in response: {clean}";
                    }
                }

                int dataStartIndex = pidIndex + 4;

                if (clean.Length < dataStartIndex + 2)
                {
                    return $"Incomplete data in response: {clean}";
                }

                // Extract data bytes
                var dataBytes = new List<byte>();
                for (int i = dataStartIndex; i < clean.Length; i += 2)
                {
                    if (i + 1 < clean.Length)
                    {
                        if (int.TryParse(clean.Substring(i, 2),
                            System.Globalization.NumberStyles.HexNumber, null, out int byteValue))
                        {
                            dataBytes.Add((byte)byteValue);
                        }
                    }
                }

                // Use the configured parser
                return pidConfig.Parser(dataBytes.ToArray(), speedUnit);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing response '{response}' for PID {pidConfig.Command}: {ex.Message}");
                return pidConfig.DefaultValue;
            }
        }
        private static readonly object _serialLock = new object();
        private static DateTime _lastCommandTime = DateTime.MinValue;

        private string Query(SerialPort serial, string command)
        {
            const int maxAttempts = 2;
            int attempt = 0;

            // Get default value from configuration
            var pidConfig = ObdPidConfiguration.GetPidByCommand(command);
            string defaultValue = pidConfig?.DefaultValue ?? "N/A";


            while (attempt < maxAttempts)
            {
                try
                {
                    lock (_serialLock)
                    {
                        // Ensure minimum time between commands (100ms)
                        var timeSinceLastCommand = DateTime.Now - _lastCommandTime;
                        if (timeSinceLastCommand.TotalMilliseconds < 100)
                        {
                            Thread.Sleep(100 - (int)timeSinceLastCommand.TotalMilliseconds);
                        }

                        if (serial == null || !serial.IsOpen)
                        {
                            throw new InvalidOperationException("Serial port is not open");
                        }

                        // Clear any existing data
                        serial.DiscardInBuffer();

                        // Send the command with line ending
                        Console.WriteLine($"Sending command: {command}");
                        serial.Write($"{command}\r");
                        _lastCommandTime = DateTime.Now;

                        // Read with timeout
                        var response = new System.Text.StringBuilder();
                        var buffer = new byte[1024];
                        var startTime = DateTime.Now;
                        var timeout = TimeSpan.FromMilliseconds(500);

                        while (DateTime.Now - startTime < timeout)
                        {
                            if (serial.BytesToRead > 0)
                            {
                                int bytesRead = serial.Read(buffer, 0, Math.Min(buffer.Length, serial.BytesToRead));
                                string chunk = System.Text.Encoding.ASCII.GetString(buffer, 0, bytesRead);
                                response.Append(chunk);

                                // Check for prompt indicating end of response
                                if (response.ToString().Contains(">"))
                                {
                                    break;
                                }
                            }
                            Thread.Sleep(10);
                        }

                        // Remove prompt and clean up
                        string result = response.ToString()
                            .Replace(">", "")
                            .Replace("\r", "")
                            .Replace("\n", "")
                            .Trim();

                        if (string.IsNullOrEmpty(result))
                        {
                            throw new TimeoutException($"No response for command {command}");
                        }

                        Console.WriteLine($"Command '{command}' response: {result}");
                        return result;
                    }
                }
                catch (Exception ex) when (attempt < maxAttempts - 1)
                {
                    Console.WriteLine($"Attempt {attempt + 1} failed for command '{command}': {ex.Message}");
                    Thread.Sleep(100); // Wait a bit longer between retries
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Final attempt failed for command '{command}': {ex.Message}");
                    return defaultValue;
                }

                attempt++;
            }
            return defaultValue;
        }
    }
}