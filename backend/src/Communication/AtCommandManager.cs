using System;
using System.IO.Ports;
using System.Threading;
using ObdDashboard.Commands;

namespace ObdDashboard.Communication
{
    /// <summary>
    /// Manages AT commands for ELM327 OBD-II adapter communication.
    /// Provides thread-safe command execution with proper timing and error handling.
    /// </summary>
    /// <remarks>
    /// This class handles all AT command communication with ELM327 adapters including:
    /// - Initialization sequences
    /// - Connection testing
    /// - Command execution with retry logic
    /// - Response parsing and validation
    /// 
    /// Note: All commands are executed with a minimum 100ms interval to prevent
    /// overwhelming the adapter.
    /// </remarks>
    public class AtCommandManager
    {
        private static readonly object _serialLock = new object();
        private static DateTime _lastCommandTime = DateTime.MinValue;
        private const int MinCommandInterval = 100; // milliseconds
        private const int DefaultTimeout = 1000; // milliseconds

        /// <summary>
        /// Sends an AT command to the ELM327 adapter
        /// </summary>
        /// <param name="serial">Serial port connection</param>
        /// <param name="command">AT command to send</param>
        /// <param name="timeout">Timeout in milliseconds</param>
        /// <returns>Command result with success status and response</returns>
        public AtCommandResult SendCommand(SerialPort serial, string command, int timeout = DefaultTimeout)
        {
            var result = new AtCommandResult();

            try
            {
                lock (_serialLock)
                {
                    // Ensure minimum time between commands
                    EnsureCommandInterval();

                    if (serial == null || !serial.IsOpen)
                    {
                        result.ErrorMessage = "Serial port is not open";
                        return result;
                    }

                    // Clear any existing data
                    serial.DiscardInBuffer();

                    // Send the command with line ending
                    Console.WriteLine($"Sending AT command: {command}");
                    serial.Write($"{command}\r");
                    _lastCommandTime = DateTime.Now;

                    // Read response with timeout
                    var response = ReadResponse(serial, timeout);
                    
                    if (string.IsNullOrEmpty(response))
                    {
                        result.ErrorMessage = $"No response for command {command}";
                        return result;
                    }

                    // Clean up response
                    result.Response = CleanResponse(response);
                    result.Success = !result.Response.Contains("?") && !string.IsNullOrEmpty(result.Response);
                    
                    if (!result.Success && result.Response.Contains("?"))
                    {
                        result.ErrorMessage = $"Command '{command}' returned error: {result.Response}";
                    }

                    Console.WriteLine($"AT command '{command}' response: {result.Response}");
                    return result;
                }
            }
            catch (Exception ex)
            {
                result.ErrorMessage = $"Error sending command '{command}': {ex.Message}";
                Console.WriteLine(result.ErrorMessage);
                return result;
            }
        }

        /// <summary>
        /// Initializes the ELM327 adapter with standard configuration
        /// </summary>
        /// <param name="serial">Serial port connection</param>
        /// <returns>True if initialization was successful</returns>
        public bool InitializeElm327(SerialPort serial)
        {
            try
            {
                Console.WriteLine("Initializing ELM327 with AT commands...");

                // Reset the adapter
                var resetResult = SendCommand(serial, AtCommands.Reset, 2000);
                if (!resetResult.Success || !resetResult.Response.Contains("ELM327"))
                {
                    Console.WriteLine("Warning: ELM327 not detected after reset");
                    return false;
                }

                // Configure adapter settings
                var initCommands = new[]
                {
                    AtCommands.EchoOff,      // Echo off
                    AtCommands.LinefeedsOff, // Linefeeds off
                    AtCommands.SpacesOff,    // Spaces off
                    AtCommands.HeadersOff,   // Headers off
                    AtCommands.ProtocolAuto  // Set protocol to automatic
                };

                foreach (var command in initCommands)
                {
                    var result = SendCommand(serial, command);
                    if (!result.Success)
                    {
                        Console.WriteLine($"Warning: Failed to execute command {command}: {result.ErrorMessage}");
                        return false;
                    }
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

        /// <summary>
        /// Tests connection to ELM327 adapter using ATI command
        /// </summary>
        /// <param name="serial">Serial port connection</param>
        /// <returns>True if ELM327 is detected</returns>
        public bool TestConnection(SerialPort serial)
        {
            var result = SendCommand(serial, AtCommands.Identity, 1000);
            return result.Success && result.Response.IndexOf("ELM327", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        /// <summary>
        /// Gets the adapter voltage
        /// </summary>
        /// <param name="serial">Serial port connection</param>
        /// <returns>Voltage reading or null if failed</returns>
        public string? GetVoltage(SerialPort serial)
        {
            var result = SendCommand(serial, AtCommands.Voltage);
            return result.Success ? result.Response : null;
        }

        /// <summary>
        /// Gets the current protocol description
        /// </summary>
        /// <param name="serial">Serial port connection</param>
        /// <returns>Protocol description or null if failed</returns>
        public string? GetProtocol(SerialPort serial)
        {
            var result = SendCommand(serial, AtCommands.DescribeProtocol);
            return result.Success ? result.Response : null;
        }

        private void EnsureCommandInterval()
        {
            var timeSinceLastCommand = DateTime.Now - _lastCommandTime;
            if (timeSinceLastCommand.TotalMilliseconds < MinCommandInterval)
            {
                Thread.Sleep(MinCommandInterval - (int)timeSinceLastCommand.TotalMilliseconds);
            }
        }

        private string ReadResponse(SerialPort serial, int timeout)
        {
            var response = new System.Text.StringBuilder();
            var buffer = new byte[1024];
            var startTime = DateTime.Now;
            var timeoutSpan = TimeSpan.FromMilliseconds(timeout);

            while (DateTime.Now - startTime < timeoutSpan)
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

            return response.ToString();
        }

        private string CleanResponse(string response)
        {
            return response
                .Replace(">", "")
                .Replace("\r", "")
                .Replace("\n", "")
                .Trim();
        }
    }
}