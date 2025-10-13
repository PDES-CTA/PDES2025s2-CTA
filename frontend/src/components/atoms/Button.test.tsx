import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>);
    expect(screen.getByText('Primary Button')).toBeInTheDocument();
  });

  it('should render with large size', () => {
    render(<Button size="lg">Large Button</Button>);
    expect(screen.getByText('Large Button')).toBeInTheDocument();
  });

  it('should render as fullWidth', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    expect(screen.getByText('Full Width Button')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});