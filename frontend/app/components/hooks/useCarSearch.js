import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

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
      const response = await fetch(`${API_BASE_URL}/cars`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setCars(data);
      return data;
    });
  }, [handleRequest]);

  const searchCars = useCallback(async (filters) => {
    return handleRequest(async () => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value.toString().trim());
        }
      });

      const url = `${API_BASE_URL}/cars/search?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCars(data);
      return data;
    });
  }, [handleRequest]);

  const getCarById = useCallback(async (id) => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    });
  }, [handleRequest]);

  const getCarsByDealership = useCallback(async (dealershipId) => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE_URL}/cars/dealership/${dealershipId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setCars(data);
      return data;
    });
  }, [handleRequest]);

  return {
    cars,
    loading,
    error,
    fetchAllCars,
    searchCars,
    getCarById,
    getCarsByDealership,
    setCars,
    setError: useCallback((error) => setError(error), [])
  };
};