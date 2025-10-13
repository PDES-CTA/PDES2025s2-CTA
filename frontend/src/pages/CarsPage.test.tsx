import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import CarsPage from './CarsPage';
import * as useCarSearchHook from '../hooks/useCarSearch';
import * as authServiceModule from '../services/api';
import { Car } from '../types/car';

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

const mockCars: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    price: 20000,
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
    price: 25000,
    mileage: 15000,
    fuelType: 'NAFTA',
    transmission: 'AUTOMATICA',
    color: 'Black',
    available: true,
    publicationDate: '2024-01-20',
  },
];

describe('CarsPage', () => {
  const mockFetchAllCars = vi.fn();
  const mockSearchCars = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      cars: mockCars,
      loading: false,
      error: null,
      fetchAllCars: mockFetchAllCars,
      searchCars: mockSearchCars,
      getCarById: vi.fn(),
      setCars: vi.fn(),
      setError: vi.fn(),
    });

    vi.spyOn(authServiceModule.authService, 'logout').mockImplementation(() => {});
  });

  it('should render page title', () => {
    renderWithRouter(<CarsPage />);
    expect(screen.getByText('Available Cars')).toBeInTheDocument();
    expect(screen.getByText('Find the perfect car for you')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    renderWithRouter(<CarsPage />);
    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument();
  });

  it('should call fetchAllCars on mount', () => {
    renderWithRouter(<CarsPage />);
    expect(mockFetchAllCars).toHaveBeenCalledTimes(1);
  });

  it('should render car list when cars are loaded', () => {
    renderWithRouter(<CarsPage />);
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should show loading spinner when loading', () => {
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      cars: [],
      loading: true,
      error: null,
      fetchAllCars: mockFetchAllCars,
      searchCars: mockSearchCars,
      getCarById: vi.fn(),
      setCars: vi.fn(),
      setError: vi.fn(),
    });

    renderWithRouter(<CarsPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    const errorMessage = 'Failed to load cars';
    vi.spyOn(useCarSearchHook, 'useCarSearch').mockReturnValue({
      cars: [],
      loading: false,
      error: errorMessage,
      fetchAllCars: mockFetchAllCars,
      searchCars: mockSearchCars,
      getCarById: vi.fn(),
      setCars: vi.fn(),
      setError: vi.fn(),
    });

    renderWithRouter(<CarsPage />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should call searchCars when search button is clicked', async () => {
    renderWithRouter(<CarsPage />);

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockSearchCars).toHaveBeenCalled();
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
      expect(mockFetchAllCars).toHaveBeenCalledTimes(2); // Once on mount, once on clear
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

  it('should logout and navigate when logout button is clicked', () => {
    renderWithRouter(<CarsPage />);

    const logoutButton = screen.getByRole('button', { name: /Log Out/i });
    fireEvent.click(logoutButton);

    expect(authServiceModule.authService.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
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
      cars: [],
      loading: false,
      error: errorMessage,
      fetchAllCars: mockFetchAllCars,
      searchCars: mockSearchCars,
      getCarById: vi.fn(),
      setCars: vi.fn(),
      setError: vi.fn(),
    });

    renderWithRouter(<CarsPage />);
    
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryButton);

    expect(mockFetchAllCars).toHaveBeenCalled();
  });
});