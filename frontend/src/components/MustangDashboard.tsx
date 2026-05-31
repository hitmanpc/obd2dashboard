import React from 'react';
import { ObdData, SpeedUnit } from '../types';
import RPMArc from './RPMArc';
import SpeedArc from './SpeedArc';
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
      {/* Top: Wide RPM arc spanning left + center columns */}
      <div className="dash-rpm">
        <RPMArc rpm={rpm} maxRpm={8000} />
      </div>

      {/* Lower-left: Gear Indicator */}
      <div className="dash-left">
        <GearIndicator gear={gear} driveMode={driveMode} rpm={rpm} />
      </div>

      {/* Lower-center: Mini Gauges */}
      <div className="dash-center">
        <div className="mini-gauges-row">
          <MiniGauge name="TRANS TEMP" label="°F" icon="trans" value={oilTemp} min={100} max={300} />
          <MiniGauge name="OIL PRESS" label="" icon="oil" value={transTemp} min={0} max={100} minLabel="L" maxLabel="H" />
          <MiniGauge name="ENG TEMP" label="°F" icon="engine" value={engineTemp} min={140} max={340} />
        </div>
      </div>

      {/* Right: Speedometer spans both rows */}
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
        coolantTemp={coolantTemp}
      />
    </div>
  );
};

export default MustangDashboard;
