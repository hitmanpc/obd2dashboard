import React, { useEffect, useState, useRef } from 'react';
import './Dashboard.css';
console.log('React app started!');

// Utility function to determine gear and color zones
const getGaugeInfo = (rpm) => {
  if (rpm < 1000) return { gear: 'N', color: '#4CAF50', zone: 'idle' };
  if (rpm < 2500) return { gear: '1-2', color: '#2196F3', zone: 'normal' };
  if (rpm < 4000) return { gear: '3-4', color: '#FFC107', zone: 'mid' };
  if (rpm < 5500) return { gear: '5', color: '#FF5722', zone: 'high' };
  return { gear: '6', color: '#F44336', zone: 'redline' };
};

function App() {
  const [data, setData] = useState({});
  const [speedUnit, setSpeedUnit] = useState('km/h');

  const toggleSpeedUnit = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send('toggle_speed_unit');
      console.log('Sent toggle_speed_unit to backend');
    } else {
      console.warn('WebSocket not open, cannot toggle speed unit');
    }
  };

  const ws = useRef(null);

  useEffect(() => {
    // Dynamically determine WebSocket URL
    const getWebSocketUrl = () => {
      // Check if running in Docker or on host
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'ws://localhost:8000/ws';
      } else {
        return 'ws://obd_backend:8000/ws';
      }
    };

    const wsUrl = getWebSocketUrl();
    console.log('Connecting to WebSocket:', wsUrl);
    ws.current = new WebSocket(wsUrl);
  
    ws.current.onopen = () => {
      console.log('WebSocket opened!');
    };
  
    ws.current.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData(newData);
        // Update speed unit from server
        if (newData.SpeedUnit) {
          setSpeedUnit(newData.SpeedUnit);
        }
      } catch (e) {
        console.error('Failed to parse message:', event.data);
      }
    };
  
    ws.current.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };
  
    ws.current.onclose = () => {
      console.log('WebSocket closed');
      // Optional: attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        ws.current = new WebSocket(wsUrl);
      }, 3000);
    };
  
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);  // ✅ Ensure the dependency array is EMPTY
  

  const rpmValue = Math.round(parseFloat(data['RPM'] || 0));
    const gaugeInfo = getGaugeInfo(rpmValue);

    return (
      <div className="car-dashboard">
        <div className="dashboard-grid">
          <div className="rpm-section">
            <svg viewBox="0 0 200 200" className="rpm-gauge">
              <path
                d="M100 20 A80 80 0 1 1 20 100"
                fill="none"
                stroke="#333"
                strokeWidth="20"
              />
              <path
                d="M100 20 A80 80 0 0 1 180 100"
                fill="none"
                stroke={gaugeInfo.color}
                strokeWidth="20"
                strokeDasharray={`${(rpmValue / 6000) * 251.33}, 251.33`}
              />
              <text x="100" y="100" textAnchor="middle" className="rpm-text">
                {rpmValue}
              </text>
              <text x="100" y="130" textAnchor="middle" className="gear-text">
                {gaugeInfo.gear}
              </text>
            </svg>
          </div>
          <div className="info-section">
            {Object.keys(data)
              .filter(key => key !== 'RPM' && key !== 'SpeedUnit')
              .map((key) => (
                <div key={key} className="info-item">
                  <div className="info-label">{key.toUpperCase()}</div>
                  <div className="info-value">
                    {Math.round(parseFloat(data[key] || 0))}
                  </div>
                </div>
              ))
            }
          </div>
          <div className="controls-section">
            <div className="speed-toggle" onClick={toggleSpeedUnit}>
              SPEED UNIT: {speedUnit}
            </div>
            <div className="system-status">
              SYSTEM: {Object.keys(data).length > 0 ? 'ONLINE' : 'INITIALIZING'}
            </div>
          </div>
        </div>
      </div>
    );
}

export default App;
