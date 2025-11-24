import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CarDetail from './CarDetail';
import { CarOffer } from '../../types/carOffer';
import { Car } from '../../types/car';
import { Dealership } from '../../types/dealership';

const mockDealership: Dealership = {
  id: 1,
  businessName: 'Premium Auto Dealers',
  cuit: '30-12345678-9',
  email: 'contact@premiumauto.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  description: 'Best dealership in town',
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
  description: 'Great car in excellent condition',
  publicationDate: '20-12-2025',
  images: ['https://example.com/car1.jpg', 'https://example.com/car2.jpg'],
};

const mockCarOffer: CarOffer = {
  id: 1,
  car: mockCar,
  dealership: mockDealership,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Recently serviced, one owner',
  available: true,
};

describe('CarDetail', () => {
  const mockOnBack = vi.fn();
  const mockGetCarOfferById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while fetching data', () => {
    mockGetCarOfferById.mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner should have role="status"
  });

  it('should display error message when fetch fails', async () => {
    mockGetCarOfferById.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('should display "Car offer not found" when no data returned', async () => {
    mockGetCarOfferById.mockResolvedValue(null);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Car offer not found')).toBeInTheDocument();
    });
  });

  it('should render car details successfully', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    expect(screen.getByText('Year 2020')).toBeInTheDocument();
  });

  it('should display price correctly', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
    });
  });

  it('should show "Available" badge when car offer is available', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  it('should show "Sold" badge when car offer is not available', async () => {
    const soldCarOffer = { ...mockCarOffer, available: false };
    mockGetCarOfferById.mockResolvedValue(soldCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });
  });

  it('should display fuel type', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
    });
  });

  it('should display transmission type', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
    });
  });

  it('should display car color', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('White')).toBeInTheDocument();
    });
  });

  it('should display car description when available', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
    });
  });

  it('should not render description section when description is null', async () => {
    const carOfferWithoutDescription = {
      ...mockCarOffer,
      car: { ...mockCar, description: undefined },
    };
    mockGetCarOfferById.mockResolvedValue(carOfferWithoutDescription);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('should display dealership notes when available', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recently serviced, one owner')).toBeInTheDocument();
    });
  });

  it('should display dealership information', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Premium Auto Dealers')).toBeInTheDocument();
    });

    expect(screen.getByText(/Phone: 1234567890/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: contact@premiumauto.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Address: 123 Main St, Buenos Aires, Buenos Aires/i)).toBeInTheDocument();
  });

  it('should display car image when available', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      const image = screen.getByAltText('Toyota Corolla');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/car1.jpg');
    });
  });

  it('should display placeholder when no images available', async () => {
    const carOfferWithoutImages = {
      ...mockCarOffer,
      car: { ...mockCar, images: [] },
    };
    mockGetCarOfferById.mockResolvedValue(carOfferWithoutImages);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No image available')).toBeInTheDocument();
    });
  });

  it('should call onBack when back button is clicked', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);
    const user = userEvent.setup();

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to catalog');
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should enable "Contact Dealer" button when car offer is available', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      const contactButton = screen.getByText('Contact Dealer');
      expect(contactButton).not.toBeDisabled();
    });
  });

  it('should disable "Contact Dealer" button when car offer is not available', async () => {
    const soldCarOffer = { ...mockCarOffer, available: false };
    mockGetCarOfferById.mockResolvedValue(soldCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      const contactButton = screen.getByText('Not available');
      expect(contactButton).toBeDisabled();
    });
  });

  it('should display offer date', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Offer Date:/i)).toBeInTheDocument();
    });
  });

  it('should display car offer ID', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ID: #1')).toBeInTheDocument();
    });
  });

  it('should call getCarOfferById with correct ID', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    render(
      <CarDetail
        carOfferId={123}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(mockGetCarOfferById).toHaveBeenCalledWith(123);
    });
  });

  it('should refetch when carOfferId changes', async () => {
    mockGetCarOfferById.mockResolvedValue(mockCarOffer);

    const { rerender } = render(
      <CarDetail
        carOfferId={1}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(mockGetCarOfferById).toHaveBeenCalledWith(1);
    });

    const newCarOffer = { ...mockCarOffer, id: 2, carId: 2 };
    mockGetCarOfferById.mockResolvedValue(newCarOffer);

    rerender(
      <CarDetail
        carOfferId={2}
        onBack={mockOnBack}
        getCarOfferById={mockGetCarOfferById}
      />
    );

    await waitFor(() => {
      expect(mockGetCarOfferById).toHaveBeenCalledWith(2);
    });
  });
});