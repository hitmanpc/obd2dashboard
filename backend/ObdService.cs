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
                serial.Write("ATI\r");
                Thread.Sleep(2000);
                var response = serial.ReadExisting();
                Console.WriteLine($"Response: {response}");
                if (string.IsNullOrEmpty(response))
                {
                    Console.WriteLine("No response from ELM327.");
                    serial.Close();
                    return false;
                }
                Console.WriteLine("Checking for ELM327...");
                if (response.Contains("ELM327", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
                serial.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to connect to {portName}: {ex.Message}");
            }

            serial = null!;
            return false;
        }

        public void InitElm(SerialPort serial)
        {
            Send(serial, "ATZ");
            Send(serial, "ATE0");
            Send(serial, "ATL0");
            Send(serial, "ATS0");
            Send(serial, "ATH0");
        }

        private void Send(SerialPort serial, string command)
        {
            serial.WriteLine(command + "\r");
            Thread.Sleep(100);
            serial.ReadExisting();
        }

        public string QueryLiveData(SerialPort serial)
        {
            var results = new Dictionary<string, string>
            {
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["rpm"] = ParseRpm(Query(serial, "010C")),
                ["speed"] = ParseSpeed(Query(serial, "010D")),
                ["throttle"] = ParseThrottle(Query(serial, "0111")),
                ["coolant"] = ParseCoolant(Query(serial, "0105"))
            };

            return JsonSerializer.Serialize(results);
        }

        private string ParseRpm(string response)
        {
            var bytes = GetBytesFromResponse(response);
            if (bytes.Length >= 2)
            {
                int value = ((bytes[0] * 256) + bytes[1]) / 4;
                return value.ToString();
            }
            return "N/A";
        }

        private string ParseSpeed(string response)
        {
            var bytes = GetBytesFromResponse(response);
            if (bytes.Length >= 1)
                return bytes[0].ToString();
            return "N/A";
        }

        private string ParseThrottle(string response)
        {
            var bytes = GetBytesFromResponse(response);
            if (bytes.Length >= 1)
                return Math.Round((bytes[0] / 255.0) * 100, 1).ToString() + "%";
            return "N/A";
        }

        private string ParseCoolant(string response)
        {
            var bytes = GetBytesFromResponse(response);
            if (bytes.Length >= 1)
                return (bytes[0] - 40).ToString() + "°C";
            return "N/A";
        }

        private byte[] GetBytesFromResponse(string response)
        {
            var hex = response.Replace("\r", "").Replace("\n", "").Replace(" ", "");
            if (hex.StartsWith("41"))
                hex = hex.Substring(4); // Remove "41 XX"
            var bytes = new List<byte>();
            for (int i = 0; i < hex.Length - 1; i += 2)
            {
                if (byte.TryParse(hex.Substring(i, 2), System.Globalization.NumberStyles.HexNumber, null, out byte b))
                    bytes.Add(b);
            }
            return bytes.ToArray();
        }

        private string Query(SerialPort serial, string command)
        {
            serial.WriteLine(command + "\r");
            Thread.Sleep(100);
            return serial.ReadExisting();
        }
    }
}