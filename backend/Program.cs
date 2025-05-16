using ObdDashboard;
using System.Net.WebSockets;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using System;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

app.Map("/ws", async context =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
    var obdService = new ObdService();

    var portName = Environment.GetEnvironmentVariable("OBD_PORT") ?? "/dev/ttyUSB0";

    if (!obdService.TryConnect(portName, out var serial))
    {
        await WebSocketHandler.Send(webSocket, "ELM327 not found.");
        return;
    }

    obdService.InitElm(serial);

    while (webSocket.State == WebSocketState.Open)
    {
        var data = obdService.QueryLiveData(serial);
        await WebSocketHandler.Send(webSocket, data);
        await Task.Delay(500);
    }

    serial.Close();
});

app.Run("http://0.0.0.0:8000");