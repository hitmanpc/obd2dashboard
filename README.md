# 🚗 OBD2 Dashboard

## 📋 Overview

**OBD2 Dashboard** is a simple vehicle monitoring application that provides real-time insights into your vehicle's performance using OBD2 data.

## ✨ Features

- 📊 Real-time vehicle diagnostics
- 🖥️ Interactive dashboard with key performance metrics
- 🔧 Support for OBD2 emulation and data retrieval

## 🛠️ Prerequisites

- ![C#](https://img.shields.io/badge/.NET-8.0+-purple)  
- ![Python](https://img.shields.io/badge/Python-3.8+-blue)
- ![Node.js](https://img.shields.io/badge/Node.js-14+-green)
- ![React](https://img.shields.io/badge/React-16+-lightblue)
- [![OBD2 Emulator](https://img.shields.io/badge/ELM327-emulator-blue)](https://github.com/Ircama/ELM327-emulator)
- [socat](http://www.dest-unreach.org/socat/) (for virtual serial port emulation, required by `emulator/tcp2UsbScript.sh`)
- bash shell (for running `emulator/tcp2UsbScript.sh`)
- Docker & Docker Compose (for containerized setup)

## 📦 Setup and Installation

### Docker Compose (docker-compose.override.yml)

```bash
docker-compose up --build -d
```

### Docker Compose Down

```bash
docker-compose down
```

## 🚀 Running the Emulator outside of docker (aka on host machine)
### Start OBD2 Emulator

Before starting the application, start the OBD2 emulator:
```bash
bin/python -m elm -n 35000 --daemon
```
should see "ELM327-emulator daemon service STARTED on  /dev/pts/<x>" where <x> is a number.
to see the process running:
```bash
ps aux | grep elm
```

kill the process:
```bash
kill <x> where <x> is the number of the pid
```

### Verify backend is running

Open your browser and navigate to:
 http://localhost:8000/docs

### Verify frontend is running

Open your browser and navigate to:
 http://localhost:3000

you should see something like this:
![image](/docs/images/GaugeScreenshot.png)

## 🚀 Running the Emulator with Virtual Serial Port (tcp2UsbScript.sh) **Alpha, Not really tested yet **

To start the OBD2 emulator and create a virtual serial port using socat, run the following script:

```bash
cd emulator
./tcp2UsbScript.sh
```

- This script will:
  - Start the ELM327 emulator as a background daemon on TCP port 35000.
  - Create a virtual serial port at `/virtual/usb1` mapped to the emulator using socat.
  - Monitor and automatically restart the emulator if it stops.
  - Clean up processes on exit.

You should see output indicating both the emulator and socat are running, and the virtual serial port is available.

## 🔧 Configuration

- Modify `backend/server.py` for backend logic
- Modify `frontend/src/App.js` for frontend logic and UI

## 🛠️ Troubleshooting

- ❗ Ensure the OBD2 emulator is running before starting the application
- ❗ Check that all dependencies are correctly installed
- ❗ Verify Python and Node.js versions meet the minimum requirements

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💾 Commit your changes
4. 📤 Push to the branch
5. 🔀 Create a Pull Request

## 📄 License

This project is licensed under the [MIT License](./LICENSE). You are free to use, modify, and distribute this software, provided you give appropriate credit.

## 📞 Contact

don@donbowman.info

---

**Built with ❤️ for car enthusiasts and developers**