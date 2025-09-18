// filepath: frontend/src/types/index.ts
export interface ObdData {
  RPM?: string;
  Speed?: string;
  Throttle?: string;
  'Coolant Temp'?: string;
  CoolantTemp?: string;
  SpeedUnit?: string;
  timestamp?: string;
  [key: string]: string | undefined;
}

export type SpeedUnit = 'km/h' | 'mph';

export interface WebSocketHookReturn {
  data: ObdData;
  speedUnit: SpeedUnit;
  toggleSpeedUnit: () => void;
}

export interface RPMGaugeProps {
  rpm?: string;
}

export interface InfoPanelProps {
  data: ObdData;
}

export interface ControlPanelProps {
  speedUnit: SpeedUnit;
  onToggleSpeedUnit: () => void;
  isConnected: boolean;
}

export interface GaugeInfo {
  gear: string;
  color: string;
  zone: string;
}