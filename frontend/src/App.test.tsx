
import { render, screen } from '@testing-library/react';
import App from './App';
import RPMGauge from './components/RPMGauge';
import InfoPanel from './components/InfoPanel';
import ControlPanel from './components/ControlPanel';

describe('App', () => {
  test('renders dashboard grid', () => {
    render(<App />);
    expect(screen.getByTestId('car-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });
});

describe('RPMGauge', () => {
  test('renders RPM value and gear', () => {
    render(<RPMGauge rpm="3500" />);
    expect(screen.getByText('3500')).toBeInTheDocument();
    // For 3500, gear should be '3-4'
    expect(screen.getByText('3-4')).toBeInTheDocument();
  });
});

describe('InfoPanel', () => {
  test('renders info items', () => {
    const data = { Speed: '100', Throttle: '50', RPM: '2000' };
    render(<InfoPanel data={data} />);
    expect(screen.getByText('SPEED')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('THROTTLE')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});

describe('ControlPanel', () => {
  test('renders speed unit and system status', () => {
    render(
      <ControlPanel speedUnit="km/h" onToggleSpeedUnit={() => {}} isConnected={true} />
    );
    expect(screen.getByText(/SPEED UNIT: km\/h/i)).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM: ONLINE/i)).toBeInTheDocument();
  });
});
