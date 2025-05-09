import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware


HOST = 'host.docker.internal'
PORT = 35000

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 FastAPI app initialized.")

tcp_lock = asyncio.Lock()
tcp_reader = None
tcp_writer = None

print("🚀 FastAPI app initialized.")

@app.on_event("startup")
async def startup_event():
    print("✅ FastAPI startup event fired.")

print("✅ Routes mounted:", app.routes)

async def ensure_tcp_connection():
    global tcp_reader, tcp_writer
    try:
        # Test if connection is alive by sending a simple command
        tcp_writer.write(b'\r')
        await tcp_writer.drain()
    except:
        print("TCP connection lost. Reconnecting...")
        tcp_reader, tcp_writer = await asyncio.open_connection(HOST, PORT)
        print("Reconnected to emulator.")

async def send_obd_command_tcp(cmd: str) -> str:
    async with tcp_lock:
        try:
            await ensure_tcp_connection()
            tcp_writer.write((cmd + "\r").encode())
            await tcp_writer.drain()
            await asyncio.sleep(0.1)
            response = await tcp_reader.read(1024)
            return response.decode(errors='ignore').strip()
        except Exception as e:
            print(f"Error during OBD command: {e}")
            return "Error"

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected.")
    try:
        while True:
            print("Sending OBD commands...")
            rpm_raw = await send_obd_command_tcp("010C")  # Engine RPM
            speed_raw = await send_obd_command_tcp("010D")  # Vehicle Speed
            throttle_raw = await send_obd_command_tcp("0111")  # Throttle Position
            coolant_raw = await send_obd_command_tcp("0105")  # Coolant Temp

            payload = {
                "RPM": parse_obd_response(rpm_raw, "010C"),
                "Speed": parse_obd_response(speed_raw, "010D"),
                "Throttle": parse_obd_response(throttle_raw, "0111"),
                "Coolant Temp": parse_obd_response(coolant_raw, "0105"),
            }
            print(f"Sending data: {payload}")
            await websocket.send_json(payload)

            await asyncio.sleep(0.5)
    except Exception as e:
        print(f"WebSocket closed or error: {e}")
    finally:
        print("WebSocket disconnected.")


def parse_obd_response(response: str, pid: str):
    """
    Parses a hex OBD-II response and returns a human-readable value.
    """
    try:
        # Clean up the response:
        clean = response.replace('\r', ' ').replace('\n', ' ').replace('>', ' ').strip()
        print(f"Parsing cleaned response for {pid}: {clean}")
        
        # Split by spaces:
        parts = [p for p in clean.split(' ') if p]

        # Look for the actual data frame (usually starts with '41 XX')
        data_start_index = None
        for i in range(len(parts) - 1):
            if parts[i] == '41' and parts[i + 1] == pid[2:]:
                data_start_index = i
                break

        if data_start_index is None:
            return f"No valid data: {clean}"

        # Get bytes after '41 XX'
        A = int(parts[data_start_index + 2], 16)
        
        if pid == "010C":  # RPM needs A and B
            B = int(parts[data_start_index + 3], 16)
            rpm = ((A * 256) + B) / 4
            return f"{rpm:.0f} RPM"
        
        elif pid == "010D":  # Speed
            return f"{A} km/h"
        
        elif pid == "0111":  # Throttle Position
            throttle = (A * 100) / 255
            return f"{throttle:.1f}%"
        
        elif pid == "0105":  # Coolant Temp
            temp = A - 40
            return f"{temp} °C"
        
        else:
            return f"Raw: {clean}"

    except Exception as e:
        print(f"Failed to parse PID {pid}: {e}")
        return f"Parse error: {response}"


print(f"✅ Loaded FastAPI app: {app}")