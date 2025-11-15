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

    describe('Error handling', () => {
    it('should handle error when fetching offers fails', async () => {
      const errorMessage = 'Failed to fetch offers';
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.carOfferService.getAll).mockRejectedValue(new Error(errorMessage));

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

    it('should handle error with axios response structure', async () => {
      const errorMessage = 'Backend error message';
      const axiosError = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      };
      vi.mocked(api.carService.getAllCars).mockRejectedValue(axiosError);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers().catch(() => {});
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should handle error without message', async () => {
      vi.mocked(api.carService.getAllCars).mockRejectedValue({});

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers().catch(() => {});
      });

      await waitFor(() => {
        expect(result.current.error).toBe('An unexpected error occurred');
      });
    });

    it('should handle dealership fetch errors gracefully', async () => {
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.dealershipService.getDealershipById).mockRejectedValue(
        new Error('Dealership not found')
      );

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        // Should still succeed even if dealership fetch fails
        expect(result.current.loading).toBe(false);
        expect(result.current.displayCars).toHaveLength(3);
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty cars array', async () => {
      vi.mocked(api.carService.getAllCars).mockResolvedValue([]);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        expect(result.current.displayCars).toEqual([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle empty offers array', async () => {
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(3);
        expect(result.current.displayCars.every(dc => dc.offers.length === 0)).toBe(true);
      });
    });

    it('should handle offers without car reference', async () => {
      const invalidOffer: CarOffer = {
        id: 99,
        price: 10000,
        offerDate: '2024-01-01T00:00:00',
        available: true,
        car: undefined!,
        dealership: mockDealership,
      };

      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([...mockCarOffers, invalidOffer]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(3);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle offers without dealership reference', async () => {
      const offerWithoutDealership: CarOffer = {
        id: 99,
        price: 10000,
        offerDate: '2024-01-01T00:00:00',
        available: true,
        car: mockCars[0],
        dealership: undefined!,
      };

      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([offerWithoutDealership]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(3);
        expect(result.current.displayCars[0].offers).toHaveLength(1);
      });
    });

    it('should handle car with multiple offers', async () => {
      const extraOffer: CarOffer = {
        id: 99,
        price: 22000,
        offerDate: '2024-01-16T00:00:00',
        dealershipNotes: 'Second offer',
        available: true,
        car: mockCars[0],
        dealership: mockDealership,
      };

      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([...mockCarOffers, extraOffer]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        const toyotaCar = result.current.displayCars.find(dc => dc.car.brand === 'Toyota');
        expect(toyotaCar?.offers).toHaveLength(2);
      });
    });

    it('should handle car without any fields except id', async () => {
      const minimalCar: Car = {
        id: 99,
        brand: '',
        model: '',
        year: 2020,
        fuelType: 'NAFTA',
        transmission: 'MANUAL',
        color: '',
        publicationDate: '2024-01-01',
      };

      vi.mocked(api.carService.getAllCars).mockResolvedValue([minimalCar]);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(1);
        expect(result.current.displayCars[0].car.id).toBe(99);
      });
    });
  });

  describe('Search functionality edge cases', () => {
    it('should handle search with empty string filters', async () => {
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
          transmission: '',
        });
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(3);
      });
    });

    it('should search by keyword in description', async () => {
      const carWithDescription: Car = {
        ...mockCars[0],
        description: 'Excellent family vehicle',
      };

      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.carService.getAllCars).mockResolvedValue([carWithDescription, ...mockCars.slice(1)]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'family',
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
        expect(result.current.displayCars[0].car.description).toContain('family');
      });
    });

    it('should search by keyword in dealership notes', async () => {
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'excellent',
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
        expect(result.current.displayCars[0].offers[0].dealershipNotes).toContain('Excellent');
      });
    });

    it('should search by keyword in dealership business name', async () => {
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'test dealership',
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
        expect(result.current.displayCars).toHaveLength(3);
      });
    });

    it('should be case insensitive for keyword search', async () => {
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'TOYOTA',
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

    it('should be case insensitive for brand search', async () => {
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
          brand: 'toyota',
          fuelType: '',
          transmission: '',
        });
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(1);
        expect(result.current.displayCars[0].car.brand).toBe('Toyota');
      });
    });

    it('should filter by only minPrice', async () => {
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
          minPrice: '20000',
          maxPrice: '',
          minYear: '',
          maxYear: '',
          brand: '',
          fuelType: '',
          transmission: '',
        });
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(2);
        expect(result.current.displayCars.every(dc => dc.offers[0].price >= 20000)).toBe(true);
      });
    });

    it('should filter by only maxPrice', async () => {
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
          maxPrice: '20000',
          minYear: '',
          maxYear: '',
          brand: '',
          fuelType: '',
          transmission: '',
        });
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(2);
        expect(result.current.displayCars.every(dc => dc.offers[0].price <= 20000)).toBe(true);
      });
    });

    it('should filter by only minYear', async () => {
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
          maxYear: '',
          brand: '',
          fuelType: '',
          transmission: '',
        });
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(2);
        expect(result.current.displayCars.every(dc => dc.car.year >= 2020)).toBe(true);
      });
    });

    it('should filter by only maxYear', async () => {
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
          maxYear: '2020',
          brand: '',
          fuelType: '',
          transmission: '',
        });
      });

      await waitFor(() => {
        expect(result.current.displayCars).toHaveLength(2);
        expect(result.current.displayCars.every(dc => dc.car.year <= 2020)).toBe(true);
      });
    });
  });

  describe('getDisplayCarById', () => {
    it('should fetch car when not in cache', async () => {
      // Create a fresh hook instance with empty cache
      const { result } = renderHook(() => useCarSearch());
      
      // Clear the cache by setting empty display cars
      act(() => {
        result.current.setDisplayCars([]);
      });
    
      vi.mocked(api.carService.getCarById).mockResolvedValue(mockCars[0]);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([mockCarOffers[0]]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);
    
      let displayCar: DisplayCar | undefined;
      await act(async () => {
        displayCar = await result.current.getDisplayCarById(1);
      });
    
      await waitFor(() => {
        expect(displayCar).toBeDefined();
        expect(displayCar?.car.id).toBe(1);
        expect(api.carService.getCarById).toHaveBeenCalledWith(1);
      });
    });
  
    it('should handle string car id', async () => {
      const { result } = renderHook(() => useCarSearch());
      
      // Clear the cache
      act(() => {
        result.current.setDisplayCars([]);
      });
    
      vi.mocked(api.carService.getCarById).mockResolvedValue(mockCars[0]);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([mockCarOffers[0]]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);
    
      let displayCar: DisplayCar | undefined;
      await act(async () => {
        displayCar = await result.current.getDisplayCarById('1');
      });
    
      await waitFor(() => {
        expect(displayCar).toBeDefined();
        expect(displayCar?.car.id).toBe(1);
      });
    });
  
    it('should enrich offers with full dealership data', async () => {
      const { result } = renderHook(() => useCarSearch());
      
      // Clear the cache
      act(() => {
        result.current.setDisplayCars([]);
      });
    
      vi.mocked(api.carService.getCarById).mockResolvedValue(mockCars[0]);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([mockCarOffers[0]]);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);
    
      let displayCar: DisplayCar | undefined;
      await act(async () => {
        displayCar = await result.current.getDisplayCarById(1);
      });
    
      await waitFor(() => {
        expect(displayCar?.offers[0].dealership).toEqual(mockDealership);
      });
    });
  
    it('should handle car with no offers', async () => {
      const { result } = renderHook(() => useCarSearch());
      
      // Clear the cache
      act(() => {
        result.current.setDisplayCars([]);
      });
    
      vi.mocked(api.carService.getCarById).mockResolvedValue(mockCars[0]);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue([]); // Empty array - no offers
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);
    
      let displayCar: DisplayCar | undefined;
      await act(async () => {
        displayCar = await result.current.getDisplayCarById(1);
      });
    
      await waitFor(() => {
        expect(displayCar).toBeDefined();
        expect(displayCar?.offers).toHaveLength(0);
      });
    });
  });

  describe('State management', () => {
    it('should clear error when making new request', async () => {
      vi.mocked(api.carService.getAllCars).mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers().catch(() => {});
      });

      expect(result.current.error).toBe('First error');

      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });

    it('should update display cars when using setDisplayCars', () => {
      const { result } = renderHook(() => useCarSearch());
      
      const customDisplayCars: DisplayCar[] = [
        { car: mockCars[0], offers: [] },
      ];

      act(() => {
        result.current.setDisplayCars(customDisplayCars);
      });

      expect(result.current.displayCars).toEqual(customDisplayCars);
    });

    it('should update cache when using setDisplayCars', async () => {
      const { result } = renderHook(() => useCarSearch());
      
      const customDisplayCars: DisplayCar[] = [
        { car: mockCars[0], offers: [mockCarOffers[0]] },
      ];

      act(() => {
        result.current.setDisplayCars(customDisplayCars);
      });

      // Search should use the cached data
      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'Toyota',
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
      });
    });
  });

  describe('Concurrent requests', () => {
    it('should handle multiple search requests in sequence', async () => {
      vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffers);
      vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);
      vi.mocked(api.dealershipService.getDealershipById).mockResolvedValue(mockDealership);

      const { result } = renderHook(() => useCarSearch());

      await act(async () => {
        await result.current.fetchAllCarsAndOffers();
      });

      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'Toyota',
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
      });

      await act(async () => {
        await result.current.searchCarsAndOffers({
          keyword: 'Honda',
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
        expect(result.current.displayCars[0].car.brand).toBe('Honda');
      });
    });
  });
});