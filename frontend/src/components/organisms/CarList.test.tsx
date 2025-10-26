import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarList from './CarList';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';
import { Dealership } from '../../types/dealership';
import { DisplayCar } from '../../hooks/useCarSearch';

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

const mockCars: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    color: 'White',
    description: 'Great car',
    publicationDate: '20-12-2025',
    images: ['https://example.com/car1.jpg'],
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    fuelType: 'NAFTA',
    transmission: 'AUTOMATICA',
    color: 'Black',
    description: 'Excellent condition',
    publicationDate: '20-12-2025',
    images: ['https://example.com/car2.jpg'],
  },
];

const mockCarOffers: CarOffer[] = [
  {
    id: 1,
    price: 20000,
    offerDate: '2024-01-15T00:00:00',
    dealershipNotes: 'Excellent condition',
    available: true,
    car: mockCars[0],
    dealership: mockDealership,
  },
  {
    id: 2,
    price: 25000,
    offerDate: '2024-01-20T00:00:00',
    dealershipNotes: 'Like new',
    available: true,
    car: mockCars[1],
    dealership: mockDealership,
  },
];

const mockDisplayCars: DisplayCar[] = [
  {
    car: mockCars[0],
    offers: [mockCarOffers[0]],
  },
  {
    car: mockCars[1],
    offers: [mockCarOffers[1]],
  },
];

describe('CarList', () => {
  it('should render EmptyState when no car offers', () => {
    render(<CarList displayCars={[]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('No cars found')).toBeInTheDocument();
  });

  it('should render results count', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    expect(screen.getByText('2 cars found')).toBeInTheDocument();
  });

  it('should render singular form for one car', () => {
    render(<CarList displayCars={[mockDisplayCars[0]]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('1 car found')).toBeInTheDocument();
  });

  it('should render all car cards', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should call onViewDetails with car id when View Details is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarList displayCars={mockDisplayCars} onViewDetails={mockOnViewDetails} />);
    
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(1);
  });

  it('should render car offer prices with From prefix', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText(/From.*20,?000|From.*20\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/From.*25,?000|From.*25\.000/i)).toBeInTheDocument();
  });

  it('should render car details', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText(/Year 2020/)).toBeInTheDocument();
    expect(screen.getByText(/Year 2021/)).toBeInTheDocument();
  });

  it('should prioritize dealership notes over car description', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    // Should show dealership notes, not car description
    expect(screen.getByText('Excellent condition')).toBeInTheDocument();
    expect(screen.getByText('Like new')).toBeInTheDocument();
    // Car descriptions should NOT be shown when dealership notes exist
    expect(screen.queryByText('Great car')).not.toBeInTheDocument();
  });

  it('should render fuel type', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('DIESEL')).toBeInTheDocument();
    expect(screen.getByText('NAFTA')).toBeInTheDocument();
  });

  it('should render transmission type', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
    expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
  });

  it('should render car color', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('should handle cars with multiple offers showing price range', () => {
    const displayCarWithMultipleOffers: DisplayCar = {
      car: mockCars[0],
      offers: [
        mockCarOffers[0],
        { ...mockCarOffers[0], id: 3, price: 22000, dealershipNotes: 'Another great offer' }
      ],
    };
    
    render(<CarList displayCars={[displayCarWithMultipleOffers]} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('1 car found')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    // Should show price range for multiple offers
    expect(screen.getByText(/20,?000.*22,?000|20\.000.*22\.000/)).toBeInTheDocument();
  });

  it('should handle cars with no offers', () => {
    const displayCarWithNoOffers: DisplayCar = {
      car: mockCars[0],
      offers: [],
    };
    
    render(<CarList displayCars={[displayCarWithNoOffers]} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('1 car found')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('No Offers')).toBeInTheDocument();
  });

  it('should show car description when no dealership notes', () => {
    const offerWithoutNotes: CarOffer = {
      ...mockCarOffers[0],
      dealershipNotes: undefined,
    };
    
    const displayCarWithoutNotes: DisplayCar = {
      car: mockCars[0],
      offers: [offerWithoutNotes],
    };
    
    render(<CarList displayCars={[displayCarWithoutNotes]} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('Great car')).toBeInTheDocument();
  });

  it('should render car images when available', () => {
    const { container } = render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/car1.jpg');
  });

  it('should show offer available badge for available offers', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    const availableBadges = screen.getAllByText('Offer Available');
    expect(availableBadges.length).toBe(2);
  });

  it('should show no offers badge for unavailable offers', () => {
    const unavailableOffer: CarOffer = {
      ...mockCarOffers[0],
      available: false,
    };
    
    const displayCarWithUnavailableOffer: DisplayCar = {
      car: mockCars[0],
      offers: [unavailableOffer],
    };
    
    render(<CarList displayCars={[displayCarWithUnavailableOffer]} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('No Offers')).toBeInTheDocument();
  });

  it('should render publication dates', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    const publishedLabels = screen.getAllByText(/Published:/);
    expect(publishedLabels.length).toBe(2);
  });

  it('should render 0 km for all cars', () => {
    render(<CarList displayCars={mockDisplayCars} onViewDetails={vi.fn()} />);
    
    const kmLabels = screen.getAllByText(/0 km/);
    expect(kmLabels.length).toBe(2);
  });

  it('should disable view details button when no offers', () => {
    const displayCarWithNoOffers: DisplayCar = {
      car: mockCars[0],
      offers: [],
    };
    
    render(<CarList displayCars={[displayCarWithNoOffers]} onViewDetails={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /View Details/i });
    expect(button).toBeDisabled();
  });

  it('should enable view details button when offers are available', () => {
    render(<CarList displayCars={[mockDisplayCars[0]]} onViewDetails={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /View Details/i });
    expect(button).not.toBeDisabled();
  });

  it('should show price placeholder when no offers', () => {
    const displayCarWithNoOffers: DisplayCar = {
      car: mockCars[0],
      offers: [],
    };
    
    render(<CarList displayCars={[displayCarWithNoOffers]} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});