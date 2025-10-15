import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarList from './CarList';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';

const mockCars: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: 'ABC123',
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
    plate: 'XYZ789',
    mileage: 15000,
    fuelType: 'NAFTA',
    transmission: 'AUTOMATICA',
    color: 'Black',
    available: true,
    publicationDate: '2024-01-20',
  },
];

const mockCarOffers: CarOffer[] = [
  {
    id: 1,
    carId: 1,
    dealershipId: 1,
    price: 20000,
    offerDate: '2024-01-15',
    dealershipNotes: 'Excellent condition',
    images: ['https://example.com/car1.jpg'],
    car: mockCars[0],
  },
  {
    id: 2,
    carId: 2,
    dealershipId: 1,
    price: 25000,
    offerDate: '2024-01-20',
    dealershipNotes: 'Like new',
    images: ['https://example.com/car2.jpg'],
    car: mockCars[1],
  },
];

describe('CarList', () => {
  it('should render EmptyState when no car offers', () => {
    render(<CarList carOffers={[]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('No cars found')).toBeInTheDocument();
  });

  it('should render results count', () => {
    render(<CarList carOffers={mockCarOffers} onViewDetails={vi.fn()} />);
    expect(screen.getByText('2 cars found')).toBeInTheDocument();
  });

  it('should render singular form for one car', () => {
    render(<CarList carOffers={[mockCarOffers[0]]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('1 car found')).toBeInTheDocument();
  });

  it('should render all car cards', () => {
    render(<CarList carOffers={mockCarOffers} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should call onViewDetails with car id when View Details is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarList carOffers={mockCarOffers} onViewDetails={mockOnViewDetails} />);
    
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(1);
  });

  it('should render car offer prices', () => {
    render(<CarList carOffers={mockCarOffers} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
    expect(screen.getByText(/25,?000|25\.000/)).toBeInTheDocument();
  });

  it('should render car details from nested car objects', () => {
    render(<CarList carOffers={mockCarOffers} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText(/2020/)).toBeInTheDocument();
    expect(screen.getByText(/2021/)).toBeInTheDocument();
  });

  it('should render dealership notes when available', () => {
    render(<CarList carOffers={mockCarOffers} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('Excellent condition')).toBeInTheDocument();
    expect(screen.getByText('Like new')).toBeInTheDocument();
  });
});