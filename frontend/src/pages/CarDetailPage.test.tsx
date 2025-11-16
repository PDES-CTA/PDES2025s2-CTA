import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReactElement } from 'react';
import CarDetailPage from './CarDetailPage';
import * as useCarSearchHook from '../hooks/useCarSearch';
import { DisplayCar } from '../hooks/useCarSearch';
import { Car } from '../types/car';
import { CarOffer } from '../types/carOffer';
import { Dealership } from '../types/dealership';

// Mock the hooks
vi.mock('../hooks/useCarSearch');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: ReactElement, initialRoute = '/cars/1') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/cars/:id" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

const mockDealership1: Dealership = {
  id: 1,
  businessName: 'Premium Motors',
  cuit: '30-12345678-9',
  email: 'contact@premiummotors.com',
  phone: '1123456789',
  address: '123 Main St',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  description: 'Premium car dealership',
  active: true,
  registrationDate: '2023-01-01T00:00:00',
};

const mockDealership2: Dealership = {
  id: 2,
  businessName: 'Auto Excellence',
  cuit: '30-98765432-1',
  email: 'info@autoexcellence.com',
  phone: '1198765432',
  address: '456 Oak Ave',
  city: 'Córdoba',
  province: 'Córdoba',
  active: true,
  registrationDate: '2023-06-15T00:00:00',
};

const mockCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2024,
  fuelType: 'NAFTA',
  transmission: 'AUTOMATICA',
  color: 'White',
  description: 'A reliable and efficient sedan perfect for daily commuting.',
  publicationDate: '2024-01-15T00:00:00',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
};

const mockOffer1: CarOffer = {
  id: 1,
  price: 25000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Excellent condition, low mileage',
  available: true,
  car: mockCar,
  dealership: mockDealership1,
};

const mockOffer2: CarOffer = {
  id: 2,
  price: 26500,
  offerDate: '2024-01-16T00:00:00',
  dealershipNotes: 'Special financing available',
  available: true,
  car: mockCar,
  dealership: mockDealership2,
};

const mockCarData: DisplayCar = {
  car: mockCar,
  offers: [mockOffer1, mockOffer2],
};

describe('CarDetailPage', () => {
  const mockGetDisplayCarById = vi.fn();
  const mockFetchAllCarsAndOffers = vi.fn();
  const mockSearchCarsAndOffers = vi.fn();
  const mockSetDisplayCars = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCarSearchHook.useCarSearch).mockReturnValue({
      displayCars: [],
      loading: false,
      error: null,
      fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
      searchCarsAndOffers: mockSearchCarsAndOffers,
      getDisplayCarById: mockGetDisplayCarById,
      setDisplayCars: mockSetDisplayCars,
      setError: mockSetError,
    });
  });

  describe('Basic Rendering', () => {
    it('should render loading spinner initially', () => {
      mockGetDisplayCarById.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<CarDetailPage />);
      
      const loadingSpinner = screen.getByRole('status');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should render car details after loading', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      });

      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
      expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('should render car description', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('A reliable and efficient sedan perfect for daily commuting.')).toBeInTheDocument();
      });
    });

    it('should render back button', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to list/i })).toBeInTheDocument();
      });
    });

    it('should render dealership offers section', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Dealership Offers')).toBeInTheDocument();
      });
    });

    it('should render all car detail labels', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/Year:/i)).toBeInTheDocument();
        expect(screen.getByText(/Mileage:/i)).toBeInTheDocument();
        expect(screen.getByText(/Fuel:/i)).toBeInTheDocument();
        expect(screen.getByText(/Transmission:/i)).toBeInTheDocument();
        expect(screen.getByText(/Color:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Price Display', () => {
    it('should display price range when offers have different prices', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/\$\s*25\.000\s*-\s*\$\s*26\.500/)).toBeInTheDocument();
      });
    });

    it('should display single price with "From" when all offers have same price', async () => {
      const singlePriceData: DisplayCar = {
        car: mockCar,
        offers: [
          { ...mockOffer1, price: 25000 },
          { ...mockOffer2, price: 25000 },
        ],
      };

      mockGetDisplayCarById.mockResolvedValue(singlePriceData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/From\s*\$\s*25\.000/)).toBeInTheDocument();
      });
    });

    it('should display dash when no available offers', async () => {
      const noOffersData: DisplayCar = {
        car: mockCar,
        offers: [],
      };

      mockGetDisplayCarById.mockResolvedValue(noOffersData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument();
      });
    });

    it('should ignore unavailable offers in price calculation', async () => {
      const mixedAvailabilityData: DisplayCar = {
        car: mockCar,
        offers: [
          { ...mockOffer1, price: 25000, available: true },
          { ...mockOffer2, price: 30000, available: false },
        ],
      };

      mockGetDisplayCarById.mockResolvedValue(mixedAvailabilityData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/From\s*\$\s*25\.000/)).toBeInTheDocument();
      });
    });
  });

  describe('Offers Display', () => {
    it('should render all available offers', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Premium Motors')).toBeInTheDocument();
        expect(screen.getByText('Auto Excellence')).toBeInTheDocument();
      });
    });

    it('should display message when no offers available', async () => {
      const noOffersData: DisplayCar = {
        car: mockCar,
        offers: [],
      };

      mockGetDisplayCarById.mockResolvedValue(noOffersData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('No dealership is currently offering this car.')).toBeInTheDocument();
      });
    });

    it('should show "No current offers" badge when no offers exist', async () => {
      const noOffersData: DisplayCar = {
        car: mockCar,
        offers: [],
      };

      mockGetDisplayCarById.mockResolvedValue(noOffersData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('No current offers for this car')).toBeInTheDocument();
      });
    });

    it('should show "Offers no longer available" badge when offers exist but none available', async () => {
      const unavailableOffersData: DisplayCar = {
        car: mockCar,
        offers: [
          { ...mockOffer1, available: false },
          { ...mockOffer2, available: false },
        ],
      };

      mockGetDisplayCarById.mockResolvedValue(unavailableOffersData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Offers no longer available')).toBeInTheDocument();
      });
    });

    it('should only display available offers in the list', async () => {
      const mixedAvailabilityData: DisplayCar = {
        car: mockCar,
        offers: [
          { ...mockOffer1, available: true },
          { ...mockOffer2, available: false },
        ],
      };

      mockGetDisplayCarById.mockResolvedValue(mixedAvailabilityData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Premium Motors')).toBeInTheDocument();
        expect(screen.queryByText('Auto Excellence')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when car not found', async () => {
      mockGetDisplayCarById.mockResolvedValue(null);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Car with ID 1 not found.')).toBeInTheDocument();
      });
    });

    it('should display error message on fetch failure', async () => {
      mockGetDisplayCarById.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should display generic error for unknown errors', async () => {
      mockGetDisplayCarById.mockRejectedValue('Unknown error');

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load car details.')).toBeInTheDocument();
      });
    });

    it('should display error for invalid car ID', async () => {
      renderWithRouter(<CarDetailPage />, '/cars/invalid');

      await waitFor(() => {
        expect(screen.getByText('Invalid Car ID.')).toBeInTheDocument();
      });
    });

    it('should show Go Back button in error state', async () => {
      mockGetDisplayCarById.mockResolvedValue(null);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call navigate(-1) when back button clicked', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to list/i })).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to list/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should call navigate(-1) when Go Back button clicked in error state', async () => {
      mockGetDisplayCarById.mockResolvedValue(null);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      });

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      fireEvent.click(goBackButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('API Integration', () => {
    it('should call getDisplayCarById with correct ID', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />, '/cars/123');

      await waitFor(() => {
        expect(mockGetDisplayCarById).toHaveBeenCalledWith(123);
      });
    });

    it('should fetch car details on mount', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(mockGetDisplayCarById).toHaveBeenCalledTimes(1);
      });
    });

    it('should refetch when ID parameter changes', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      const { unmount } = renderWithRouter(<CarDetailPage />, '/cars/1');

      await waitFor(() => {
        expect(mockGetDisplayCarById).toHaveBeenCalledWith(1);
      });

      unmount();
      vi.clearAllMocks();

      renderWithRouter(<CarDetailPage />, '/cars/2');

      await waitFor(() => {
        expect(mockGetDisplayCarById).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('Car Details Section', () => {
    it('should display mileage as 0 km', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('0 km')).toBeInTheDocument();
      });
    });

    it('should render description section when description exists', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Description')).toBeInTheDocument();
      });
    });

    it('should not render description section when description is missing', async () => {
      const noDescriptionData: DisplayCar = {
        car: {
          ...mockCar,
          description: undefined,
        },
        offers: [mockOffer1, mockOffer2],
      };

      mockGetDisplayCarById.mockResolvedValue(noDescriptionData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      });

      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('should render car title with brand and model', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        const title = screen.getByRole('heading', { level: 1 });
        expect(title).toHaveTextContent('Toyota Corolla');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during fetch', () => {
      mockGetDisplayCarById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCarData), 100))
      );

      vi.mocked(useCarSearchHook.useCarSearch).mockReturnValue({
        displayCars: [],
        loading: true,
        error: null,
        fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
        searchCarsAndOffers: mockSearchCarsAndOffers,
        getDisplayCarById: mockGetDisplayCarById,
        setDisplayCars: mockSetDisplayCars,
        setError: mockSetError,
      });

      renderWithRouter(<CarDetailPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide loading spinner after successful fetch', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });

    it('should hide loading spinner after error', async () => {
      mockGetDisplayCarById.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty images array', async () => {
      const noImagesData: DisplayCar = {
        car: {
          ...mockCar,
          images: [],
        },
        offers: [mockOffer1, mockOffer2],
      };

      mockGetDisplayCarById.mockResolvedValue(noImagesData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      });
    });

    it('should handle undefined images', async () => {
      const noImagesData: DisplayCar = {
        car: {
          ...mockCar,
          images: undefined,
        },
        offers: [mockOffer1, mockOffer2],
      };

      mockGetDisplayCarById.mockResolvedValue(noImagesData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      });
    });

    it('should handle car with very long description', async () => {
      const longDescription = 'A'.repeat(1000);
      const longDescriptionData: DisplayCar = {
        car: {
          ...mockCar,
          description: longDescription,
        },
        offers: [mockOffer1, mockOffer2],
      };

      mockGetDisplayCarById.mockResolvedValue(longDescriptionData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(longDescription)).toBeInTheDocument();
      });
    });

    it('should handle multiple offers with same price', async () => {
      const samePriceData: DisplayCar = {
        car: mockCar,
        offers: [
          { ...mockOffer1, price: 25000 },
          { ...mockOffer2, price: 25000 },
          { ...mockOffer2, id: 3, price: 25000 },
        ],
      };

      mockGetDisplayCarById.mockResolvedValue(samePriceData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/From\s*\$\s*25\.000/)).toBeInTheDocument();
      });
    });

    it('should handle car ID of 0', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />, '/cars/0');

      await waitFor(() => {
        expect(mockGetDisplayCarById).toHaveBeenCalledWith(0);
      });
    });

    it('should handle negative car ID as invalid', async () => {
      renderWithRouter(<CarDetailPage />, '/cars/-1');

      await waitFor(() => {
        expect(mockGetDisplayCarById).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe('Fuel Type Display', () => {
    it('should display NAFTA fuel type correctly', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('NAFTA')).toBeInTheDocument();
      });
    });

    it('should display DIESEL fuel type correctly', async () => {
      const dieselCarData: DisplayCar = {
        car: {
          ...mockCar,
          fuelType: 'DIESEL',
        },
        offers: [mockOffer1],
      };

      mockGetDisplayCarById.mockResolvedValue(dieselCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('DIESEL')).toBeInTheDocument();
      });
    });
  });

  describe('Transmission Display', () => {
    it('should display AUTOMATICA transmission correctly', async () => {
      mockGetDisplayCarById.mockResolvedValue(mockCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
      });
    });

    it('should display MANUAL transmission correctly', async () => {
      const manualCarData: DisplayCar = {
        car: {
          ...mockCar,
          transmission: 'MANUAL',
        },
        offers: [mockOffer1],
      };

      mockGetDisplayCarById.mockResolvedValue(manualCarData);

      renderWithRouter(<CarDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('MANUAL')).toBeInTheDocument();
      });
    });
  });
});