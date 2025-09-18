import React from 'react';
import { ControlPanelProps } from '../types';

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  speedUnit, 
  onToggleSpeedUnit, 
  isConnected 
}) => {
  return (
    <div className="controls-section">
      <div className="speed-toggle" onClick={onToggleSpeedUnit}>
        SPEED UNIT: {speedUnit}
      </div>
      <div className="system-status">
        SYSTEM: {isConnected ? "ONLINE" : "INITIALIZING"}
      </div>
    </div>
  );
};

export default ControlPanel;