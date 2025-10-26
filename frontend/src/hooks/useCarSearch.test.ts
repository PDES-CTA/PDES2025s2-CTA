import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup, act } from '@testing-library/react';
import { useCarSearch, DisplayCar } from './useCarSearch';
import * as api from '../services/api';
import { Car } from '../types/car';
import { CarOffer } from '../types/carOffer';
import { Dealership } from '../types/dealership';

vi.mock('../services/api', () => ({
  carOfferService: {
    getAll: vi.fn(),
  },
  carService: {
    getAllCars: vi.fn(),
    getCarById: vi.fn(),
  },
  dealershipService: {
    getDealershipById: vi.fn(),
  },
}));

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
  {
    id: 3,
    brand: 'Ford',
    model: 'Focus',
    year: 2019,
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    color: 'Blue',
    publicationDate: '2024-01-10',
    images: ['https://example.com/car3.jpg'],
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
    price: 23000,
    offerDate: '2024-01-20T00:00:00',
    dealershipNotes: 'Like new',
    available: true,
    car: mockCars[1],
    dealership: mockDealership,
  },
  {
    id: 3,
    price: 15000,
    offerDate: '2024-01-10T00:00:00',
    dealershipNotes: 'Good deal',
    available: true,
    car: mockCars[2],
    dealership: mockDealership,
  },
];

describe('useCarSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.carOfferService.getAll).mockReset();
    vi.mocked(api.carService.getAllCars).mockReset();
    vi.mocked(api.carService.getCarById).mockReset();
    vi.mocked(api.dealershipService.getDealershipById).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCarSearch());

    expect(result.current.displayCars).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch all cars and offers successfully', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.displayCars).toHaveLength(3);
      expect(result.current.displayCars[0].car).toEqual(mockCars[0]);
      expect(result.current.displayCars[0].offers).toHaveLength(1);
      expect(result.current.error).toBe(null);
    });
  });

  it('should set loading to true while fetching', async () => {
    let resolvePromise: (value: Car[]) => void;
    const carsPromise = new Promise<Car[]>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(api.carService.getAllCars).mockReturnValue(carsPromise);
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    let fetchPromise: Promise<DisplayCar[]>;
    act(() => {
      fetchPromise = result.current.fetchAllCarsAndOffers();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePromise!(mockCars);
      await fetchPromise!;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch cars';
    vi.mocked(api.carService.getAllCars).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers().catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.displayCars).toEqual([]);
    });
  });

  it('should search cars by keyword', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    // Fetch first to populate cache
    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    // Then search
    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: 'toyota',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].car.brand).toBe('Toyota');
    });
  });

  it('should search cars by price range', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '19000',
        maxPrice: '22000',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].offers[0].price).toBe(20000);
    });
  });

  it('should search cars by year range', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '',
        maxPrice: '',
        minYear: '2020',
        maxYear: '2021',
        brand: '',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(2);
    });
  });

  it('should search cars by brand', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: 'Honda',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].car.brand).toBe('Honda');
    });
  });

  it('should search cars by fuel type', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: 'DIESEL',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].car.fuelType).toBe('DIESEL');
    });
  });

  it('should search cars by transmission', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: '',
        transmission: 'AUTOMATICA',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].car.transmission).toBe('AUTOMATICA');
    });
  });

  it('should search cars with multiple filters', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '15000',
        maxPrice: '25000',
        minYear: '2020',
        maxYear: '',
        brand: '',
        fuelType: 'NAFTA',
        transmission: 'MANUAL',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].car.brand).toBe('Toyota');
    });
  });

  it('should return empty array when no cars match filters', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '50000',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(0);
    });
  });

  it('should handle error when getting car by id', async () => {
    const errorMessage = 'Car not found';
    vi.mocked(api.carService.getCarById).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCarSearch());

    let displayCar: DisplayCar | undefined;
    await act(async () => {
      displayCar = await result.current.getDisplayCarById(999);
    });

    await waitFor(() => {
      expect(displayCar).toBeUndefined();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should allow setting display cars manually', () => {
    const { result } = renderHook(() => useCarSearch());
    const testDisplayCars: DisplayCar[] = [
      {
        car: mockCars[0],
        offers: [mockCarOffers[0]],
      },
    ];

    act(() => {
      result.current.setDisplayCars(testDisplayCars);
    });

    expect(result.current.displayCars).toEqual(testDisplayCars);
  });

  it('should allow setting error manually', () => {
    const { result } = renderHook(() => useCarSearch());

    act(() => {
      result.current.setError('Custom error');
    });

    expect(result.current.error).toBe('Custom error');
  });

  it('should search by keyword in model field', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: 'civic',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      expect(result.current.displayCars).toHaveLength(1);
      expect(result.current.displayCars[0].car.model).toBe('Civic');
    });
  });

  it('should filter out cars without offers when price filter is active', async () => {
    const carWithoutOffers: Car = {
      id: 4,
      brand: 'Mazda',
      model: 'CX-5',
      year: 2020,
      fuelType: 'NAFTA',
      transmission: 'AUTOMATICA',
      color: 'Red',
      publicationDate: '2024-01-25',
      images: [],
    };

    const carsWithExtra = [...mockCars, carWithoutOffers];
    
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers); // Only 3 offers
    vi.mocked(api.carService.getAllCars).mockResolvedValue(carsWithExtra); // 4 cars
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    await act(async () => {
      await result.current.searchCarsAndOffers({
        keyword: '',
        minPrice: '10000',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        brand: '',
        fuelType: '',
        transmission: '',
      });
    });

    await waitFor(() => {
      // Should return 3 cars (all with offers matching the price filter)
      expect(result.current.displayCars).toHaveLength(3);
      // All returned cars should have offers
      expect(result.current.displayCars.every(dc => dc.offers.length > 0)).toBe(true);
      // The Mazda (id: 4) should NOT be in the results because it has no offers
      expect(result.current.displayCars.some(dc => dc.car.id === 4)).toBe(false);
    });
  });

  it('should use cached data when available', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
    vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

    const { result } = renderHook(() => useCarSearch());

    // First fetch
    await act(async () => {
      await result.current.fetchAllCarsAndOffers();
    });

    // Get by ID (should use cache)
    let displayCar: DisplayCar | undefined;
    await act(async () => {
      displayCar = await result.current.getDisplayCarById(1);
    });

    await waitFor(() => {
      expect(displayCar).toBeDefined();
      expect(displayCar?.car.id).toBe(1);
      // getCarById should not be called because data is cached
      expect(api.carService.getCarById).not.toHaveBeenCalled();
    });
  });
});