import React from 'react';

const ControlPanel = ({ speedUnit, onToggleSpeedUnit, isConnected }) => {
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