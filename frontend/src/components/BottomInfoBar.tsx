import React from 'react';
import { SpeedUnit } from '../types';

interface Props {
  odometer: number;
  gearSelector: string;
  rangeToEmpty: number;
  fuelLevel: number;
  speedUnit: SpeedUnit;
}

const BottomInfoBar: React.FC<Props> = ({
  odometer, gearSelector, rangeToEmpty, fuelLevel, speedUnit,
}) => {
  const gears = ['P', 'R', 'N', 'D', 'S'];
  const distUnit = speedUnit === 'mph' ? 'mi' : 'km';

  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      padding: '0 20px',
      color: '#8899aa',
    }}>
      {/* Odometer */}
      <span>{odometer.toFixed(1)} {distUnit}</span>

      {/* Gear selector: P R N D S — highlight active */}
      <div style={{ display: 'flex', gap: '6px', letterSpacing: '2px' }}>
        {gears.map((g) => (
          <span key={g} style={{
            color: g === gearSelector ? '#ff8800' : '#556677',
            fontWeight: g === gearSelector ? 900 : 400,
            fontSize: g === gearSelector ? '14px' : '12px',
          }}>
            {g}
          </span>
        ))}
      </div>

      {/* Range to empty */}
      <span>{Math.round(rangeToEmpty)} {distUnit} to E</span>

      {/* Fuel gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>E</span>
        <div style={{
          width: '60px', height: '5px',
          background: '#1a1a2e', borderRadius: '3px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${fuelLevel}%`, height: '100%',
            background: fuelLevel < 15 ? '#ff3333' : '#2288dd',
            borderRadius: '3px',
            transition: 'width 0.3s ease-out',
          }} />
        </div>
        <span>F</span>
      </div>
    </div>
  );
};

export default BottomInfoBar;
