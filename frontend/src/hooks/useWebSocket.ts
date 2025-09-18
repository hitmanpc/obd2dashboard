import { useEffect, useRef, useState } from 'react';
import { ObdData, SpeedUnit, WebSocketHookReturn } from '../types';

export const useWebSocket = (): WebSocketHookReturn => {
  const [data, setData] = useState<ObdData>({});
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('km/h');
  const ws = useRef<WebSocket | null>(null);

  const getWebSocketUrl = (): string => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return 'ws://localhost:8000/ws';
    } else {
      return 'ws://obd_backend:8000/ws';
    }
  };

  const toggleSpeedUnit = (): void => {
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

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const newData: ObdData = JSON.parse(event.data);
        setData(newData);
        if (newData.SpeedUnit) {
          setSpeedUnit(newData.SpeedUnit as SpeedUnit);
        }
      } catch (e) {
        console.error('Failed to parse message:', event.data);
      }
    };

    ws.current.onerror = (error: Event) => {
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