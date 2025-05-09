# 🚗 OBD2 Dashboard

## 📋 Overview

**OBD2 Dashboard** is a comprehensive vehicle diagnostic and monitoring application that provides real-time insights into your vehicle's performance using OBD2 (On-Board Diagnostics) data.

## ✨ Features

- 📊 Real-time vehicle diagnostics
- 🖥️ Interactive dashboard with key performance metrics
- 🔧 Support for OBD2 emulation and data retrieval

## 🛠️ Prerequisites

- ![Python](https://img.shields.io/badge/Python-3.8+-blue)
- ![Node.js](https://img.shields.io/badge/Node.js-14+-green)
- ![React](https://img.shields.io/badge/React-16+-lightblue)
- OBD2 Emulator

## 📦 Setup and Installation

### Backend (Python)

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Create a virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

### Frontend (React)

1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Start OBD2 Emulator

Before starting the application, start the OBD2 emulator:
```bash
bin/python -m elm -n 35000 --daemon
```

### Backend Server

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Start the Python server
   ```bash
   python server.py
   ```

### Frontend Development Server

1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Start the React development server
   ```bash
   npm start
   ```

## 🔧 Configuration

- Modify `backend/config.py` for backend settings
- Update `frontend/.env` for frontend configuration

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

*[Specify your project's license]*

## 📞 Contact

*[Your contact information or project maintainer details]*

---

**Built with ❤️ for car enthusiasts and developers**