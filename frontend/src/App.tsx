import React from 'react';
import './Dashboard.css';
import { useWebSocket } from './hooks/useWebSocket';
import RPMGauge from './components/RPMGauge';
import InfoPanel from './components/InfoPanel';
import ControlPanel from './components/ControlPanel';

console.log('React app started!');

function App(): JSX.Element {
  const { data, speedUnit, toggleSpeedUnit } = useWebSocket();

  return (
    <div className="car-dashboard" data-testid="car-dashboard">
      <div className="dashboard-grid" data-testid="dashboard-grid">
        <RPMGauge rpm={data['RPM']} />
        <InfoPanel data={data} />
        <ControlPanel 
          speedUnit={speedUnit}
          onToggleSpeedUnit={toggleSpeedUnit}
          isConnected={Object.keys(data).length > 0}
        />
      </div>
    </div>
  );
}

export default App;
