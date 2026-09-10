import React from 'react';

interface Props {
  rpm: number;
  maxRpm: number;
}

const ARC_CX = 150;
const ARC_CY = 150;
const ARC_R = 120;
const START_ANGLE = 135;
const END_ANGLE = 405;

const RPMArc: React.FC<Props> = ({ rpm, maxRpm }) => {
  const cx = ARC_CX, cy = ARC_CY, r = ARC_R;
  const startAngle = START_ANGLE;
  const endAngle = END_ANGLE;
  const sweep = endAngle - startAngle;

  const rpmFraction = Math.min(rpm / maxRpm, 1);
  const currentAngle = startAngle + rpmFraction * sweep;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const pt = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  const arcPath = (from: number, to: number, radius: number) => {
    const s = pt(from, radius);
    const e = pt(to, radius);
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  };

  // Track and tick radii (outward = higher in screen = larger radius since center is far below)
  const trackW = 12;
  const majorTickOuter = r + 20;
  const majorTickInner = r + 7;
  const minorTickOuter = r + 16;
  const minorTickInner = r + 9;
  const labelR = r - 17;

  const redlineAngle = startAngle + (6 / 8) * sweep;

  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= 8; i++) {
    const angle = startAngle + (i / 8) * sweep;
    const outer = pt(angle, majorTickOuter);
    const inner = pt(angle, majorTickInner);
    const label = pt(angle, labelR);
    const isRed = i >= 6;
    ticks.push(
      <g key={i}>
        <line
          x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
          stroke={isRed ? '#ff4444' : '#4477aa'} strokeWidth={2.5}
        />
        <text
          x={label.x} y={label.y}
          fill={isRed ? '#ff4444' : '#8899bb'}
          fontSize="12" fontFamily="Orbitron" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          {i}
        </text>
      </g>
    );
    for (let j = 1; j <= 4; j++) {
      const minorAngle = startAngle + ((i + j / 5) / 8) * sweep;
      if (minorAngle > endAngle) break;
      const mo = pt(minorAngle, minorTickOuter);
      const mi = pt(minorAngle, minorTickInner);
      ticks.push(
        <line
          key={`${i}-${j}`}
          x1={mo.x} y1={mo.y} x2={mi.x} y2={mi.y}
          stroke={(i + j / 5) >= 6 ? '#882222' : '#334466'} strokeWidth={1}
        />
      );
    }
  }

  // Cursor: bright vertical highlight bar at current RPM position
  const cursorTop = pt(currentAngle, r + 26);
  const cursorBot = pt(currentAngle, r - 6);
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={`Tachometer ${Math.round(rpm)} RPM`}>
      <defs>
        <radialGradient id="rpmFace" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="#101820" />
          <stop offset="72%" stopColor="#05090d" />
          <stop offset="100%" stopColor="#010203" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="142" fill="url(#rpmFace)" stroke="#263a47" strokeWidth="1.5" />
      {/* Background track */}
      <path
        d={arcPath(startAngle, endAngle, r)}
        fill="none" stroke="#0d1520" strokeWidth={trackW} strokeLinecap="butt"
      />

      {/* Active arc — normal zone */}
      {rpmFraction > 0 && (
        <path
          d={arcPath(startAngle, Math.min(currentAngle, redlineAngle), r)}
          fill="none" stroke="#2288dd" strokeWidth={trackW} strokeLinecap="butt"
          style={{ filter: 'drop-shadow(0 0 6px rgba(34,136,221,0.65))', transition: 'd 0.1s ease-out' }}
        />
      )}

      {/* Active arc — redline zone */}
      {currentAngle > redlineAngle && (
        <path
          d={arcPath(redlineAngle, currentAngle, r)}
          fill="none" stroke="#ff2222" strokeWidth={trackW} strokeLinecap="butt"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,34,34,0.8))', transition: 'd 0.1s ease-out' }}
        />
      )}

      {/* Tick marks and labels */}
      {ticks}

      {/* Current RPM cursor highlight */}
      {rpmFraction > 0 && (
        <line
          x1={cursorTop.x} y1={cursorTop.y} x2={cursorBot.x} y2={cursorBot.y}
          stroke="#70d6ff" strokeWidth="5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(68,187,255,0.9))' }}
        />
      )}

      <text x={cx} y="126" fill="#71899a" fontSize="10" fontFamily="Orbitron"
        textAnchor="middle" letterSpacing="2">
        RPM x1000
      </text>
      <text x={cx} y="177" fill="#f4f9fc" fontSize="48" fontFamily="Orbitron" fontWeight="700" textAnchor="middle">
        {(rpm / 1000).toFixed(1)}
      </text>
      <text x={cx} y="201" fill="#168fd2" fontSize="9" fontFamily="Orbitron" textAnchor="middle" letterSpacing="2">TACHOMETER</text>
    </svg>
  );
};

export default RPMArc;
