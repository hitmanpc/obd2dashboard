import React from 'react';
import { RPMGaugeProps, GaugeInfo } from '../types';

const getGaugeInfo = (rpm: number): GaugeInfo => {
  if (rpm < 1000) return { gear: "N", color: "#4CAF50", zone: "idle" };
  if (rpm < 2500) return { gear: "1-2", color: "#2196F3", zone: "normal" };
  if (rpm < 4000) return { gear: "3-4", color: "#FFC107", zone: "mid" };
  if (rpm < 5500) return { gear: "5", color: "#FF5722", zone: "high" };
  return { gear: "6", color: "#F44336", zone: "redline" };
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
          strokeDasharray={`${(rpmValue / 6000) * (2 * Math.PI * 90)}, ${
            2 * Math.PI * 90
          }`}
        />
        <text x="100" y="100" textAnchor="middle" className="rpm-text">
          {rpmValue}
        </text>
        <text x="100" y="130" textAnchor="middle" className="gear-text">
          {gaugeInfo.gear}
        </text>
      </svg>
    </div>
  );
};

export default RPMGauge;