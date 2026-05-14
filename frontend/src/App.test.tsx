/* eslint-disable testing-library/no-node-access */
import { getByRole, render, screen } from '@testing-library/react';
import App from './App';
import BottomInfoBar from './components/BottomInfoBar';
import CoolantBar from './components/CoolantBar';
import GearIndicator from './components/GearIndicator';
import MiniGauge from './components/MiniGauge';
import MustangDashboard from './components/MustangDashboard';
import RPMArc from './components/RPMArc';
import SpeedArc from './components/SpeedArc';
import { ObdData } from './types';

const mockDashboardData: ObdData = {
  RPM: '3500',
  Speed: '100',
  Gear: '4',
  DriveMode: 'D',
  OilTemp: '200',
  TransTemp: '180',
  EngineTemp: '210',
  CoolantTemp: '195',
  Odometer: '1964.5',
  FuelLevel: '65',
  RangeToEmpty: '289',
  GearSelector: 'D',
};

jest.mock('./hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    data: mockDashboardData,
    speedUnit: 'km/h' as const,
    toggleSpeedUnit: jest.fn(),
  }),
}));

describe('App', () => {
  test('renders the dashboard with websocket data', () => {
    const { container } = render(<App />);

    expect(screen.getByRole('.mustang-dashboard')).toBeInTheDocument();
    expect(screen.getByText('RPM × 1000')).toBeInTheDocument();
    expect(screen.getByText('KM/H')).toBeInTheDocument();
    expect(screen.getByText('1964.5 km')).toBeInTheDocument();
    expect(screen.getByText('289 km to E')).toBeInTheDocument();
  });
});

describe('MustangDashboard', () => {
  test('renders the primary dashboard regions', () => {
    const { container } = render(
      <MustangDashboard data={mockDashboardData} speedUnit="km/h" />
    );

    expect(screen.getByRole('.mustang-dashboard')).toBeInTheDocument();
    expect(screen.getByRole('.dash-left')).toBeInTheDocument();
    expect(screen.getByRole('.dash-center')).toBeInTheDocument();
    expect(screen.getByRole('.dash-right')).toBeInTheDocument();
    expect(screen.getByRole('.mini-gauges-row')).toBeInTheDocument();
  });

  test('renders parsed OBD values throughout the dashboard', () => {
    render(<MustangDashboard data={mockDashboardData} speedUnit="km/h" />);

    expect(screen.getByText('GEAR')).toBeInTheDocument();
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('D')).toHaveLength(2);
    expect(screen.getAllByText('100').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('200°F')).toBeInTheDocument();
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText('210°F')).toBeInTheDocument();
  });

  test('uses fallback values when OBD data is missing', () => {
    render(<MustangDashboard data={{}} speedUnit="mph" />);

    expect(screen.getAllByText('N').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('D')).toHaveLength(2);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('MPH')).toBeInTheDocument();
    expect(screen.getByText('1964.5 mi')).toBeInTheDocument();
    expect(screen.getByText('289 mi to E')).toBeInTheDocument();
  });

  test('accepts legacy coolant temperature key', () => {
    const { container } = render(
      <MustangDashboard
        data={{ ...mockDashboardData, CoolantTemp: undefined, 'Coolant Temp': '260' }}
        speedUnit="km/h"
      />
    );

    const coolantFill = screen.getByRole('.dash-left div div div');
    expect(coolantFill).toHaveStyle({ width: '100%', background: '#ff3333' });
  });
});

describe('GearIndicator', () => {
  test.each([
    ['4', 'D'],
    ['N', 'N'],
    ['P', 'P'],
  ])('renders gear %s and drive mode %s', (gear, driveMode) => {
    render(<GearIndicator gear={gear} driveMode={driveMode} rpm={3500} />);

    expect(screen.getByText('GEAR')).toBeInTheDocument();
    expect(screen.getAllByText(gear).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(driveMode).length).toBeGreaterThanOrEqual(1);
  });
});

describe('MiniGauge', () => {
  test.each([
    ['oil' as const, '200°F', '⚙'],
    ['trans' as const, '180', '⇅'],
    ['engine' as const, '210°F', '⚡'],
  ])('renders the %s gauge with icon and value', (icon, valueText, iconText) => {
    const { container } = render(
      <MiniGauge
        label={icon === 'trans' ? '' : '°F'}
        icon={icon}
        value={parseInt(valueText, 10)}
        min={icon === 'oil' ? 100 : 140}
        max={icon === 'engine' ? 340 : 300}
      />
    );

    expect(screen.getByRole('svg')).toBeInTheDocument();
    expect(screen.getByText(iconText)).toBeInTheDocument();
    expect(screen.getByText(valueText)).toBeInTheDocument();
  });

  test('clamps low values so no active arc is drawn', () => {
    const { container } = render(
      <MiniGauge label="°F" icon="oil" value={50} min={100} max={300} />
    );

    expect(screen.getByRole('path')).toHaveLength(1);
    expect(screen.getByText('50°F')).toBeInTheDocument();
  });
});

describe('BottomInfoBar', () => {
  test('renders distance values in kilometers', () => {
    render(
      <BottomInfoBar
        odometer={1964.5}
        gearSelector="D"
        rangeToEmpty={289}
        fuelLevel={65}
        speedUnit="km/h"
      />
    );

    expect(screen.getByText('1964.5 km')).toBeInTheDocument();
    expect(screen.getByText('289 km to E')).toBeInTheDocument();
  });

  test('renders distance values in miles', () => {
    render(
      <BottomInfoBar
        odometer={1220.5}
        gearSelector="S"
        rangeToEmpty={180}
        fuelLevel={65}
        speedUnit="mph"
      />
    );

    expect(screen.getByText('1220.5 mi')).toBeInTheDocument();
    expect(screen.getByText('180 mi to E')).toBeInTheDocument();
  });

  test('renders the selected gear and fuel level state', () => {
    render(
      <BottomInfoBar
        odometer={1964.5}
        gearSelector="S"
        rangeToEmpty={289}
        fuelLevel={10}
        speedUnit="km/h"
      />
    );

    for (const gear of ['P', 'R', 'N', 'D', 'S']) {
      expect(screen.getByText(gear)).toBeInTheDocument();
    }

    expect(screen.getByText('S')).toHaveStyle({
      color: '#ff8800',
      fontWeight: '900',
    });
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('E').nextElementSibling?.firstChild).toHaveStyle({
      width: '10%',
      background: '#ff3333',
    });
  });
});

describe('RPMArc', () => {
  test('renders tachometer ticks and label', () => {
    const { container } = render(<RPMArc rpm={3500} maxRpm={8000} />);

    expect(screen.getByRole('svg')).toHaveAttribute('viewBox', '0 0 300 300');
    expect(screen.getByText('RPM × 1000')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('does not draw active arcs at zero RPM', () => {
    const { container } = render(<RPMArc rpm={0} maxRpm={8000} />);

    expect(screen.getByRole('path')).toHaveLength(1);
  });

  test('draws normal and redline arcs above redline', () => {
    const { container } = render(<RPMArc rpm={8000} maxRpm={8000} />);

    expect(screen.getByRole('path')).toHaveLength(3);
  });
});

describe('SpeedArc', () => {
  test('renders speed, unit, and scale for kilometers per hour', () => {
    const { container } = render(
      <SpeedArc speed={100} maxSpeed={160} unit="km/h" />
    );

    expect(screen.getByRole('svg')).toHaveAttribute('viewBox', '0 0 300 300');
    expect(screen.getByText('KM/H')).toBeInTheDocument();
    expect(screen.getAllByText('100').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('160')).toBeInTheDocument();
  });

  test('renders speed, unit, and scale for miles per hour', () => {
    render(<SpeedArc speed={62} maxSpeed={100} unit="mph" />);

    expect(screen.getByText('MPH')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('does not draw the active wedge at zero speed', () => {
    const { container } = render(
      <SpeedArc speed={0} maxSpeed={160} unit="km/h" />
    );

    expect(screen.getByRole('path')).toHaveLength(1);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });
});

describe('CoolantBar', () => {
  test('renders cold, normal, and hot markers', () => {
    render(<CoolantBar value={195} min={100} max={260} />);

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  test('fills from minimum to maximum temperature', () => {
    const { rerender } = render(
      <CoolantBar value={100} min={100} max={260} />
    );

    const fill = () => screen.getByText('C').nextElementSibling?.firstElementChild;

    expect(fill()).toHaveStyle({ width: '0%', background: '#2288dd' });

    rerender(<CoolantBar value={260} min={100} max={260} />);

    expect(fill()).toHaveStyle({ width: '100%', background: '#ff3333' });
  });
});
