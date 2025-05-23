# 🚗 OBD2 Dashboard

## 📋 Overview

**OBD2 Dashboard** is a simple vehicle monitoring application that provides real-time insights into your vehicle's performance using OBD2 data.

## ✨ Features

- 📊 Real-time vehicle diagnostics
- 🖥️ Interactive dashboard with key performance metrics
- 🔧 Support for OBD2 emulation and data retrieval

## 🛠️ Prerequisites

- ![Python](https://img.shields.io/badge/Python-3.8+-blue)
- ![Node.js](https://img.shields.io/badge/Node.js-14+-green)
- ![React](https://img.shields.io/badge/React-16+-lightblue)
- [![OBD2 Emulator](https://img.shields.io/badge/ELM327-emulator-blue)](https://github.com/Ircama/ELM327-emulator)

## 📦 Setup and Installation

### Docker Compose (docker-compose.override.yml exists)

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

<!-- ## 📄 License

*[Specify your project's license]* -->

## 📞 Contact

don@donbowman.info

---

**Built with ❤️ for car enthusiasts and developers**