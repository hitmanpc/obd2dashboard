import React from 'react';
import { SpeedUnit } from '../types';

interface Props {
  odometer: number;
  gearSelector: string;
  rangeToEmpty: number;
  fuelLevel: number;
  speedUnit: SpeedUnit;
  coolantTemp: number;
}

const BottomInfoBar: React.FC<Props> = ({
  odometer, gearSelector, rangeToEmpty, fuelLevel, speedUnit, coolantTemp,
}) => {
  const gears = ['P', 'R', 'N', 'D', 'S'];
  const distUnit = speedUnit === 'mph' ? 'mi' : 'km';
  const coolantFraction = Math.min(Math.max((coolantTemp - 100) / (260 - 100), 0), 1);
  const coolantColor = coolantFraction > 0.75 ? '#ff3333' : '#2288dd';

  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      padding: '0 16px',
      color: '#8899aa',
    }}>
      {/* Coolant temperature bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: '#4488cc', fontSize: '11px' }}>C</span>
        <div style={{
          width: '56px', height: '5px',
          background: '#1a1a2e', borderRadius: '3px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${coolantFraction * 100}%`, height: '100%',
            background: coolantColor,
            borderRadius: '3px',
            boxShadow: `0 0 6px ${coolantColor}88`,
            transition: 'width 0.3s ease-out',
          }} />
        </div>
        <span style={{ color: '#ff5544', fontSize: '11px' }}>H</span>
      </div>

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
