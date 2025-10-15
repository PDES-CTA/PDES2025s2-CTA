import { useState, useCallback } from 'react';
import { carOfferService, carService } from '../services/api';
import { CarOffer } from '../types/carOffer';
import { Car } from '../types/car';
import { SearchFiltersState } from '../components/organisms/SearchFilters';

interface UseCarSearchReturn {
  carOffers: CarOffer[];
  loading: boolean;
  error: string | null;
  fetchAllCarOffers: () => Promise<CarOffer[]>;
  searchCarOffers: (filters: SearchFiltersState) => Promise<CarOffer[]>;
  getCarOfferById: (id: number) => Promise<CarOffer>;
  setCarOffers: (carOffers: CarOffer[]) => void;
  setError: (error: string | null) => void;
}

export const useCarSearch = (): UseCarSearchReturn => {
  const [carOffers, setCarOffers] = useState<CarOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T,>(requestFn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      return await requestFn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllCarOffers = useCallback(async (): Promise<CarOffer[]> => {
    return handleRequest(async () => {
      const [offers, cars] = await Promise.all([
        carOfferService.getAll(),
        carService.getAllCars()
      ]);

      const carsMap = new Map<number | string, Car>();
      cars.forEach(car => {
        if (car?.id !== undefined && car.id !== null) {
          carsMap.set(car.id, car);
        }
      });

      const mergedOffers = offers
        .map(offer => {
          const car = carsMap.get(offer.carId);
          if (!car) {
            console.warn(`Car with ID ${offer.carId} not found for offer ${offer.id}`);
            return null;
          }
          return {
            ...offer,
            car
          };
        })
        .filter((offer): offer is CarOffer => offer !== null);

      setCarOffers(mergedOffers);
      return mergedOffers;
    });
  }, [handleRequest]);

  const searchCarOffers = useCallback(async (filters: SearchFiltersState): Promise<CarOffer[]> => {
    return handleRequest(async () => {
      const [offers, cars] = await Promise.all([
        carOfferService.getAll(),
        carService.getAllCars()
      ]);

      const carsMap = new Map<number | string, Car>();
      cars.forEach(car => {
        if (car?.id !== undefined && car.id !== null) {
          carsMap.set(car.id, car);
        }
      });

      const mergedOffers = offers
        .map(offer => {
          const car = carsMap.get(offer.carId);
          if (!car) {
            console.warn(`Car with ID ${offer.carId} not found for offer ${offer.id}`);
            return null;
          }
          return {
            ...offer,
            car
          };
        })
        .filter((offer): offer is CarOffer => offer !== null)
        .filter((carOffer: CarOffer) => {
          const car = carOffer.car;
          
          const matchesKeyword = !filters.keyword ||
            car.brand?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            car.model?.toLowerCase().includes(filters.keyword.toLowerCase());

          const matchesMinPrice = !filters.minPrice || carOffer.price >= Number(filters.minPrice);
          const matchesMaxPrice = !filters.maxPrice || carOffer.price <= Number(filters.maxPrice);
          const matchesMinYear = !filters.minYear || car.year >= Number(filters.minYear);
          const matchesMaxYear = !filters.maxYear || car.year <= Number(filters.maxYear);
          const matchesBrand = !filters.brand || car.brand?.toLowerCase() === filters.brand.toLowerCase();
          const matchesFuelType = !filters.fuelType || car.fuelType === filters.fuelType;
          const matchesTransmission = !filters.transmission || car.transmission === filters.transmission;

          return matchesKeyword && matchesMinPrice && matchesMaxPrice &&
            matchesMinYear && matchesMaxYear && matchesBrand &&
            matchesFuelType && matchesTransmission;
        });

      setCarOffers(mergedOffers);
      return mergedOffers;
    });
  }, [handleRequest]);

  const getCarOfferById = useCallback(async (id: number): Promise<CarOffer> => {
    return handleRequest(async () => {
      const offer = await carOfferService.getById(id);
      const car = await carService.getCarById(offer.carId);
      return {
        ...offer,
        car
      };
    });
  }, [handleRequest]);

  return {
    carOffers,
    loading,
    error,
    fetchAllCarOffers,
    searchCarOffers,
    getCarOfferById,
    setCarOffers,
    setError: useCallback((error: string | null) => setError(error), [])
  };
};