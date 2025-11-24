import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from './Select';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render select field', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Select label="Choose option" options={mockOptions} />);
    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('should render without label when not provided', () => {
    const { container } = render(<Select options={mockOptions} />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('should render all options', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should render with empty options array', () => {
    render(<Select options={[]} />);
    const select = screen.getByRole('combobox');
    expect(select.children).toHaveLength(0);
  });

  it('should handle value prop', () => {
    render(<Select value="option2" options={mockOptions} onChange={vi.fn()} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('should call onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(<Select options={mockOptions} className="custom-class" />);
    const select = container.querySelector('.custom-class');
    expect(select).toBeInTheDocument();
  });

  it('should pass through additional props', () => {
    render(<Select options={mockOptions} name="category" required />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('name', 'category');
    expect(select).toBeRequired();
  });

  it('should handle numeric values', () => {
    const numericOptions = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];
    render(<Select options={numericOptions} value={1} onChange={vi.fn()} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('1');
  });
});