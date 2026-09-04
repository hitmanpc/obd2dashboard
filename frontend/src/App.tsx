import React from 'react';
import './Dashboard.css';
import { useWebSocket } from './hooks/useWebSocket';
import MustangDashboard from './components/MustangDashboard';


function App(): JSX.Element {
  const { data, speedUnit } = useWebSocket();

  return (
    <main className="dashboard-stage">
      <MustangDashboard data={data} speedUnit={speedUnit} />
    </main>
  );
}

export default App;
