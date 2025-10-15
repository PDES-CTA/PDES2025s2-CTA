import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup, act } from '@testing-library/react';
import { useCarSearch } from './useCarSearch';
import * as api from '../services/api';
import { Car } from '../types/car';
import { CarOffer } from '../types/carOffer';

vi.mock('../services/api', () => ({
  carOfferService: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
  carService: {
    getAllCars: vi.fn(),
    getCarById: vi.fn(),
  },
}));

type CarOfferResponse = Omit<CarOffer, 'car'>;

const mockCars: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: 'ACC199',
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
    plate: 'YYK109',
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
    plate: 'PPL221',
    mileage: 40000,
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    color: 'Blue',
    available: false,
    publicationDate: '2024-01-10',
  },
];

const mockCarOffersResponse: CarOfferResponse[] = [
  {
    id: 1,
    carId: 1,
    dealershipId: 1,
    price: 20000,
    offerDate: '2024-01-15',
    dealershipNotes: 'Excellent condition',
    images: ['https://example.com/car1.jpg'],
  },
  {
    id: 2,
    carId: 2,
    dealershipId: 1,
    price: 23000,
    offerDate: '2024-01-20',
    dealershipNotes: 'Like new',
    images: ['https://example.com/car2.jpg'],
  },
  {
    id: 3,
    carId: 3,
    dealershipId: 1,
    price: 15000,
    offerDate: '2024-01-10',
    dealershipNotes: 'Good deal',
    images: ['https://example.com/car3.jpg'],
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

    expect(result.current.carOffers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch all car offers successfully', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarOffers();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.carOffers).toHaveLength(3);
      expect(result.current.carOffers[0].car).toEqual(mockCars[0]);
      expect(result.current.error).toBe(null);
    });
  });

  it('should set loading to true while fetching', async () => {
    let resolvePromise: (value: CarOffer[]) => void;
    const promise = new Promise<CarOffer[]>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(api.carOfferService.getAll).mockReturnValue(promise);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    let fetchPromise: Promise<CarOffer[]>;
    await act(async () => {
      fetchPromise = result.current.fetchAllCarOffers();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePromise!(mockCarOffersResponse as CarOffer[]);
      await fetchPromise!;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch car offers';
    vi.mocked(api.carOfferService.getAll).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarOffers().catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.carOffers).toEqual([]);
    });
  });

  it('should search car offers by keyword', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].car.brand).toBe('Toyota');
    });
  });

  it('should search car offers by price range', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].price).toBe(20000);
    });
  });

  it('should search car offers by year range', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(2);
    });
  });

  it('should search car offers by brand', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].car.brand).toBe('Honda');
    });
  });

  it('should search car offers by fuel type', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].car.fuelType).toBe('DIESEL');
    });
  });

  it('should search car offers by transmission', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].car.transmission).toBe('AUTOMATICA');
    });
  });

  it('should search car offers with multiple filters', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].car.brand).toBe('Toyota');
    });
  });

  it('should return empty array when no car offers match filters', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(0);
    });
  });

  it('should get car offer by id successfully', async () => {
    vi.mocked(api.carOfferService.getById).mockResolvedValue(mockCarOffersResponse[0] as CarOffer);
    vi.mocked(api.carService.getCarById).mockResolvedValue(mockCars[0]);

    const { result } = renderHook(() => useCarSearch());

    let carOffer: CarOffer | undefined;
    await act(async () => {
      carOffer = await result.current.getCarOfferById(1);
    });

    await waitFor(() => {
      expect(carOffer).toBeDefined();
      expect(carOffer?.car).toEqual(mockCars[0]);
      expect(api.carOfferService.getById).toHaveBeenCalledWith(1);
    });
  });

  it('should handle error when getting car offer by id', async () => {
    const errorMessage = 'Car offer not found';
    vi.mocked(api.carOfferService.getById).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await expect(result.current.getCarOfferById(999)).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should allow setting car offers manually', async () => {
    const { result } = renderHook(() => useCarSearch());
    const testOffers: CarOffer[] = [
      { ...mockCarOffersResponse[0], car: mockCars[0] } as CarOffer
    ];

    act(() => {
      result.current.setCarOffers(testOffers);
    });

    await waitFor(() => {
      expect(result.current.carOffers).toEqual(testOffers);
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
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.searchCarOffers({
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
      expect(result.current.carOffers).toHaveLength(1);
      expect(result.current.carOffers[0].car.model).toBe('Civic');
    });
  });

  it('should merge cars with car offers correctly', async () => {
    vi.mocked(api.carOfferService.getAll).mockResolvedValue(mockCarOffersResponse as CarOffer[]);
    vi.mocked(api.carService.getAllCars).mockResolvedValue(mockCars);

    const { result } = renderHook(() => useCarSearch());

    await act(async () => {
      await result.current.fetchAllCarOffers();
    });

    await waitFor(() => {
      expect(result.current.carOffers).toHaveLength(3);
      result.current.carOffers.forEach((offer, index) => {
        expect(offer.car).toEqual(mockCars[index]);
        expect(offer.carId).toBe(mockCars[index].id);
      });
    });
  });
});