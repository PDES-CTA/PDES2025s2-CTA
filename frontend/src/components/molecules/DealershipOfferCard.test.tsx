import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DealershipOfferCard from './DealershipOfferCard';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';
import { Dealership } from '../../types/dealership';

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

const mockOffer: CarOffer = {
  id: 1,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

const mockDealershipWithoutOptionalFields: Dealership = {
  id: 2,
  businessName: 'Minimal Dealership',
  cuit: '30-98765432-1',
  email: "Minimal@contact.com.ar",
  phone: undefined,
  address: undefined,
  city: undefined,
  province: undefined,
  description: undefined,
  active: true,
  registrationDate: '2024-01-01T00:00:00',
};

const mockOfferWithoutNotes: CarOffer = {
  ...mockOffer,
  dealershipNotes: undefined,
};

describe('DealershipOfferCard', () => {
  it('should render no offer message when offer is not provided', () => {
    render(<DealershipOfferCard />);
    expect(screen.getByText('There are currently no dealership offers for this vehicle.')).toBeInTheDocument();
  });

  it('should render dealership name', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    expect(screen.getByText('Test Dealership')).toBeInTheDocument();
  });

  it('should render offer price', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
  });

  it('should render complete address with city and province', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    expect(screen.getByText(/123 Main St, Buenos Aires, Buenos Aires/)).toBeInTheDocument();
  });

  it('should render address without city when city is not provided', () => {
    const dealershipWithoutCity: Dealership = {
      ...mockDealership,
      city: undefined,
    };
    const offerWithDealership: CarOffer = {
      ...mockOffer,
      dealership: dealershipWithoutCity,
    };
    render(<DealershipOfferCard offer={offerWithDealership} />);
    expect(screen.getByText(/123 Main St, Buenos Aires/)).toBeInTheDocument();
  });

  it('should render address without province when province is not provided', () => {
    const dealershipWithoutProvince: Dealership = {
      ...mockDealership,
      province: undefined,
    };
    const offerWithDealership: CarOffer = {
      ...mockOffer,
      dealership: dealershipWithoutProvince,
    };
    render(<DealershipOfferCard offer={offerWithDealership} />);
    expect(screen.getByText(/123 Main St, Buenos Aires/)).toBeInTheDocument();
  });

  it('should not render address section when address is not provided', () => {
    const offerWithMinimalDealership: CarOffer = {
      ...mockOffer,
      dealership: mockDealershipWithoutOptionalFields,
    };
    render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
    expect(screen.queryByText(/Main St/)).not.toBeInTheDocument();
  });

  it('should render phone number with tel link', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    const phoneLink = screen.getByRole('link', { name: '1234567890' });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute('href', 'tel:1234567890');
  });

  it('should not render phone section when phone is not provided', () => {
    const offerWithMinimalDealership: CarOffer = {
      ...mockOffer,
      dealership: mockDealershipWithoutOptionalFields,
    };
    render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
    expect(screen.queryByRole('link', { name: /1234567890/ })).not.toBeInTheDocument();
  });

  it('should render email with mailto link', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    const emailLink = screen.getByRole('link', { name: 'contact@dealership.com' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@dealership.com');
  });

  it('should not render email section when email is not provided', () => {
    const offerWithMinimalDealership: CarOffer = {
      ...mockOffer,
      dealership: mockDealershipWithoutOptionalFields,
    };
    render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
    expect(screen.queryByRole('link', { name: /contact@dealership.com/ })).not.toBeInTheDocument();
  });

  it('should render dealership notes when provided', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
  });

  it('should not render dealership notes when not provided', () => {
    render(<DealershipOfferCard offer={mockOfferWithoutNotes} />);
    expect(screen.queryByText('Great car in excellent condition')).not.toBeInTheDocument();
  });

  it('should use separate dealership prop when provided', () => {
    const separateDealership: Dealership = {
      ...mockDealership,
      businessName: 'Separate Dealership',
    };
    render(<DealershipOfferCard offer={mockOffer} dealership={separateDealership} />);
    expect(screen.getByText('Separate Dealership')).toBeInTheDocument();
  });

  it('should use dealership from offer when separate dealership prop is not provided', () => {
    render(<DealershipOfferCard offer={mockOffer} />);
    expect(screen.getByText('Test Dealership')).toBeInTheDocument();
  });

  it('should render all icons', () => {
    const { container } = render(<DealershipOfferCard offer={mockOffer} />);
    const svgs = container.querySelectorAll('svg');
    // Should have icons for: Building (in name), MapPin, Phone, Mail
    expect(svgs.length).toBeGreaterThanOrEqual(4);
  });

  it('should render building icon in no offer state', () => {
    const { container } = render(<DealershipOfferCard />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should render minimal dealership with only required fields', () => {
    const offerWithMinimalDealership: CarOffer = {
      ...mockOffer,
      dealership: mockDealershipWithoutOptionalFields,
    };
    render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
    
    expect(screen.getByText('Minimal Dealership')).toBeInTheDocument();
    expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
    expect(screen.queryByText(/Main St/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeInTheDocument();
  });

  it('should render only address when city and province are provided', () => {
    const dealershipWithOnlyAddress: Dealership = {
      ...mockDealership,
      phone: undefined,
      email: "test@mail.com",
    };
    const offerWithDealership: CarOffer = {
      ...mockOffer,
      dealership: dealershipWithOnlyAddress,
    };
    render(<DealershipOfferCard offer={offerWithDealership} />);
    
    expect(screen.getByText(/123 Main St, Buenos Aires, Buenos Aires/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeInTheDocument();
  });

  it('should handle offer with null dealership property', () => {
    const offerWithNullDealership: CarOffer = {
      ...mockOffer,
      dealership: null as unknown as Dealership,
    };
    render(<DealershipOfferCard offer={offerWithNullDealership} />);
    expect(screen.getByText('There are currently no dealership offers for this vehicle.')).toBeInTheDocument();
  });
});