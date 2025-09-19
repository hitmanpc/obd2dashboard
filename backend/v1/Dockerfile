FROM python:3.13-slim-bullseye

RUN apt-get update && apt-get install -y \
    python3-dev \
    libbluetooth-dev \
    bluetooth \
    usbutils \
    socat \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Start socat + server
#CMD ["sh", "-c", "socat pty,link=/tmp/obd2tcp,raw tcp:host.docker.internal:35000 & uvicorn server:app --host 0.0.0.0 --port 8000; wait"]
#CMD ["sh", "-c", "socat pty,link=/tmp/obd2tcp,raw tcp:host.docker.internal:35000 & python -m uvicorn server:app --host 0.0.0.0 --port 8000 --log-level debug; wait"]
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]