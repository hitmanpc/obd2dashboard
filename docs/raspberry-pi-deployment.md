# 🚀 Manual Raspberry Pi Deployment Guide

This guide will help you deploy the OBD2 Dashboard manually on your Raspberry Pi.

## 📋 Prerequisites

### 1. Raspberry Pi Setup
- Raspberry Pi 4 (recommended) or Pi 3B+
- Raspberry Pi OS (32-bit or 64-bit)
- SSH enabled (for remote access)
- Internet connection

### 2. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo pip3 install docker-compose

# Reboot to apply group changes
sudo reboot
```

### 3. Verify Installation
```bash
# After reboot, verify Docker is working
docker --version
docker-compose --version
```

## 🔌 Hardware Setup

### OBD2 Adapter Connection
1. **USB OBD2 Adapter**: Connect to any USB port
   - Device will appear as `/dev/ttyUSB0` (most common)
   - Check with: `ls /dev/ttyUSB*`

2. **GPIO UART Connection** (advanced):
   - Device will appear as `/dev/serial0` or `/dev/ttyAMA0`
   - Requires enabling UART in `/boot/config.txt`

## 🚀 Deployment Steps

### 1. Download Deployment Script
```bash
# Create project directory
mkdir -p ~/obd2dashboard
cd ~/obd2dashboard

# Download the deployment script
wget https://raw.githubusercontent.com/hitmanpc/obd2dashboard/main/deploy-pi.sh
chmod +x deploy-pi.sh
```

### 2. Run Deployment
```bash
# Deploy the application
./deploy-pi.sh
```

### 3. Check OBD2 Device
```bash
# Find your OBD2 adapter
ls /dev/ttyUSB* /dev/serial* 2>/dev/null

# If using different device, edit docker-compose.yml
nano docker-compose.yml
# Change the device mapping: "/dev/ttyUSB0:/dev/ttyUSB0"
```

### 4. Access Your Dashboard
- **Frontend**: `http://[Pi-IP]:3000`
- **Backend**: `http://[Pi-IP]:8000`
- **Find Pi IP**: `hostname -I`

## 🔧 Manual Commands

### Start Services
```bash
cd ~/obd2dashboard
docker-compose up -d
```

### Stop Services
```bash
cd ~/obd2dashboard
docker-compose down
```

### View Logs
```bash
cd ~/obd2dashboard
docker-compose logs -f
```

### Update Application
```bash
cd ~/obd2dashboard
./deploy-pi.sh
```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Denied on OBD2 Device**
   ```bash
   sudo chmod 666 /dev/ttyUSB0
   # Or add user to dialout group
   sudo usermod -aG dialout $USER
   ```

2. **Docker Permission Denied**
   ```bash
   sudo usermod -aG docker $USER
   sudo reboot
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :8000
   ```

4. **Can't Connect to OBD2 Adapter**
   - Check device exists: `ls /dev/ttyUSB*`
   - Verify adapter compatibility
   - Try different USB ports

### Check Service Status
```bash
# View running containers
docker ps

# Check container logs
docker logs obd_backend
docker logs react_frontend

# Restart specific service
docker-compose restart obd_backend
```

## 📱 Remote Access

### Access from Phone/Computer
1. **Find Pi IP**: `hostname -I` on Pi
2. **Connect**: `http://192.168.1.XXX:3000` (replace with actual IP)
3. **Make Static**: Set static IP in router settings

### Port Forwarding (Optional)
To access from outside your network:
1. Router settings → Port Forwarding
2. Forward external port 8080 → Pi IP:3000
3. Access via: `http://[external-ip]:8080`

## 🔄 Updates

### Manual Update Process
```bash
cd ~/obd2dashboard
./deploy-pi.sh  # This will pull latest code and images
```

### Check for Updates
```bash
cd ~/obd2dashboard
git remote -v  # Shows repository URL
git log --oneline -5  # Shows recent commits
```

## 📊 Monitoring

### System Resources
```bash
# Check CPU/Memory usage
htop

# Check disk space
df -h

# Check Docker resource usage
docker stats
```

### Application Health
```bash
# Test frontend
curl http://localhost:3000

# Test backend (if health endpoint exists)
curl http://localhost:8000/health

# Check if ports are listening
netstat -tlnp | grep :3000
netstat -tlnp | grep :8000
```

---

**Need help?** Create an issue on GitHub: https://github.com/hitmanpc/obd2dashboard/issues