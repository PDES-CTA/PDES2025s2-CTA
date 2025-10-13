import { useState, useCallback } from 'react';
import { carService } from '../services/api';
import { Car } from '../types/car';
import { SearchFiltersState } from '../components/organisms/SearchFilters';

interface UseCarSearchReturn {
  cars: Car[];
  loading: boolean;
  error: string | null;
  fetchAllCars: () => Promise<Car[]>;
  searchCars: (filters: SearchFiltersState) => Promise<Car[]>;
  getCarById: (id: string | number) => Promise<Car>;
  setCars: (cars: Car[]) => void;
  setError: (error: string | null) => void;
}

export const useCarSearch = (): UseCarSearchReturn => {
  const [cars, setCars] = useState<Car[]>([]);
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

  const fetchAllCars = useCallback(async (): Promise<Car[]> => {
    return handleRequest(async () => {
      const data = await carService.getAllCars();
      setCars(data);
      return data;
    });
  }, [handleRequest]);

  const searchCars = useCallback(async (filters: SearchFiltersState): Promise<Car[]> => {
    return handleRequest(async () => {
      // If carService has a search method, use it
      // const data = await carService.searchCars(filters);
      // Otherwise filter client-side
      const allCars = await carService.getAllCars();
      const filtered = allCars.filter((car: Car) => {
        const matchesKeyword = !filters.keyword ||
          car.brand.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          car.model.toLowerCase().includes(filters.keyword.toLowerCase());

        const matchesMinPrice = !filters.minPrice || car.price >= Number(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || car.price <= Number(filters.maxPrice);
        const matchesMinYear = !filters.minYear || car.year >= Number(filters.minYear);
        const matchesMaxYear = !filters.maxYear || car.year <= Number(filters.maxYear);
        const matchesBrand = !filters.brand || car.brand.toLowerCase() === filters.brand.toLowerCase();
        const matchesFuelType = !filters.fuelType || car.fuelType === filters.fuelType;
        const matchesTransmission = !filters.transmission || car.transmission === filters.transmission;

        return matchesKeyword && matchesMinPrice && matchesMaxPrice &&
          matchesMinYear && matchesMaxYear && matchesBrand &&
          matchesFuelType && matchesTransmission;
      });

      setCars(filtered);
      return filtered;
    });
  }, [handleRequest]);

  const getCarById = useCallback(async (id: string | number): Promise<Car> => {
    return handleRequest(async () => {
      return await carService.getCarById(id);
    });
  }, [handleRequest]);

  return {
    cars,
    loading,
    error,
    fetchAllCars,
    searchCars,
    getCarById,
    setCars,
    setError: useCallback((error: string | null) => setError(error), [])
  };
};