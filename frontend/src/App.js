import React, { useEffect, useState, useRef } from 'react';
import './Dashboard.css';
console.log('React app started!');

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
  

  return (
    <div className="mustang-dashboard">
      <div className="dashboard-container">
        <div className="digital-header">OBD2 DIAGNOSTIC SYSTEM</div>
        <div className="gauge-cluster">
          {Object.keys(data).length === 0 ? (
            <div className="loading-screen">INITIALIZING...</div>
          ) : (
            <>
              <div className="rpm-gauge">
                <div className="rpm-gauge-container">
                  <div 
                    className="rpm-needle" 
                    style={{ 
                      transform: `rotate(${Math.min(parseFloat(data['RPM'] || 0) / 10, 270)}deg)` 
                    }}
                  />
                  <div className="rpm-value">{Math.round(parseFloat(data['RPM'] || 0))}</div>
                  <div className="rpm-label">RPM</div>
                </div>
              </div>
              {Object.keys(data)
                .filter(key => key !== 'RPM' && key !== 'SpeedUnit')
                .map((key) => (
                  <div key={key} className="gauge-item">
                    <div className="gauge-label">{key.toUpperCase()}</div>
                    <div className="gauge-value">
                      {Math.round(parseFloat(data[key] || 0))}
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </div>
        <div className="speed-toggle" onClick={toggleSpeedUnit}>
          TOGGLE: {speedUnit}
        </div>
        <div className="digital-footer">
          <div className="status-bar">SYSTEM: ONLINE</div>
        </div>
      </div>
    </div>
  );
}

export default App;
