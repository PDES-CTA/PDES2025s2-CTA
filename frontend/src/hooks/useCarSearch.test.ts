import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup, act } from '@testing-library/react';
import { useCarSearch } from './useCarSearch';
import * as carService from '../services/api';
import { Car } from '../types/car';

vi.mock('../services/api', () => ({
  carService: {
    getAllCars: vi.fn(),
    getCarById: vi.fn(),
  },
}));

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
  {
    id: 3,
    brand: 'Ford',
    model: 'Focus',
    year: 2019,
    price: 18000,
    mileage: 40000,
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    color: 'Blue',
    available: false,
    publicationDate: '2024-01-10',
  },
];

describe('useCarSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCarSearch());

    expect(result.current.cars).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch all cars successfully', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.fetchAllCars();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.cars).toEqual(mockCars);
      expect(result.current.error).toBe(null);
    });
  });

  it('should set loading to true while fetching', async () => {
    let resolvePromise: (value: Car[]) => void;
    const promise = new Promise<Car[]>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(carService.carService.getAllCars).mockReturnValue(promise);

    const { result } = renderHook(() => useCarSearch());

    const fetchPromise = result.current.fetchAllCars();

    // Wait for loading to become true
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Resolve the promise
    resolvePromise!(mockCars);
    await fetchPromise;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch cars';
    vi.mocked(carService.carService.getAllCars).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCarSearch());

    await result.current.fetchAllCars();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.cars).toEqual([]);
    });
  });

  it('should search cars by keyword', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: 'toyota',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: '',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].brand).toBe('Toyota');
    });
  });

  it('should search cars by price range', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '19000',
      maxPrice: '24000',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: '',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].brand).toBe('Toyota');
    });
  });

  it('should search cars by year range', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minYear: '2020',
      maxYear: '2021',
      brand: '',
      fuelType: '',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(2);
    });
  });

  it('should search cars by brand', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: 'Honda',
      fuelType: '',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].brand).toBe('Honda');
    });
  });

  it('should search cars by fuel type', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: 'DIESEL',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].fuelType).toBe('DIESEL');
    });
  });

  it('should search cars by transmission', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: '',
      transmission: 'AUTOMATICA',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].transmission).toBe('AUTOMATICA');
    });
  });

  it('should search cars with multiple filters', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '15000',
      maxPrice: '30000',
      minYear: '2020',
      maxYear: '',
      brand: '',
      fuelType: 'NAFTA',
      transmission: 'MANUAL',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].brand).toBe('Toyota');
    });
  });

  it('should return empty array when no cars match filters', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: '',
      minPrice: '50000',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: '',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(0);
    });
  });

  it('should get car by id successfully', async () => {
    const carToFind = mockCars[0];
    vi.mocked(carService.carService.getCarById).mockResolvedValue(carToFind);

    const { result } = renderHook(() => useCarSearch());

    const car = await result.current.getCarById(1);

    await waitFor(() => {
      expect(car).toEqual(carToFind);
      expect(carService.carService.getCarById).toHaveBeenCalledWith(1);
    });
  });

  it('should handle error when getting car by id', async () => {
    const errorMessage = 'Car not found';
    vi.mocked(carService.carService.getCarById).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCarSearch());

    await expect(result.current.getCarById(999)).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should allow setting cars manually', async () => {
    const { result } = renderHook(() => useCarSearch());

    act(() => {
      result.current.setCars(mockCars);
    });

    await waitFor(() => {
      expect(result.current.cars).toEqual(mockCars);
    });
  });

  it('should allow setting error manually', async () => {
    const { result } = renderHook(() => useCarSearch());

    act(() => {
      result.current.setError('Custom error');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Custom error');
    });
  });

  it('should search by keyword in model field', async () => {
    vi.mocked(carService.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await result.current.searchCars({
      keyword: 'civic',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: '',
      transmission: '',
    });

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(1);
      expect(result.current.cars[0].model).toBe('Civic');
    });
  });
});