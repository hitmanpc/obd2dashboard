import React from 'react';
import './Dashboard.css';
import { useWebSocket } from './hooks/useWebSocket';
import MustangDashboard from './components/MustangDashboard';


function App(): JSX.Element {
  const { data, speedUnit } = useWebSocket();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#000',
    }}>
      <MustangDashboard data={data} speedUnit={speedUnit} />
    </div>
  );
}

export default App;
