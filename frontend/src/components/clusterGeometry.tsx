import React, { useLayoutEffect, useRef, useState } from 'react';

export const clamp = (value: number, min = 0, max = 1): number =>
  Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;

export const polar = (cx: number, cy: number, radius: number, degrees: number) => {
  const radians = degrees * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
};

export const arcPath = (cx: number, cy: number, radius: number, start: number, end: number): string => {
  const a = polar(cx, cy, radius, start);
  const b = polar(cx, cy, radius, end);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

// Measure the supplied Bézier path in the browser, just as the reference HTML does.
const pointOnTach = (path: SVGPathElement, ratio: number, sampleDistance: number) => {
  const total = path.getTotalLength();
  const offset = total * clamp(ratio);
  const point = path.getPointAtLength(offset);
  const before = path.getPointAtLength(Math.max(0, offset - sampleDistance));
  const after = path.getPointAtLength(Math.min(total, offset + sampleDistance));
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const magnitude = Math.hypot(dx, dy) || 1;
  return { x: point.x, y: point.y, nx: -dy / magnitude, ny: dx / magnitude };
};

export function useTachometer(ratio: number) {
  const pathRef = useRef<SVGPathElement>(null);
  const [ticks, setTicks] = useState<React.ReactNode[]>([]);
  const [marker, setMarker] = useState<{ x1: number; y1: number; x2: number; y2: number }>();

  useLayoutEffect(() => {
    const path = pathRef.current;
    // SVG path measurement is unavailable in nonvisual renderers such as JSDOM.
    if (!path?.getTotalLength) return;
    setTicks(Array.from({ length: 91 }, (_, step) => {
      const p = pointOnTach(path, step / 90, 1.5);
      const major = step % 10 === 0;
      const medium = step % 5 === 0;
      const red = step >= 75;
      const start = major ? 7 : 5;
      const end = major ? 29 : medium ? 21 : 14;
      return (
        <g key={step}>
          <line x1={p.x + p.nx * start} y1={p.y + p.ny * start}
            x2={p.x + p.nx * end} y2={p.y + p.ny * end}
            className={`tick ${major ? '' : 'minor'}${red ? ' red' : ''}`}
            strokeWidth={major ? 2.5 : medium ? 2 : 1.2} />
          {major && step >= 20 && step <= 80 && (
            <text x={p.x + p.nx * 58} y={p.y + p.ny * 58 + 9}
              textAnchor="middle" fontSize="34" style={{ fill: red ? '#df1710' : '#cbd0d4' }}>
              {step / 10}
            </text>
          )}
        </g>
      );
    }));
  }, []);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path?.getTotalLength) return;
    const p = pointOnTach(path, ratio, 2);
    setMarker({
      x1: p.x - p.nx * 2, y1: p.y - p.ny * 2,
      x2: p.x + p.nx * 43, y2: p.y + p.ny * 43,
    });
  }, [ratio]);

  return { pathRef, ticks, marker };
}

export const SpeedTicks = React.memo(function SpeedTicks() {
  return <>{Array.from({ length: 81 }, (_, index) => {
    const value = index * 2;
    const angle = 135 + value / 160 * 270;
    const major = value % 20 === 0;
    const medium = value % 10 === 0;
    const outer = polar(1480, 360, 214, angle);
    const inner = polar(1480, 360, major ? 190 : medium ? 196 : 201, angle);
    const label = polar(1480, 360, 169, angle);
    return (
      <g key={value}>
        <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
          className={`tick ${major ? '' : 'minor'}`} strokeWidth={major ? 3 : medium ? 2 : 1.4} />
        {major && <text x={label.x} y={label.y + 10} textAnchor="middle" fontSize="34" fill="#cbd0d4">{value}</text>}
      </g>
    );
  })}</>;
});

interface SmallGaugeScaleProps {
  cx: number;
  value: number;
  min: number;
  max: number;
  blueBand: string;
}

export function SmallGaugeScale({ cx, value, min, max, blueBand }: SmallGaugeScaleProps) {
  const fraction = clamp((value - min) / (max - min));
  return (
    <>
      <path d={arcPath(cx, 397, 65, 135, 405)} fill="none" stroke="#1c2730" strokeWidth="18" />
      <path d={arcPath(cx, 397, 65, 135, 135 + 270 * fraction)} fill="none" stroke={blueBand} strokeWidth="18" />
      <path d={arcPath(cx, 397, 76, 372, 405)} fill="none" stroke="#ed1b14" strokeWidth="4" />
      {Array.from({ length: 19 }, (_, i) => {
        const angle = 135 + i * 15;
        const p1 = polar(cx, 397, i % 3 === 0 ? 54 : 57, angle);
        const p2 = polar(cx, 397, 65, angle);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={i >= 16 ? '#ec1a11' : '#c4cad0'}
          strokeOpacity={i % 3 === 0 ? '.95' : '.68'} strokeWidth={i % 3 === 0 ? '2' : '1.2'} />;
      })}
    </>
  );
}

