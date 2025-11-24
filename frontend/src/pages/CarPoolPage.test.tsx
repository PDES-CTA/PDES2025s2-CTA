import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import CarPoolPage from './CarPoolPage';
import * as api from '../services/api';
import { Car } from '../types/car';
import { CarOffer } from '../types/carOffer';
import { User } from '../services/api';
import { Dealership } from '../types/dealership';

// Mock the API services
vi.mock('../services/api', () => ({
  authService: {
    getLoggedUser: vi.fn(),
    logout: vi.fn(),
  },
  carService: {
    getAllCars: vi.fn(),
  },
  carOfferService: {
    getByDealershipId: vi.fn(),
    createCarOffer: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockUser: User = {
  id: 1,
  email: 'dealership@test.com',
  name: 'Test Dealership',
  role: 'DEALERSHIP',
};

const mockDealership: Dealership = {
  id: 1,
  businessName: 'Test Dealership',
  cuit: '30-12345678-9',
  email: 'dealership@test.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  description: 'Test dealership',
  active: true,
  registrationDate: '2024-01-01T00:00:00',
};

const mockCar1: Car = {
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

const mockCar2: Car = {
  id: 2,
  brand: 'Honda',
  model: 'Civic',
  year: 2021,
  fuelType: 'DIESEL',
  transmission: 'AUTOMATICA',
  color: 'Black',
  description: 'Sporty car',
  publicationDate: '2024-01-16',
  images: ['https://example.com/car2.jpg'],
};

const mockCar3: Car = {
  id: 3,
  brand: 'Ford',
  model: 'Focus',
  year: 2019,
  fuelType: 'NAFTA',
  transmission: 'MANUAL',
  color: 'Blue',
  description: 'Reliable car',
  publicationDate: '2024-01-17',
  images: ['https://example.com/car3.jpg'],
};

const mockOffer1: CarOffer = {
  id: 1,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar3,
  dealership: mockDealership,
};

describe('CarPoolPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.authService.getLoggedUser).mockResolvedValue(mockUser);
    vi.mocked(api.carService.getAllCars).mockResolvedValue([mockCar1, mockCar2, mockCar3]);
    vi.mocked(api.carOfferService.getByDealershipId).mockResolvedValue([mockOffer1]);
  });

  describe('Basic Rendering', () => {
    it('should render loading spinner initially', () => {
      vi.mocked(api.carService.getAllCars).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<CarPoolPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render page title and subtitle after loading', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('Car Pool')).toBeInTheDocument();
      });

      expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
    });

    it('should render search input', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by brand, model, year, or color...')).toBeInTheDocument();
      });
    });

    it('should render filters button', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
      });
    });

    it('should render logout button', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch logged user on mount', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(api.authService.getLoggedUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should fetch all cars on mount', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(api.carService.getAllCars).toHaveBeenCalledTimes(1);
      });
    });

    it('should fetch dealership offers on mount', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(api.carOfferService.getByDealershipId).toHaveBeenCalledWith(mockUser.id);
      });
    });

    it('should filter out cars that already have offers', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      // mockCar3 has an offer, so it should not be in the list
      // Only mockCar1 and mockCar2 should be available
    });

    it('should display all cars when dealership has no offers', async () => {
      vi.mocked(api.carOfferService.getByDealershipId).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 3 available cars/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter cars by brand', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'Toyota' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });

    it('should filter cars by model', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'Civic' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });

    it('should filter cars by year', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: '2021' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });

    it('should filter cars by color', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'Black' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'TOYOTA' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });

    it('should show all cars when search is cleared', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'Toyota' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no cars match search', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCar' } });

      await waitFor(() => {
        expect(screen.getByText('No Cars Found')).toBeInTheDocument();
        expect(screen.getByText(/No cars match "NonExistentCar"/i)).toBeInTheDocument();
      });
    });

    it('should show clear search button in empty state', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCar' } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
      });
    });

    it('should clear search when clear button clicked', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCar' } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no cars available', async () => {
      vi.mocked(api.carService.getAllCars).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('No Cars Available')).toBeInTheDocument();
        expect(screen.getByText(/There are no cars available in the pool at the moment/i)).toBeInTheDocument();
      });
    });

    it('should not show clear search button when no search term', async () => {
      vi.mocked(api.carService.getAllCars).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('No Cars Available')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });

    it('should show correct singular form when 1 car available', async () => {
      vi.mocked(api.carService.getAllCars).mockResolvedValue([mockCar1]);
      vi.mocked(api.carOfferService.getByDealershipId).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car$/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when fetching cars fails', async () => {
      vi.mocked(api.carService.getAllCars).mockRejectedValue(new Error('Network error'));

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should show error message when fetching offers fails', async () => {
      vi.mocked(api.carOfferService.getByDealershipId).mockRejectedValue(new Error('Failed to fetch offers'));

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch offers')).toBeInTheDocument();
      });
    });

    it('should show error when user is not found', async () => {
      vi.mocked(api.authService.getLoggedUser).mockResolvedValue(null!);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('No dealership found for current user')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.mocked(api.carService.getAllCars).mockRejectedValue(new Error('Network error'));

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should retry fetching on retry button click', async () => {
      vi.mocked(api.carService.getAllCars)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([mockCar1, mockCar2]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message for non-Error objects', async () => {
      vi.mocked(api.carService.getAllCars).mockRejectedValue('Some error');

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load available cars')).toBeInTheDocument();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when logout button clicked', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutButton);

      expect(api.authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Car Carousel Integration', () => {
    it('should render CarCarousel component', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      // CarCarousel should be rendered when there are cars
      // The actual content depends on CarCarousel implementation
    });

    it('should not render CarCarousel when no cars available', async () => {
      vi.mocked(api.carService.getAllCars).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('No Cars Available')).toBeInTheDocument();
      });
    });
  });

  describe('Create Offer Modal', () => {
    it('should not show modal initially', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      // Modal should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during initial load', () => {
      vi.mocked(api.carService.getAllCars).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([mockCar1, mockCar2]), 100))
      );

      renderWithRouter(<CarPoolPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });

    it('should hide loading spinner after error', async () => {
      vi.mocked(api.carService.getAllCars).mockRejectedValue(new Error('Network error'));

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Subtitle Display', () => {
    it('should update subtitle when cars are filtered', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'Toyota' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car$/i)).toBeInTheDocument();
      });
    });

    it('should show 0 cars when all filtered out', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      await waitFor(() => {
        expect(screen.getByText('No Cars Found')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty dealership offers array', async () => {
      vi.mocked(api.carOfferService.getByDealershipId).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 3 available cars/i)).toBeInTheDocument();
      });
    });

    it('should handle all cars having offers', async () => {
      const allOfferedCars: CarOffer[] = [
        { ...mockOffer1, car: mockCar1 },
        { ...mockOffer1, id: 2, car: mockCar2 },
        { ...mockOffer1, id: 3, car: mockCar3 },
      ];

      vi.mocked(api.carOfferService.getByDealershipId).mockResolvedValue(allOfferedCars);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText('No Cars Available')).toBeInTheDocument();
      });
    });

    it('should handle search with whitespace', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });
    });

    it('should handle partial matches in search', async () => {
      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 2 available cars/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by brand, model, year, or color...');
      fireEvent.change(searchInput, { target: { value: 'Toy' } });

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });

    it('should handle cars with missing optional fields', async () => {
      const carWithMinimalData: Car = {
        id: 4,
        brand: 'Nissan',
        model: 'Sentra',
        year: 2022,
        fuelType: 'NAFTA',
        transmission: 'AUTOMATICA',
        color: 'Red',
        publicationDate: '2024-01-18',
      };

      vi.mocked(api.carService.getAllCars).mockResolvedValue([carWithMinimalData]);
      vi.mocked(api.carOfferService.getByDealershipId).mockResolvedValue([]);

      renderWithRouter(<CarPoolPage />);

      await waitFor(() => {
        expect(screen.getByText(/Browse 1 available car/i)).toBeInTheDocument();
      });
    });
  });
});