import React from 'react';
import { SpeedUnit } from '../types';

interface Props {
  speed: number;
  maxSpeed: number;
  unit: SpeedUnit;
}

const SpeedArc: React.FC<Props> = ({ speed, maxSpeed, unit }) => {
  const cx = 150, cy = 150, r = 120;
  const startAngle = 135;
  const endAngle = 405;
  const sweep = endAngle - startAngle;
  const speedFraction = Math.min(speed / maxSpeed, 1);
  const currentAngle = startAngle + speedFraction * sweep;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const polarToCartesian = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  const arcPath = (from: number, to: number, radius: number) => {
    const start = polarToCartesian(from, radius);
    const end = polarToCartesian(to, radius);
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  // Speed ticks: 0, 20, 40, ... 160
  const tickCount = maxSpeed / 20;
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (i / tickCount) * sweep;
    const outer = polarToCartesian(angle, r + 5);
    const inner = polarToCartesian(angle, r - 15);
    const labelPos = polarToCartesian(angle, r - 28);
    ticks.push(
      <g key={i}>
        <line
          x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
          stroke="#5588cc" strokeWidth={2}
        />
        <text
          x={labelPos.x} y={labelPos.y}
          fill="#8899bb" fontSize="10" fontFamily="Orbitron"
          textAnchor="middle" dominantBaseline="middle"
        >
          {i * 20}
        </text>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 300 300" width="300" height="300">
      {/* Background arc */}
      <path d={arcPath(startAngle, endAngle, r)}
        fill="none" stroke="#1a1a2e" strokeWidth="22" strokeLinecap="round" />

      {/* Active arc */}
      {speedFraction > 0 && (
        <path d={arcPath(startAngle, currentAngle, r)}
          fill="none" stroke="#2288dd" strokeWidth="22" strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(34,136,221,0.6))',
            transition: 'all 0.15s ease-out',
          }}
        />
      )}

      {ticks}

      {/* Unit label */}
      <text x={cx} y={cy - 30} textAnchor="middle" fill="#8899bb"
        fontSize="13" fontFamily="Orbitron" fontWeight="500">
        {unit.toUpperCase()}
      </text>

      {/* Big speed number */}
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#ffffff"
        fontSize="48" fontFamily="Orbitron" fontWeight="900"
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))' }}>
        {Math.round(speed)}
      </text>
    </svg>
  );
};

export default SpeedArc;
