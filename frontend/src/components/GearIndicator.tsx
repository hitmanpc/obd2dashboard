import React from 'react';

interface Props {
  gear: string;
  driveMode: string;
  rpm: number;
}

const GearIndicator: React.FC<Props> = ({ gear, driveMode }) => {
  return (
    <div style={{
      textAlign: 'center',
      fontFamily: 'Orbitron, sans-serif',
    }}>
      <div style={{ color: '#6688aa', fontSize: '12px', letterSpacing: '3px' }}>
        GEAR
      </div>
      <div style={{
        color: '#ffffff',
        fontSize: '72px',
        fontWeight: 900,
        lineHeight: 1,
        textShadow: '0 0 20px rgba(100,180,255,0.3)',
      }}>
        {gear}
      </div>
      <div style={{
        color: '#2288dd',
        fontSize: '16px',
        fontWeight: 700,
        marginTop: '4px',
      }}>
        {driveMode}
      </div>
    </div>
  );
};

export default GearIndicator;
