import React, { useEffect, useState } from 'react';
console.log('React app started!');

function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    console.log('Initializing WebSocket...');
    const ws = new WebSocket('ws://localhost:8000/ws');
  
    ws.onopen = () => {
      console.log('WebSocket opened!');
    };
  
    ws.onmessage = (event) => {
      console.log('WS message:', event.data);
      try {
        const newData = JSON.parse(event.data);
        setData(newData);
      } catch (e) {
        console.error('Failed to parse message:', event.data);
      }
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
  
    return () => {
      console.log('Cleaning up WebSocket...');
      ws.close();
    };
  }, []);  // ✅ Ensure the dependency array is EMPTY
  

  return (
    <div className="App">
    <h1>OBD2 Dashboard</h1>
    {Object.keys(data).length === 0 ? (
      <p>Waiting for data...</p>
    ) : (
      Object.keys(data).map((key) => (
        <p key={key}>
          <strong>{key}:</strong> {data[key]}
        </p>
      ))
    )}
  </div>
  );
}

export default App;
