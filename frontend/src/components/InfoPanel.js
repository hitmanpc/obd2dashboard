import React from 'react';

const InfoPanel = ({ data }) => {
  const filteredData = Object.keys(data)
    .filter((key) => key !== 'RPM' && key !== 'SpeedUnit')
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  return (
    <div className="info-section">
      {Object.keys(filteredData).map((key) => (
        <div key={key} className="info-item">
          <div className="info-label">{key.toUpperCase()}</div>
          <div className="info-value">
            {isNaN(parseFloat(filteredData[key]))
              ? String(filteredData[key])
              : Math.round(parseFloat(filteredData[key]))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoPanel;