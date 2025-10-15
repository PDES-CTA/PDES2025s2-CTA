import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarCard from './CarCard';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';

const mockCar: Car = {
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
};

const mockCarOffer: CarOffer = {
  id: 1,
  carId: 1,
  dealershipId: 1,
  price: 20000,
  offerDate: '2024-01-15',
  dealershipNotes: 'Great car in excellent condition',
  images: ['https://example.com/car1.jpg'],
  car: mockCar,
};

const mockCarOfferWithoutImages: CarOffer = {
  ...mockCarOffer,
  images: undefined,
};

const mockCarOfferWithoutNotes: CarOffer = {
  ...mockCarOffer,
  dealershipNotes: undefined,
};

const mockCarSold: Car = {
  ...mockCar,
  available: false,
};

const mockCarOfferSold: CarOffer = {
  ...mockCarOffer,
  car: mockCarSold,
};

describe('CarCard', () => {
  it('should render car information', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText(/2020/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should render available badge when car is available', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should render sold badge when car is not available', () => {
    render(<CarCard car={mockCarSold} carOffer={mockCarOfferSold} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  it('should render car offer image when images are available', () => {
    const { container } = render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
    expect(image).toHaveAttribute('alt', 'Toyota Corolla');
  });

  it('should render placeholder when no images available', () => {
    const { container } = render(<CarCard car={mockCar} carOffer={mockCarOfferWithoutImages} onViewDetails={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle image error by showing placeholder', () => {
    const { container } = render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    
    if (image) {
      fireEvent.error(image);
      // After error, image should be hidden
      expect(image.style.display).toBe('none');
    }
  });

  it('should render price from car offer', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
  });

  it('should render dealership notes when provided', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
  });

  it('should not render dealership notes when not provided', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOfferWithoutNotes} onViewDetails={vi.fn()} />);
    expect(screen.queryByText('Great car in excellent condition')).not.toBeInTheDocument();
  });

  it('should call onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={mockOnViewDetails} />);
    
    const button = screen.getByText('View Details');
    fireEvent.click(button);
    
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should disable button when car is not available', () => {
    render(<CarCard car={mockCarSold} carOffer={mockCarOfferSold} onViewDetails={vi.fn()} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('should render fuel type badge', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('NAFTA')).toBeInTheDocument();
  });

  it('should render transmission badge', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
  });

  it('should render publication date', () => {
    render(<CarCard car={mockCar} carOffer={mockCarOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });

  it('should render multiple images from car offer', () => {
    const carOfferWithMultipleImages: CarOffer = {
      ...mockCarOffer,
      images: [
        'https://example.com/car1.jpg',
        'https://example.com/car2.jpg',
        'https://example.com/car3.jpg'
      ],
    };

    const { container } = render(
      <CarCard car={mockCar} carOffer={carOfferWithMultipleImages} onViewDetails={vi.fn()} />
    );
    
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
  });

  it('should render empty images array as placeholder', () => {
    const carOfferWithEmptyImages: CarOffer = {
      ...mockCarOffer,
      images: [],
    };

    const { container } = render(
      <CarCard car={mockCar} carOffer={carOfferWithEmptyImages} onViewDetails={vi.fn()} />
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});