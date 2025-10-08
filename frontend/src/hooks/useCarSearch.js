import { useState, useCallback } from 'react';
import { carService } from '../services/api';

export const useCarSearch = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback(async (requestFn) => {
    try {
      setLoading(true);
      setError(null);
      return await requestFn();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllCars = useCallback(async () => {
    return handleRequest(async () => {
      const data = await carService.getAllCars();
      setCars(data);
      return data;
    });
  }, [handleRequest]);

  const searchCars = useCallback(async (filters) => {
    return handleRequest(async () => {
      // If carService has a search method, use it
      // const data = await carService.searchCars(filters);
      
      // Otherwise filter client-side
      const allCars = await carService.getAllCars();
      const filtered = allCars.filter(car => {
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

  const getCarById = useCallback(async (id) => {
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
    setError: useCallback((error) => setError(error), [])
  };
};