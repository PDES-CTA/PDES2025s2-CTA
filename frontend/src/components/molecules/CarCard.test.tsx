import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarCard from './CarCard';
import { Car } from '../../types/car';

const mockCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  price: 20000,
  mileage: 30000,
  fuelType: 'NAFTA',
  transmission: 'MANUAL',
  color: 'White',
  available: true,
  publicationDate: '2024-01-15',
  description: 'Great car in excellent condition',
  images: ['https://example.com/car1.jpg'],
};

const mockCarWithoutImages: Car = {
  ...mockCar,
  images: undefined,
};

const mockCarSold: Car = {
  ...mockCar,
  available: false,
};

describe('CarCard', () => {
  it('should render car information', () => {
    render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText(/2020/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument(); // mileage
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should render available badge when car is available', () => {
    render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should render sold badge when car is not available', () => {
    render(<CarCard car={mockCarSold} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  it('should render car image when images are available', () => {
    const { container } = render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
    expect(image).toHaveAttribute('alt', 'Toyota Corolla');
  });

  it('should render placeholder when no images available', () => {
    const { container } = render(<CarCard car={mockCarWithoutImages} onViewDetails={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle image error by showing placeholder', () => {
    const { container } = render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    
    if (image) {
      fireEvent.error(image);
      // After error, image should be hidden
      expect(image.style.display).toBe('none');
    }
  });

  it('should render description when provided', () => {
    render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const carWithoutDesc = { ...mockCar, description: undefined };
    render(<CarCard car={carWithoutDesc} onViewDetails={vi.fn()} />);
    expect(screen.queryByText('Great car in excellent condition')).not.toBeInTheDocument();
  });

  it('should call onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarCard car={mockCar} onViewDetails={mockOnViewDetails} />);
    
    const button = screen.getByText('View Details');
    fireEvent.click(button);
    
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should disable button when car is not available', () => {
    render(<CarCard car={mockCarSold} onViewDetails={vi.fn()} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('should render fuel type badge', () => {
    render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    expect(screen.getByText('NAFTA')).toBeInTheDocument();
  });

  it('should render transmission badge', () => {
    render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
  });

  it('should render publication date', () => {
    render(<CarCard car={mockCar} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });
});