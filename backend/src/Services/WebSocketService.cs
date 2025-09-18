using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ObdDashboard.Services
{
    public static class WebSocketService
    {
        public static async Task Send(WebSocket socket, string message)
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}