import React from 'react';
import { RPMGaugeProps, GaugeInfo } from '../types';

const getGaugeInfo = (rpm: number): GaugeInfo => {
  if(rpm < 6000) return { color: "#438bceff", zone: "normal" };
  if (rpm < 6500) return { color: "#FF5722", zone: "high" };
  return {color: "#F44336", zone: "redline" };
};

const RPMGauge: React.FC<RPMGaugeProps> = ({ rpm }) => {
  const rpmValue = Math.round(parseFloat(rpm || '0'));
  const gaugeInfo = getGaugeInfo(rpmValue);

  return (
    <div className="rpm-section">
      <svg viewBox="0 0 200 200" className="rpm-gauge">
        <path
          d="M100 20 A80 80 0 1 0 180 100"
          fill="none"
          stroke="#333"
          strokeWidth="20"
        />
        <path
          d="M180 100 A 80 80 0 1 1 100 20"
          fill="none"
          stroke={gaugeInfo.color}
          strokeWidth="20"
          strokeDasharray={`${(rpmValue / 9000) * (2 * Math.PI * 90)}, ${
            2 * Math.PI * 90
          }`}
        />
        <text x="100" y="100" textAnchor="middle" className="rpm-text">
          {rpmValue}
        </text>
        {/* <text x="100" y="130" textAnchor="middle" className="gear-text">
          {gaugeInfo.gear}
        </text> */}
      </svg>
    </div>
  );
};

export default RPMGauge;