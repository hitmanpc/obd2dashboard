import React from 'react';

interface Props {
  transform: string;
}

const OilTemperatureIcon: React.FC<Props> = ({ transform }) => (
  <g transform={transform} stroke="#d8dde0" strokeWidth="1.8" fill="none" strokeLinejoin="miter">
    <path d="M12 26.5 L17 30 H28 L47.5 23 H49 L35.5 38 H12 Z"/>
    <path d="M47.5 23 H50 L52 25"/>
    <path d="M2 20 L11 24 L9 30 L0 27 Z M0 27 L16 32"/>
    <path d="M23 1 V22 L20 25 L23 28 V30 M23 6 H33 M23 12 H33 M23 18 H33"
          strokeWidth="2.4" strokeLinecap="square"/>
    <path d="M53 30 C52.8 32 51.5 33.5 51.5 35 A1.8 1.8 0 0 0 55.1 35 C55.1 33.5 53.8 32 53 30 Z"
          fill="#d8dde0" stroke="none"/>
  </g>
);

export default OilTemperatureIcon;
