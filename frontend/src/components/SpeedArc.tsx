/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { SpeedUnit } from '../types';

interface Props {
  speed: number;
  maxSpeed: number;
  unit: SpeedUnit;
}

const SpeedArc: React.FC<Props> = ({ speed, maxSpeed, unit }) => {
  const cx = 150, cy = 150;
  const outerR = 130;     // outer edge of the fill area
  const innerR = 68;      // inner circle radius (center display)
  const tickInnerR = 130; // ticks start at outer edge of fill
  const tickOuterR = 142; // ticks extend outward
  const labelR = 118;     // number labels sit inside the fill area
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

  // Build a filled wedge (annular sector) path between inner and outer radii
  const wedgePath = (from: number, to: number, oR: number, iR: number) => {
    const outerStart = polarToCartesian(from, oR);
    const outerEnd = polarToCartesian(to, oR);
    const innerStart = polarToCartesian(to, iR);
    const innerEnd = polarToCartesian(from, iR);
    const largeArc = to - from > 180 ? 1 : 0;
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${oR} ${oR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${iR} ${iR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z',
    ].join(' ');
  };

  // Build tick marks
  const majorStep = 20;
  const tickCount = maxSpeed / majorStep;
  const ticks = [];

  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (i / tickCount) * sweep;
    // Major ticks: extend outward from the outer ring
    const outer = polarToCartesian(angle, tickOuterR);
    const inner = polarToCartesian(angle, tickInnerR - 12);
    const labelPos = polarToCartesian(angle, labelR);
    ticks.push(
      <g key={`major-${i}`}>
        <line
          x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
          stroke="#8899aa" strokeWidth={1.5}
        />
        <text
          x={labelPos.x} y={labelPos.y}
          fill="#bbccdd" fontSize="12" fontFamily="Orbitron" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          {i * majorStep}
        </text>
      </g>
    );

    // Minor ticks between major ticks
    if (i < tickCount) {
      for (let j = 1; j <= 4; j++) {
        const minorAngle = startAngle + ((i + j / 5) / tickCount) * sweep;
        const mOuter = polarToCartesian(minorAngle, tickOuterR - 2);
        const mInner = polarToCartesian(minorAngle, tickInnerR - 4);
        ticks.push(
          <line
            key={`minor-${i}-${j}`}
            x1={mOuter.x} y1={mOuter.y}
            x2={mInner.x} y2={mInner.y}
            stroke="#556677" strokeWidth={0.8}
          />
        );
      }
    }
  }

  // Midpoint angle for gradient direction (sweep from start toward current)
  const midAngle = (startAngle + currentAngle) / 2;
  const gradStart = polarToCartesian(startAngle + 30, outerR);
  const gradEnd = polarToCartesian(currentAngle, outerR);

  return (
    <svg viewBox="0 0 300 300" width="300" height="300">
      <defs>
        {/* Sweep gradient: dark at start, bright blue at leading edge */}
        <linearGradient id="speedWedgeGrad"
          x1={gradStart.x} y1={gradStart.y}
          x2={gradEnd.x} y2={gradEnd.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#041428" stopOpacity="0.7" />
          <stop offset="30%" stopColor="#0a3060" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#1560aa" stopOpacity="0.92" />
          <stop offset="80%" stopColor="#2090dd" stopOpacity="0.96" />
          <stop offset="95%" stopColor="#30b0ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#55ccff" stopOpacity="1" />
        </linearGradient>

        {/* Soft glow filter */}
        <filter id="wedgeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Leading edge glow */}
        <filter id="edgeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Center circle gradient */}
        <radialGradient id="centerGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#101020" />
          <stop offset="80%" stopColor="#080812" />
          <stop offset="100%" stopColor="#060610" />
        </radialGradient>

        {/* Center ring gradient for metallic look */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#556688" />
          <stop offset="50%" stopColor="#334455" />
          <stop offset="100%" stopColor="#556688" />
        </linearGradient>
      </defs>

      {/* Outer circle ring (full circle, subtle metallic) */}
      <circle cx={cx} cy={cy} r={outerR + 1} fill="none" stroke="#2a2a3e" strokeWidth={1.5} />

      {/* Dark background wedge showing the full arc area */}
      <path
        d={wedgePath(startAngle, endAngle, outerR, innerR + 2)}
        fill="#08081a"
        opacity={0.6}
      />

      {/* ===== ACTIVE FILLED WEDGE ===== */}
      {speedFraction > 0 && (
        <path
          d={wedgePath(startAngle, currentAngle, outerR, innerR + 2)}
          fill="url(#speedWedgeGrad)"
          style={{
            filter: 'url(#wedgeGlow)',
            transition: 'd 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
      )}

      {/* Bright leading edge line */}
      {speedFraction > 0 && (() => {
        const edgeOuter = polarToCartesian(currentAngle, outerR + 2);
        const edgeInner = polarToCartesian(currentAngle, innerR);
        return (
          <line
            x1={edgeOuter.x} y1={edgeOuter.y}
            x2={edgeInner.x} y2={edgeInner.y}
            stroke="#77ddff" strokeWidth={2.5}
            style={{
              filter: 'url(#edgeGlow)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          />
        );
      })()}

      {/* Tick marks (drawn on top of the wedge) */}
      {ticks}

      {/* ===== CENTER CIRCLE ===== */}
      {/* Dark fill */}
      <circle cx={cx} cy={cy} r={innerR} fill="url(#centerGrad)" />
      {/* Metallic ring border */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="url(#ringGrad)" strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 0 3px rgba(80, 120, 170, 0.3))' }} />
      {/* Inner subtle ring */}
      <circle cx={cx} cy={cy} r={innerR - 3} fill="none" stroke="#1a1a2e" strokeWidth={0.5} />

      {/* Unit label */}
      <text x={cx} y={cy - 18} textAnchor="middle" fill="#99aabb"
        fontSize="13" fontFamily="Orbitron" fontWeight="600" letterSpacing="2">
        {unit.toUpperCase()}
      </text>

      {/* Big speed number */}
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#ffffff"
        fontSize="44" fontFamily="Orbitron" fontWeight="900"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>
        {Math.round(speed)}
      </text>
    </svg>
  );
};

export default SpeedArc;
