import React from 'react';

interface Props {
  value: number;
  min: number;
  max: number;
}

const CoolantBar: React.FC<Props> = ({ value, min, max }) => {
  const fraction = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const barColor = fraction > 0.75 ? '#ff3333' : '#2288dd';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      fontFamily: 'Orbitron, sans-serif',
    }}>
      <span style={{ color: '#5588cc', fontSize: '11px' }}>C</span>
      <div style={{
        flex: 1,
        height: '6px',
        background: '#1a1a2e',
        borderRadius: '3px',
        overflow: 'hidden',
        maxWidth: '160px',
      }}>
        <div style={{
          width: `${fraction * 100}%`,
          height: '100%',
          background: barColor,
          borderRadius: '3px',
          boxShadow: `0 0 8px ${barColor}88`,
          transition: 'width 0.3s ease-out',
        }} />
      </div>
      <span style={{ color: '#ff5544', fontSize: '11px' }}>H</span>
    </div>
  );
};

export default CoolantBar;
