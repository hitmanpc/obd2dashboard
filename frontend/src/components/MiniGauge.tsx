import React from 'react';

interface Props {
  label: string;
  icon: 'oil' | 'trans' | 'engine';
  value: number;
  min: number;
  max: number;
}

const MiniGauge: React.FC<Props> = ({ label, icon, value, min, max }) => {
  const cx = 40, cy = 40, r = 30;
  const startAngle = 135;
  const endAngle = 405;
  const sweep = endAngle - startAngle;
  const fraction = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const currentAngle = startAngle + fraction * sweep;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const p = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  const arcPath = (from: number, to: number, radius: number) => {
    const s = p(from, radius);
    const e = p(to, radius);
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  // Color ramps to orange/red as value increases
  const color = fraction > 0.75 ? '#ff4422' : fraction > 0.5 ? '#ffaa22' : '#2288dd';

  const iconSymbols: Record<string, string> = {
    oil: '⚙',
    trans: '⇅',
    engine: '⚡',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 80 80" width="80" height="80">
        {/* Background */}
        <path d={arcPath(startAngle, endAngle, r)}
          fill="none" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" />
        {/* Active */}
        {fraction > 0 && (
          <path d={arcPath(startAngle, currentAngle, r)}
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}55)` }} />
        )}
        {/* Icon */}
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#aabbcc"
          fontSize="16" dominantBaseline="middle">
          {iconSymbols[icon]}
        </text>
        {/* Value */}
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#ffffff"
          fontSize="8" fontFamily="Orbitron" dominantBaseline="middle">
          {Math.round(value)}{label}
        </text>
        {/* Min/Max labels */}
        <text x={p(startAngle, r + 10).x} y={p(startAngle, r + 10).y}
          fill="#556677" fontSize="6" textAnchor="middle">{min}</text>
        <text x={p(endAngle, r + 10).x} y={p(endAngle, r + 10).y}
          fill="#556677" fontSize="6" textAnchor="middle">{max}</text>
      </svg>
    </div>
  );
};

export default MiniGauge;
