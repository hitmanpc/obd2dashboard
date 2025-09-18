import { useEffect, useRef, useState } from 'react';

export const useWebSocket = () => {
  const [data, setData] = useState({});
  const [speedUnit, setSpeedUnit] = useState('km/h');
  const ws = useRef(null);

  const getWebSocketUrl = () => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return 'ws://localhost:8000/ws';
    } else {
      return 'ws://obd_backend:8000/ws';
    }
  };

  const toggleSpeedUnit = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send('toggle_speed_unit');
      console.log('Sent toggle_speed_unit to backend');
    } else {
      console.warn('WebSocket not open, cannot toggle speed unit');
    }
  };

  useEffect(() => {
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
  }, []);

  return { data, speedUnit, toggleSpeedUnit };
};