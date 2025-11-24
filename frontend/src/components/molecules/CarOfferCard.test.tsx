import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarOfferCard from './CarOfferCard';
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

const mockOffer: CarOffer = {
  id: 1,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

const mockOfferWithoutImages: CarOffer = {
  ...mockOffer,
  car: {
    ...mockCar,
    images: undefined,
  },
};

const mockOfferWithoutNotes: CarOffer = {
  ...mockOffer,
  dealershipNotes: undefined,
};

const mockUnavailableOffer: CarOffer = {
  ...mockOffer,
  available: false,
};

describe('CarOfferCard', () => {
  it('should render car information', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText(/Year 2020/)).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should render available badge when offer is available', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should render unavailable badge when offer is not available', () => {
    render(<CarOfferCard offer={mockUnavailableOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('should render car image when images are available', () => {
    const { container } = render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
    expect(image).toHaveAttribute('alt', 'Toyota Corolla');
  });

  it('should render placeholder when no images available', () => {
    const { container } = render(<CarOfferCard offer={mockOfferWithoutImages} onViewDetails={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render empty images array as placeholder', () => {
    const offerWithEmptyImages: CarOffer = {
      ...mockOffer,
      car: {
        ...mockCar,
        images: [],
      },
    };

    const { container } = render(<CarOfferCard offer={offerWithEmptyImages} onViewDetails={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle image error by showing placeholder', () => {
    const { container } = render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    
    if (image) {
      fireEvent.error(image);
      expect(image.style.display).toBe('none');
    }
  });

  it('should render offer price', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
  });

  it('should render fuel type badge', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('NAFTA')).toBeInTheDocument();
  });

  it('should render transmission badge', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
  });

  it('should render color badge', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should render offer date', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Offered date:/)).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  it('should render publication date', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });

  it('should render dealership notes when provided', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
  });

  it('should not render dealership notes when not provided', () => {
    render(<CarOfferCard offer={mockOfferWithoutNotes} onViewDetails={vi.fn()} />);
    expect(screen.queryByText('Great car in excellent condition')).not.toBeInTheDocument();
  });

  it('should call onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<CarOfferCard offer={mockOffer} onViewDetails={mockOnViewDetails} />);
    
    const button = screen.getByText('View Details');
    fireEvent.click(button);
    
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should render Edit button when onEdit is provided', () => {
    const mockOnEdit = vi.fn();
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should not render Edit button when onEdit is not provided', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} onEdit={mockOnEdit} />);
    
    const button = screen.getByText('Edit');
    fireEvent.click(button);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should render Delete button when onDelete is provided', () => {
    const mockOnDelete = vi.fn();
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not render Delete button when onDelete is not provided', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should call onDelete when Delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} onDelete={mockOnDelete} />);
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should render all three action buttons when all callbacks are provided', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <CarOfferCard 
        offer={mockOffer} 
        onViewDetails={vi.fn()} 
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render Edit button icons', () => {
    render(
      <CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} onEdit={vi.fn()} />
    );
    
    const editButton = screen.getByText('Edit').closest('button');
    const svg = editButton?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render Delete button icons', () => {
    render(
      <CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} onDelete={vi.fn()} />
    );
    
    const deleteButton = screen.getByText('Delete').closest('button');
    const svg = deleteButton?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render car with multiple images using first image', () => {
    const offerWithMultipleImages: CarOffer = {
      ...mockOffer,
      car: {
        ...mockCar,
        images: [
          'https://example.com/car1.jpg',
          'https://example.com/car2.jpg',
          'https://example.com/car3.jpg'
        ],
      },
    };

    const { container } = render(<CarOfferCard offer={offerWithMultipleImages} onViewDetails={vi.fn()} />);
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
  });

  it('should display 0 km for mileage', () => {
    render(<CarOfferCard offer={mockOffer} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/0 km/)).toBeInTheDocument();
  });
});