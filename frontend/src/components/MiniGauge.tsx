import React from 'react';

interface Props {
  name?: string;
  label: string;
  icon: 'oil' | 'trans' | 'engine';
  value: number;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

const MiniGauge: React.FC<Props> = ({ name, label, icon, value, min, max, minLabel, maxLabel }) => {
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

  const color = fraction > 0.75 ? '#ff4422' : fraction > 0.5 ? '#ffaa22' : '#2288dd';

  const renderIcon = (): React.ReactNode => {
    const icy = 34;

    if (icon === 'trans') {
      // Gear icon with 8 teeth
      const teeth = 8, rOut = 12.5, rIn = 10, rHub = 4;
      const pts: string[] = [];
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2 - Math.PI / 2;
        const half = (Math.PI * 0.55) / teeth;
        ([[rIn, a - half * 1.4], [rOut, a - half * 0.5], [rOut, a + half * 0.5], [rIn, a + half * 1.4]] as [number, number][]).forEach(
          ([rad, ang]) => pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(icy + rad * Math.sin(ang)).toFixed(1)}`)
        );
      }
      return (
        <g>
          <path d={`M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`}
            fill="none" stroke="#99aabb" strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx={cx} cy={icy} r={rHub} fill="none" stroke="#99aabb" strokeWidth="1.3" />
        </g>
      );
    }

    if (icon === 'oil') {
      // Oil drop shape
      return (
        <g fill="none" stroke="#99aabb" strokeWidth="1.5" strokeLinecap="round">
          <path d={`M ${cx} 23 Q ${cx + 7} 31 ${cx + 7} 37 Q ${cx + 7} 47 ${cx} 47 Q ${cx - 7} 47 ${cx - 7} 37 Q ${cx - 7} 31 ${cx} 23 Z`} />
          <line x1={cx - 2.5} y1={32} x2={cx - 3.5} y2={40} strokeWidth="1" />
        </g>
      );
    }

    // engine / coolant thermometer
    return (
      <g fill="none" stroke="#99aabb" strokeWidth="1.5" strokeLinecap="round">
        <path d={`M ${cx - 8} 25 Q ${cx - 6} 23 ${cx - 4} 25 Q ${cx - 2} 27 ${cx} 25 Q ${cx + 2} 23 ${cx + 4} 25`} />
        <rect x={cx - 2.5} y={27} width={5} height={13} rx={2.5} />
        <circle cx={cx} cy={44} r={4.5} />
      </g>
    );
  };

  const displayMin = minLabel ?? String(min);
  const displayMax = maxLabel ?? String(max);
  const minPos = p(startAngle, r + 12);
  const maxPos = p(endAngle, r + 12);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Orbitron, sans-serif' }}>
      <svg viewBox="0 0 80 80" width="80" height="80">
        {/* Background track */}
        <path d={arcPath(startAngle, endAngle, r)}
          fill="none" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" />
        {/* Active arc */}
        {fraction > 0 && (
          <path d={arcPath(startAngle, currentAngle, r)}
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}55)` }} />
        )}
        {/* Icon */}
        {renderIcon()}
        {/* Value */}
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#ffffff"
          fontSize="9" fontFamily="Orbitron" dominantBaseline="middle">
          {Math.round(value)}{label}
        </text>
        {/* Min/Max labels */}
        <text x={minPos.x} y={minPos.y} fill="#556677" fontSize="7"
          textAnchor="middle" dominantBaseline="middle">{displayMin}</text>
        <text x={maxPos.x} y={maxPos.y} fill="#556677" fontSize="7"
          textAnchor="middle" dominantBaseline="middle">{displayMax}</text>
      </svg>
      {name && (
        <div style={{ color: '#445566', fontSize: '8px', letterSpacing: '1.5px', marginTop: '-2px' }}>
          {name}
        </div>
      )}
    </div>
  );
};

export default MiniGauge;
