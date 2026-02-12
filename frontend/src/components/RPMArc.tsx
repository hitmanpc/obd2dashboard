import React from 'react';

interface Props {
  rpm: number;
  maxRpm: number;
}

const RPMArc: React.FC<Props> = ({ rpm, maxRpm }) => {
  const cx = 150, cy = 150, r = 120;
  // Arc from 225° (bottom-left) to -45° (bottom-right) = 270° sweep
  const startAngle = 135; // degrees (7 o'clock position)
  const endAngle = 405;   // degrees (5 o'clock position)
  const sweep = endAngle - startAngle; // 270°

  const rpmFraction = Math.min(rpm / maxRpm, 1);
  const currentAngle = startAngle + rpmFraction * sweep;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const polarToCartesian = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  // Build the background arc path
  const arcPath = (from: number, to: number, radius: number) => {
    const start = polarToCartesian(from, radius);
    const end = polarToCartesian(to, radius);
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  // Tick marks for 0–8 (x1000)
  const ticks = [];
  for (let i = 0; i <= 8; i++) {
    const angle = startAngle + (i / 8) * sweep;
    const outer = polarToCartesian(angle, r + 5);
    const inner = polarToCartesian(angle, r - 15);
    const labelPos = polarToCartesian(angle, r - 28);
    ticks.push(
      <g key={i}>
        <line
          x1={outer.x} y1={outer.y}
          x2={inner.x} y2={inner.y}
          stroke={i >= 6 ? '#ff3333' : '#5588cc'}
          strokeWidth={2.5}
        />
        <text
          x={labelPos.x} y={labelPos.y}
          fill={i >= 6 ? '#ff3333' : '#8899bb'}
          fontSize="11"
          fontFamily="Orbitron"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {i}
        </text>
      </g>
    );
    // Minor ticks
    for (let j = 1; j <= 4; j++) {
      const minorAngle = startAngle + ((i + j / 5) / 8) * sweep;
      if (minorAngle > endAngle) break;
      const mOuter = polarToCartesian(minorAngle, r + 2);
      const mInner = polarToCartesian(minorAngle, r - 8);
      ticks.push(
        <line
          key={`${i}-${j}`}
          x1={mOuter.x} y1={mOuter.y}
          x2={mInner.x} y2={mInner.y}
          stroke={(i + j / 5) >= 6 ? '#ff3333' : '#334466'}
          strokeWidth={1}
        />
      );
    }
  }

  // The redline threshold
  const redlineStart = startAngle + (6 / 8) * sweep;
  const normalColor = '#2288dd';
  const redlineColor = '#ff2222';

  return (
    <svg viewBox="0 0 300 300" width="300" height="300">
      {/* Background arc */}
      <path
        d={arcPath(startAngle, endAngle, r)}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="22"
        strokeLinecap="round"
      />

      {/* Active arc — normal zone */}
      {rpmFraction > 0 && (
        <path
          d={arcPath(startAngle, Math.min(currentAngle, redlineStart), r)}
          fill="none"
          stroke={normalColor}
          strokeWidth="22"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(34, 136, 221, 0.6))',
            transition: 'all 0.1s ease-out',
          }}
        />
      )}

      {/* Active arc — redline zone */}
      {currentAngle > redlineStart && (
        <path
          d={arcPath(redlineStart, currentAngle, r)}
          fill="none"
          stroke={redlineColor}
          strokeWidth="22"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 34, 34, 0.7))',
            transition: 'all 0.1s ease-out',
          }}
        />
      )}

      {/* Tick marks */}
      {ticks}

      {/* Center text */}
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#fff"
        fontSize="14" fontFamily="Orbitron" fontWeight="700">
        RPM × 1000
      </text>
    </svg>
  );
};

export default RPMArc;
