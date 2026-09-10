import React from 'react';

interface Props {
  transform: string;
}

const TemperatureIcon: React.FC<Props> = ({ transform }) => (
  <g transform={transform} stroke="#d8dde0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 1 V35 Q24 38 25 42 Q32 51 39 42"/>
    <path d="M32 8 H44 M32 17 H44 M32 26 H44"/>
    <path d="M0 39 L6 36 L16 40 M43 39 L49 36 L58 40 L64 37"/>
    <path d="M6 51 L13 55 L21 51 L30 55 L39 51 L48 55 L56 51"/>
  </g>
);

export default TemperatureIcon;
