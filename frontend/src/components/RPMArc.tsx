import React from 'react';

interface Props {
  rpm: number;
  maxRpm: number;
}

// Wide horizontal arc geometry:
// Arc center is far below the viewport so the arc appears as a gentle horizontal curve.
// cx=280, cy=2050, r=1970 produces an arc spanning x≈25..535 at y≈97 (edges) to y≈80 (center)
// within a 560×110 SVG viewport.
const ARC_CX = 280;
const ARC_CY = 2050;
const ARC_R = 1970;
const START_ANGLE = 262.56; // degrees — left edge at x≈25
const END_ANGLE   = 277.44; // degrees — right edge at x≈535

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
  const trackW = 16;
  const majorTickOuter = r + 28;   // extends above track
  const majorTickInner = r + 8;    // starts at track outer edge
  const minorTickOuter = r + 17;
  const minorTickInner = r + 8;
  const labelR = r + 44;           // numbers above ticks

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
  const cursorX = (cursorTop.x + cursorBot.x) / 2;

  return (
    <svg viewBox="0 0 560 110" width="100%" style={{ display: 'block', overflow: 'visible' }}>
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
        <rect
          x={cursorX - 4} y={cursorTop.y}
          width={8} height={cursorBot.y - cursorTop.y}
          fill="#44bbff" rx={2}
          style={{ filter: 'drop-shadow(0 0 8px rgba(68,187,255,0.9))' }}
        />
      )}

      {/* RPM unit label at right end */}
      <text x="554" y="75" fill="#445566" fontSize="8" fontFamily="Orbitron"
        textAnchor="end" letterSpacing="0.5">
        RPM x1000
      </text>
    </svg>
  );
};

export default RPMArc;
