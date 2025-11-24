import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error title', () => {
    render(<ErrorMessage error="Test error" />);
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  it('should render error message', () => {
    render(<ErrorMessage error="Connection failed" />);
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage error="Test error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage error="Test error" onRetry={mockRetry} />);
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  it('should call onRetry when button is clicked', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage error="Test error" onRetry={mockRetry} />);
    
    const button = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(button);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});