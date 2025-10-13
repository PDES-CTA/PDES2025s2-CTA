import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('should render text', () => {
    render(<Badge text="Available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    render(<Badge text="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render with success variant', () => {
    render(<Badge text="Success" variant="success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should render with danger variant', () => {
    render(<Badge text="Error" variant="danger" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge text="Test" className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });
});