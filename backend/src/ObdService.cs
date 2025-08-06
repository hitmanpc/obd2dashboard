using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Text.Json;
using System.Threading;

namespace ObdDashboard
{
    public class ObdService
    {
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
                Console.WriteLine("Sending ELM327 initialization command...");
                
                // Send ATI command and read response with retries
                serial.DiscardInBuffer();
                
                // Send command with line ending
                serial.Write("ATI\r");
                
                // Give it time to respond
                Thread.Sleep(500);
                
                // Read all available data
                var rawResponse = serial.ReadExisting();
                Console.WriteLine($"Raw ATI response bytes: {BitConverter.ToString(System.Text.Encoding.ASCII.GetBytes(rawResponse))}");
                
                // Try to read more data if we don't see the full response
                if (!rawResponse.Contains("ELM327"))
                {
                    Thread.Sleep(200);
                    rawResponse += serial.ReadExisting();
                    Console.WriteLine($"Additional data: {BitConverter.ToString(System.Text.Encoding.ASCII.GetBytes(rawResponse))}");
                }
                
                // Check if we got any response at all
                if (string.IsNullOrWhiteSpace(rawResponse))
                {
                    Console.WriteLine("No response from ELM327.");
                    serial.Close();
                    return false;
                }
                
                Console.WriteLine($"Full raw response: '{rawResponse}'");
                
                // Check for ELM327 in the response
                if (rawResponse.IndexOf("ELM327", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    Console.WriteLine("ELM327 detected successfully");
                    return true;
                }
                
                Console.WriteLine($"ELM327 not found in response. Response was: '{rawResponse}'");
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
            try
            {
                Console.WriteLine("Initializing ELM327...");
                
                // Reset the adapter
                var resetResponse = Send(serial, "ATZ");
                if (!resetResponse.Contains("ELM327"))
                {
                    Console.WriteLine("Warning: ELM327 not detected after reset");
                    return false;
                }
                
                // Configure adapter settings
                var commands = new[]
                {
                    "ATE0",  // Echo off
                    "ATL0",  // Linefeeds off
                    "ATS0",  // Spaces off
                    "ATH0"   // Headers off
                    // Remove ATS0 to keep spaces in responses for better compatibility
                };
                
                foreach (var cmd in commands)
                {
                    var response = Send(serial, cmd);
                    if (response.Contains("?"))
                    {
                        Console.WriteLine($"Warning: Command {cmd} returned an error");
                        return false;
                    }
                }
                
                // Set protocol to automatic
                var protocolResponse = Send(serial, "ATSP0");
                if (protocolResponse.Contains("?"))
                {
                    Console.WriteLine("Warning: Failed to set protocol");
                    return false;
                }
                
                Console.WriteLine("ELM327 initialization complete");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing ELM327: {ex.Message}");
                return false;
            }
        }

        private string Send(SerialPort serial, string command)
        {
            try
            {
                // Clear any existing data in the buffer
                serial.DiscardInBuffer();
                
                // Send the command with line ending
                Console.WriteLine($"Sending command: {command}");
                serial.Write($"{command}\r");
                
                // Give it time to respond
                Thread.Sleep(200);
                
                // Read the response
                string response = "";
                var startTime = DateTime.Now;
                
                // Keep reading until we get a prompt or timeout
                while ((DateTime.Now - startTime).TotalMilliseconds < 1000)
                {
                    if (serial.BytesToRead > 0)
                    {
                        response += serial.ReadExisting();
                        if (response.Contains(">"))
                        {
                            break;
                        }
                    }
                    Thread.Sleep(50);
                }
                
                // Read any remaining data
                response += serial.ReadExisting();
                
                Console.WriteLine($"Command '{command}' response: '{response.Replace("\r", "\\r").Replace("\n", "\\n")}'");
                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending command '{command}': {ex.Message}");
                throw;
            }
        }

        public string QueryLiveData(SerialPort serial, string speedUnit = "km/h")
        {
            var results = new Dictionary<string, string>
            {
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["SpeedUnit"] = speedUnit
            };

            // Query each PID with error handling
            try { results["RPM"] = ParseObdResponse(Query(serial, "010C"), "010C"); } catch (Exception ex) { results["RPM"] = $"Error: {ex.Message}"; }
            try { results["Speed"] = ParseObdResponse(Query(serial, "010D"), "010D", speedUnit); } catch (Exception ex) { results["Speed"] = $"Error: {ex.Message}"; }
            try { results["Throttle"] = ParseObdResponse(Query(serial, "0111"), "0111"); } catch (Exception ex) { results["Throttle"] = $"Error: {ex.Message}"; }
            try { results["CoolantTemp"] = ParseObdResponse(Query(serial, "0105"), "0105"); } catch (Exception ex) { results["CoolantTemp"] = $"Error: {ex.Message}"; }
            // try { results["EngineLoad"] = ParseObdResponse(Query(serial, "0104"), "0104"); } catch (Exception ex) { results["EngineLoad"] = $"Error: {ex.Message}"; }
            // try { results["IntakeTemp"] = ParseObdResponse(Query(serial, "010F"), "010F"); } catch (Exception ex) { results["IntakeTemp"] = $"Error: {ex.Message}"; }
            // try { results["MAF"] = ParseObdResponse(Query(serial, "0110"), "0110"); } catch (Exception ex) { results["MAF"] = $"Error: {ex.Message}"; }

            return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
        }

        private string ParseObdResponse(string response, string pid, string speedUnit = "km/h")
        {
            try
            {
                // Clean up the response - remove whitespace and control characters
                var clean = response.Trim().ToUpper()
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .Replace(">", "")
                    .Replace(" ", ""); // Remove all spaces for consistent processing
                
                // Handle ATI (adapter identification) command
                if (pid == "ATI")
                {
                    return clean;
                }

                Console.WriteLine($"Parsing cleaned response for {pid}: {clean}");
                
                // The PID we're looking for in the response (e.g., "0C" for RPM)
                string pidSuffix = pid.Substring(2);
                
                // Look for the pattern 41[pidSuffix] in the response
                string searchPattern = $"41{pidSuffix}";
                int pidIndex = clean.IndexOf(searchPattern);
                
                if (pidIndex == -1)
                {
                    // If we can't find the exact PID, try to parse any valid response
                    if (clean.StartsWith("41") && clean.Length >= 4)
                    {
                        // If it's a valid OBD response but not the PID we asked for, try to parse it anyway
                        pidSuffix = clean.Substring(2, 2);
                        pidIndex = 0;
                    }
                    else
                    {
                        return $"No valid PID {pidSuffix} in response: {clean}";
                    }
                }
                
                // Calculate where the data starts (after the 41[pidSuffix])
                int dataStartIndex = pidIndex + 4; // 41 + 2 chars for PID
                
                // Make sure we have enough data
                if (clean.Length < dataStartIndex + 2)
                {
                    return $"Incomplete data in response: {clean}";
                }
                
                // Parse the first data byte
                if (!int.TryParse(clean.Substring(dataStartIndex, 2), 
                    System.Globalization.NumberStyles.HexNumber, null, out int A))
                {
                    return $"Invalid data format in response: {clean}";
                }

                // Process based on PID
                switch (pid)
                {
                    case "010C": // RPM needs A and B
                        if (clean.Length < dataStartIndex + 4)
                        {
                            return $"Incomplete RPM data: {clean}";
                        }
                        
                        if (!int.TryParse(clean.Substring(dataStartIndex + 2, 2), 
                            System.Globalization.NumberStyles.HexNumber, null, out int B))
                        {
                            return $"Invalid RPM data: {clean}";
                        }
                        
                        int rpm = (int)Math.Round(((A * 256) + B) / 4.0);
                        return rpm.ToString();
                        
                    case "010D": // Speed
                        if (speedUnit == "mph")
                        {
                            double mph = Math.Round(A * 0.621371, 1);
                            return $"{mph}";
                        }
                        return A.ToString();
                        
                    case "0111": // Throttle Position
                        double throttle = (A * 100.0) / 255.0;
                        return $"{throttle:F1}%";
                        
                    case "0105": // Coolant Temp
                        int temp = A - 40;
                        return $"{temp} °C";
                        
                    default:
                        return $"Raw: {clean}";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing response '{response}' for PID {pid}: {ex.Message}");
                return $"Error: {ex.Message}";
            }
        }

        private static readonly object _serialLock = new object();
        private static DateTime _lastCommandTime = DateTime.MinValue;
        
        private string Query(SerialPort serial, string command)
        {
            const int maxAttempts = 2;
            int attempt = 0;
            
            // Default return values for known PIDs
            var defaultValues = new Dictionary<string, string>
            {
                { "010C", "0" },    // RPM
                { "010D", "0" },    // Speed
                { "0105", "0" },    // Coolant Temp
                { "0111", "0%" }    // Throttle Position
            };
            
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
                    if (defaultValues.TryGetValue(command, out string defaultValue))
                    {
                        return defaultValue;
                    }
                    return "N/A";
                }
                
                attempt++;
            }
            
            // If we get here, all attempts failed
            if (defaultValues.TryGetValue(command, out string defaultVal))
            {
                return defaultVal;
            }
            return "N/A";
        }
    }
}