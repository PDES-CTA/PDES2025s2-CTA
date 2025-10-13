import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarList from './CarList';
import { Car } from '../../types/car';

const mockCars: Car[] = [
  {
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
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 25000,
    mileage: 15000,
    fuelType: 'NAFTA',
    transmission: 'AUTOMATICA',
    color: 'Black',
    available: true,
    publicationDate: '2024-01-20',
  },
];

describe('CarList', () => {
  it('should render EmptyState when no cars', () => {
    render(<CarList cars={[]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('No cars found')).toBeInTheDocument();
  });

  it('should render results count', () => {
    render(<CarList cars={mockCars} onViewDetails={vi.fn()} />);
    expect(screen.getByText('2 cars found')).toBeInTheDocument();
  });

  it('should render singular form for one car', () => {
    render(<CarList cars={[mockCars[0]]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('1 car found')).toBeInTheDocument();
  });

  it('should render all car cards', () => {
    render(<CarList cars={mockCars} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should call onViewDetails with car id when View Details is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarList cars={mockCars} onViewDetails={mockOnViewDetails} />);
    
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(1);
  });
});