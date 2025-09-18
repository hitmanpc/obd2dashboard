import { render, screen } from '@testing-library/react';
import App from './App';

test('renders car dashboard', () => {
  render(<App />);
  const dashboardElement = screen.getByText(/SYSTEM:/i);
  expect(dashboardElement).toBeInTheDocument();
});
