import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('HomePage', () => {
  it('should render title', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Buy your brand new car/i)).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Find your new car at the best dealerships/i)).toBeInTheDocument();
  });

  it('should render view cars button', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/View available cars/i)).toBeInTheDocument();
  });

  it('should render login button', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });

  it('should render stats section', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/0km/i)).toBeInTheDocument();
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  });
});