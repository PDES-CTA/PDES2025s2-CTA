import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarCard from './CarCard';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';
import { Dealership } from '../../types/dealership';

const mockDealership: Dealership = {
  id: 1,
  businessName: 'Test Dealership',
  cuit: '30-12345678-9',
  email: 'contact@dealership.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  description: 'Test dealership',
  active: true,
  registrationDate: '2024-01-01T00:00:00',
};

const mockCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  fuelType: 'NAFTA',
  transmission: 'MANUAL',
  color: 'White',
  description: 'Great car',
  publicationDate: '2024-01-15',
  images: ['https://example.com/car1.jpg'],
};

const mockCarOffer: CarOffer = {
  id: 1,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

const mockCarWithoutImages: Car = {
  ...mockCar,
  images: undefined,
};

const mockCarOfferWithoutNotes: CarOffer = {
  ...mockCarOffer,
  dealershipNotes: undefined,
};

const mockUnavailableOffer: CarOffer = {
  ...mockCarOffer,
  available: false,
};

describe('CarCard', () => {
  it('should render car information', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText(/2020/)).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should render offer available badge when car has available offers', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Offer Available')).toBeInTheDocument();
  });

  it('should render no offers badge when car has no available offers', () => {
    render(<CarCard car={mockCar} offers={[]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('No Offers')).toBeInTheDocument();
  });

  it('should render no offers badge when all offers are unavailable', () => {
    render(<CarCard car={mockCar} offers={[mockUnavailableOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('No Offers')).toBeInTheDocument();
  });

  it('should render car image when images are available', () => {
    const { container } = render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
    expect(image).toHaveAttribute('alt', 'Toyota Corolla');
  });

  it('should render placeholder when no images available', () => {
    const { container } = render(<CarCard car={mockCarWithoutImages} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle image error by showing placeholder', () => {
    const { container } = render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    
    if (image) {
      fireEvent.error(image);
      // After error, image should be hidden
      expect(image.style.display).toBe('none');
    }
  });

  it('should render price from single offer', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/From.*20,?000|From.*20\.000/i)).toBeInTheDocument();
  });

  it('should render price range from multiple offers', () => {
    const secondOffer: CarOffer = {
      ...mockCarOffer,
      id: 2,
      price: 25000,
    };
    
    render(<CarCard car={mockCar} offers={[mockCarOffer, secondOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/20,?000.*25,?000|20\.000.*25\.000/)).toBeInTheDocument();
  });

  it('should render dealership notes when provided', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
  });

  it('should render car description when no dealership notes', () => {
    render(<CarCard car={mockCar} offers={[mockCarOfferWithoutNotes]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Great car')).toBeInTheDocument();
  });

  it('should not render description when neither notes nor car description exist', () => {
    const carWithoutDescription = { ...mockCar, description: undefined };
    render(<CarCard car={carWithoutDescription} offers={[mockCarOfferWithoutNotes]} onViewDetails={vi.fn()} />);
    expect(screen.queryByText('Great car')).not.toBeInTheDocument();
  });

  it('should call onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={mockOnViewDetails} />);
    
    const button = screen.getByText('View Details');
    fireEvent.click(button);
    
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should disable button when car has no available offers', () => {
    render(<CarCard car={mockCar} offers={[]} onViewDetails={vi.fn()} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should disable button when all offers are unavailable', () => {
    render(<CarCard car={mockCar} offers={[mockUnavailableOffer]} onViewDetails={vi.fn()} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render fuel type badge', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('NAFTA')).toBeInTheDocument();
  });

  it('should render transmission badge', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
  });

  it('should render publication date', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });

  it('should render multiple images from car', () => {
    const carWithMultipleImages: Car = {
      ...mockCar,
      images: [
        'https://example.com/car1.jpg',
        'https://example.com/car2.jpg',
        'https://example.com/car3.jpg'
      ],
    };

    const { container } = render(
      <CarCard car={carWithMultipleImages} offers={[mockCarOffer]} onViewDetails={vi.fn()} />
    );
    
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
  });

  it('should render empty images array as placeholder', () => {
    const carWithEmptyImages: Car = {
      ...mockCar,
      images: [],
    };

    const { container } = render(
      <CarCard car={carWithEmptyImages} offers={[mockCarOffer]} onViewDetails={vi.fn()} />
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should show price placeholder when no offers', () => {
    render(<CarCard car={mockCar} offers={[]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should prioritize dealership notes over car description', () => {
    render(<CarCard car={mockCar} offers={[mockCarOffer]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
    expect(screen.queryByText('Great car')).not.toBeInTheDocument();
  });

  it('should filter out unavailable offers when calculating price', () => {
    const offers = [
      mockUnavailableOffer, // price: 20000, unavailable
      { ...mockCarOffer, id: 2, price: 25000, available: true }
    ];
    
    render(<CarCard car={mockCar} offers={offers} onViewDetails={vi.fn()} />);
    // Should only show the available offer price
    expect(screen.getByText(/From.*25,?000|From.*25\.000/i)).toBeInTheDocument();
  });
});