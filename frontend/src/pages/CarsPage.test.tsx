import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import CarsPage from './CarsPage';
import * as useCarSearchHook from '../hooks/useCarSearch';
import { CarOffer } from '../types/carOffer';
import { Car } from '../types/car';
import { Dealership } from '../types/dealership';
import { DisplayCar } from '../hooks/useCarSearch';

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
    fuelType: 'NAFTA',
    transmission: 'MANUAL',
    color: 'White',
    publicationDate: '2024-01-15',
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
    publicationDate: '2024-01-20',
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

describe('CarsPage', () => {
  const mockFetchAllCarsAndOffers = vi.fn();
  const mockSearchCarsAndOffers = vi.fn();
  const mockGetDisplayCarById = vi.fn();
  const mockSetDisplayCars = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      displayCars: mockDisplayCars,
      loading: false,
      error: null,
      fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
      searchCarsAndOffers: mockSearchCarsAndOffers,
      getDisplayCarById: mockGetDisplayCarById,
      setDisplayCars: mockSetDisplayCars,
      setError: mockSetError,
    });
  });

  it('should render page title', () => {
    renderWithRouter(<CarsPage />);
    expect(screen.getByText('Available Cars')).toBeInTheDocument();
    expect(screen.getByText('Find the perfect car for you')).toBeInTheDocument();
  });

  it('should call fetchAllCarsAndOffers on mount', () => {
    renderWithRouter(<CarsPage />);
    expect(mockFetchAllCarsAndOffers).toHaveBeenCalledTimes(1);
  });

  it('should render car list when cars are loaded', () => {
    renderWithRouter(<CarsPage />);
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should show loading spinner when loading', () => {
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      displayCars: [],
      loading: true,
      error: null,
      fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
      searchCarsAndOffers: mockSearchCarsAndOffers,
      getDisplayCarById: mockGetDisplayCarById,
      setDisplayCars: mockSetDisplayCars,
      setError: mockSetError,
    });

    renderWithRouter(<CarsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    const errorMessage = 'Failed to load cars';
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      displayCars: [],
      loading: false,
      error: errorMessage,
      fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
      searchCarsAndOffers: mockSearchCarsAndOffers,
      getDisplayCarById: mockGetDisplayCarById,
      setDisplayCars: mockSetDisplayCars,
      setError: mockSetError,
    });

    renderWithRouter(<CarsPage />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should call searchCarsAndOffers when search button is clicked', async () => {
    renderWithRouter(<CarsPage />);

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockSearchCarsAndOffers).toHaveBeenCalled();
    });
  });

  it('should toggle filters when filters button is clicked', () => {
    renderWithRouter(<CarsPage />);

    const filtersButton = screen.getByRole('button', { name: /Filters/i });
    
    // Initially filters should be hidden
    expect(screen.queryByPlaceholderText(/Ex: 500000/i)).not.toBeInTheDocument();
    
    // Click to show filters
    fireEvent.click(filtersButton);
    
    // Filters should now be visible
    expect(screen.getByPlaceholderText(/Ex: 500000/i)).toBeInTheDocument();
  });

  it('should update filter state when typing in keyword input', () => {
    renderWithRouter(<CarsPage />);

    const keywordInput = screen.getByPlaceholderText(/Search by brand, model or keyword/i);
    fireEvent.change(keywordInput, { target: { value: 'Toyota' } });

    expect(keywordInput).toHaveValue('Toyota');
  });

  it('should clear filters when clear button is clicked', async () => {
    renderWithRouter(<CarsPage />);

    // Show filters
    const filtersButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filtersButton);

    // Type in keyword
    const keywordInput = screen.getByPlaceholderText(/Search by brand, model or keyword/i);
    fireEvent.change(keywordInput, { target: { value: 'Toyota' } });

    // Click clear filters
    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockFetchAllCarsAndOffers).toHaveBeenCalledTimes(2); // Once on mount, once on clear
    });

    // Keyword should be cleared
    expect(keywordInput).toHaveValue('');
  });

  it('should navigate to car detail when view details is clicked', () => {
    renderWithRouter(<CarsPage />);

    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/cars/1');
  });

  it('should render search filters component', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByPlaceholderText(/Search by brand, model or keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument();
  });

  it('should show retry button in error state', () => {
    const errorMessage = 'Failed to load cars';
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      displayCars: [],
      loading: false,
      error: errorMessage,
      fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
      searchCarsAndOffers: mockSearchCarsAndOffers,
      getDisplayCarById: mockGetDisplayCarById,
      setDisplayCars: mockSetDisplayCars,
      setError: mockSetError,
    });

    renderWithRouter(<CarsPage />);
    
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryButton);

    expect(mockFetchAllCarsAndOffers).toHaveBeenCalled();
  });

  it('should display car offer prices with "From" prefix', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText(/From.*20,?000|From.*20\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/From.*25,?000|From.*25\.000/i)).toBeInTheDocument();
  });

  it('should display car details', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText(/Year 2020/)).toBeInTheDocument();
    expect(screen.getByText(/Year 2021/)).toBeInTheDocument();
  });

  it('should display results count', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText('2 cars found')).toBeInTheDocument();
  });

  it('should show empty state when no cars available', () => {
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      displayCars: [],
      loading: false,
      error: null,
      fetchAllCarsAndOffers: mockFetchAllCarsAndOffers,
      searchCarsAndOffers: mockSearchCarsAndOffers,
      getDisplayCarById: mockGetDisplayCarById,
      setDisplayCars: mockSetDisplayCars,
      setError: mockSetError,
    });

    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText('No cars found')).toBeInTheDocument();
  });

  it('should render fuel types', () => {
    renderWithRouter(<CarsPage />);
    
    const naftaBadges = screen.getAllByText('NAFTA');
    expect(naftaBadges.length).toBeGreaterThan(0);
  });

  it('should render transmission types', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
    expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
  });

  it('should render car colors', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('should render offer available badges', () => {
    renderWithRouter(<CarsPage />);
    
    const availableBadges = screen.getAllByText('Offer Available');
    expect(availableBadges.length).toBe(2);
  });

  it('should render dealership notes', () => {
    renderWithRouter(<CarsPage />);
    
    expect(screen.getByText('Excellent condition')).toBeInTheDocument();
    expect(screen.getByText('Like new')).toBeInTheDocument();
  });

  it('should render publication dates', () => {
    renderWithRouter(<CarsPage />);
    
    const publishedLabels = screen.getAllByText(/Published:/);
    expect(publishedLabels.length).toBe(2);
  });
});