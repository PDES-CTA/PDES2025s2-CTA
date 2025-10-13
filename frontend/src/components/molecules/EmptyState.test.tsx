import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('should render empty state message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No cars found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search filters.')).toBeInTheDocument();
  });

  it('should render without clear filters button when onClearFilters is not provided', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render clear filters button when onClearFilters is provided', () => {
    const mockClearFilters = vi.fn();
    render(<EmptyState onClearFilters={mockClearFilters} />);
    expect(screen.getByRole('button', { name: /View all cars/i })).toBeInTheDocument();
  });

  it('should call onClearFilters when button is clicked', () => {
    const mockClearFilters = vi.fn();
    render(<EmptyState onClearFilters={mockClearFilters} />);
    
    const button = screen.getByRole('button', { name: /View all cars/i });
    fireEvent.click(button);
    
    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });

  it('should render icon', () => {
    const { container } = render(<EmptyState />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});