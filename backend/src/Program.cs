using System.Net.WebSockets;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using System;
using System.IO.Ports;
using ObdDashboard.Services;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Shared OBD service and serial port
var obdService = new ObdService();
SerialPort serialPort = null;
bool isInitialized = false;
object initializationLock = new object();

async Task InitializeObdConnection()
{
    if (isInitialized) return;
    
    // Use a semaphore to ensure thread safety
    await Task.Run(() =>
    {
        lock (initializationLock)
        {
            if (isInitialized) return;
            
            Console.WriteLine("Initializing OBD connection...");
            var portName = Environment.GetEnvironmentVariable("OBD_PORT") ?? "/virtual/usb1";
            
            if (!obdService.TryConnect(portName, out var serial))
            {
                throw new Exception("Failed to connect to ELM327");
            }
            
            if (!obdService.InitElm(serial))
            {
                serial.Close();
                throw new Exception("Failed to initialize ELM327");
            }
            
            serialPort = serial;
            isInitialized = true;
            Console.WriteLine("OBD connection initialized successfully");
        }
    });
}

app.UseWebSockets();

app.Map("/ws", async context =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    try
    {
        await InitializeObdConnection();
        
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("WebSocket connection established");

        while (webSocket.State == WebSocketState.Open && serialPort?.IsOpen == true)
        {
            try
            {
                var data = obdService.QueryLiveData(serialPort);
                await WebSocketService.Send(webSocket, data);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error querying data: {ex.Message}");
                await WebSocketService.Send(webSocket, $"Error: {ex.Message}");
                break;
            }
            await Task.Delay(500);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"WebSocket error: {ex.Message}");
    }
    finally
    {
        Console.WriteLine("WebSocket connection closed");
    }
});

// Cleanup on application shutdown
app.Lifetime.ApplicationStopping.Register(() =>
{
    if (serialPort?.IsOpen == true)
    {
        serialPort.Close();
        Console.WriteLine("Serial port closed on application shutdown");
    }
});

app.Run("http://0.0.0.0:8000");