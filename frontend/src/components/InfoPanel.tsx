import React from 'react';
import { InfoPanelProps } from '../types';

const InfoPanel: React.FC<InfoPanelProps> = ({ data }) => {
  const filteredData = Object.keys(data)
    .filter((key) => key !== 'RPM' && key !== 'SpeedUnit')
    .reduce((obj: { [key: string]: string | undefined }, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  return (
    <div className="info-section">
      {Object.keys(filteredData).map((key) => (
        <div key={key} className="info-item">
          <div className="info-label">{key.toUpperCase()}</div>
          <div className="info-value">
            {isNaN(parseFloat(filteredData[key] || ''))
              ? String(filteredData[key] || '')
              : Math.round(parseFloat(filteredData[key] || '0'))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoPanel;