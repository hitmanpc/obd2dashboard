import React from 'react';
import { ObdData, SpeedUnit } from '../types';
import RPMArc from './RPMArc';
import SpeedArc from './SpeedArc';
import CoolantBar from './CoolantBar';
import BottomInfoBar from './BottomInfoBar';
import './MustangDashboard.css';
import GearIndicator from './GearIndicator';
import MiniGauge from './MiniGauge';

interface Props {
  data: ObdData;
  speedUnit: SpeedUnit;
}

const MustangDashboard: React.FC<Props> = ({ data, speedUnit }) => {
  const rpm = parseFloat(data.RPM || '0');
  const speed = parseFloat(data.Speed || '0');
  const gear = data.Gear || 'N';
  const driveMode = data.DriveMode || 'D';
  const oilTemp = parseFloat(data.OilTemp || '180');
  const transTemp = parseFloat(data.TransTemp || '160');
  const engineTemp = parseFloat(data.EngineTemp || '200');
  const coolantTemp = parseFloat(data.CoolantTemp || data['Coolant Temp'] || '190');
  const odometer = parseFloat(data.Odometer || '1964.5');
  const fuelLevel = parseFloat(data.FuelLevel || '65');
  const rangeToEmpty = parseFloat(data.RangeToEmpty || '289');
  const gearSelector = data.GearSelector || 'D';

  return (
    <div className="mustang-dashboard">
      {/* Left: RPM Arc */}
      <div className="dash-left">
        <RPMArc rpm={rpm} maxRpm={8000} />
        <CoolantBar value={coolantTemp} min={100} max={260} />
      </div>

      {/* Center: Gear + Mini Gauges */}
      <div className="dash-center">
        <GearIndicator gear={gear} driveMode={driveMode} rpm={rpm} />
        <div className="mini-gauges-row">
          <MiniGauge label="°F" icon="oil" value={oilTemp} min={100} max={300} />
          <MiniGauge label="" icon="trans" value={transTemp} min={140} max={300} />
          <MiniGauge label="°F" icon="engine" value={engineTemp} min={140} max={340} />
        </div>
      </div>

      {/* Right: Speed Arc */}
      <div className="dash-right">
        <SpeedArc speed={speed} maxSpeed={160} unit={speedUnit} />
      </div>

      {/* Bottom Bar */}
      <BottomInfoBar
        odometer={odometer}
        gearSelector={gearSelector}
        rangeToEmpty={rangeToEmpty}
        fuelLevel={fuelLevel}
        speedUnit={speedUnit}
      />
    </div>
  );
};

export default MustangDashboard;
