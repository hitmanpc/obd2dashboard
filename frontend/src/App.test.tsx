import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard', () => {
  render(<App />);
  // Update test to match actual content in your dashboard
  const dashboardElement = screen.getByText(/SYSTEM:/i);
  expect(dashboardElement).toBeInTheDocument();
});