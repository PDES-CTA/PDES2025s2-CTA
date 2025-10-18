import { useState, useCallback } from 'react';
import { carOfferService, carService, dealershipService } from '../services/api';
import { CarOffer } from '../types/carOffer';
import { Car } from '../types/car';
import { Dealership } from '../types/dealership';
import { SearchFiltersState } from '../components/organisms/SearchFilters';

export interface DisplayCar {
  car: Car;
  offers: (CarOffer & { dealership?: Dealership })[];
}

interface UseCarSearchReturn {
  displayCars: DisplayCar[];
  loading: boolean;
  error: string | null;
  fetchAllCarsAndOffers: () => Promise<DisplayCar[]>;
  searchCarsAndOffers: (filters: SearchFiltersState) => Promise<DisplayCar[]>;
  getDisplayCarById: (carId: number | string) => Promise<DisplayCar | undefined>;
  setDisplayCars: (displayCars: DisplayCar[]) => void;
  setError: (error: string | null) => void;
}

let allFetchedDisplayCars: DisplayCar[] = [];

export const useCarSearch = (): UseCarSearchReturn => {
  const [displayCars, setDisplayCars] = useState<DisplayCar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T,>(requestFn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await requestFn();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(message);
      console.error('API Request Error:', err);
      if (Array.isArray(err)) return [] as T;
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeCarsWithOffersAndDealerships = async (
    cars: Car[],
    offers: CarOffer[],
  ): Promise<DisplayCar[]> => {
    const offersMap = new Map<number, CarOffer[]>();
    const dealershipIds = new Set<number>();

   for (const offer of offers) {
      let offersList = offersMap.get(offer.carId);

      if (!offersList) {
        offersList = [];
        offersMap.set(offer.carId, offersList);
      }

      offersList.push(offer);
      dealershipIds.add(offer.dealershipId);
    }
    const dealershipMap = new Map<number, Dealership>();
    try {
      const dealershipPromises = Array.from(dealershipIds).map(id =>
        dealershipService.getDealershipById(id).catch(err => {
          console.error(`Failed to fetch dealership ${id}`, err);
          return null;
        }),
      );
      const dealerships = (await Promise.all(dealershipPromises)).filter(d => d !== null) as Dealership[];
      for (const d of dealerships) {
        dealershipMap.set(d.id, d);
      }
    } catch (err) {
      console.error('Error fetching some dealerships', err);
    }

    return cars.map(car => {
      const carOffers = offersMap.get(Number(car.id)) || [];
      
      const populatedOffers = carOffers.map(offer => ({
        ...offer,
        dealership: dealershipMap.get(offer.dealershipId),
      }));

      return {
        car: car,
        offers: populatedOffers,
      };
    });
  };

  const fetchAllCarsAndOffers = useCallback(async (): Promise<DisplayCar[]> => {
    return handleRequest(async () => {
      const [carsData, offersData] = await Promise.all([
        carService.getAllCars(),
        carOfferService.getAll(),
      ]);
      const mergedData = await mergeCarsWithOffersAndDealerships(carsData, offersData);
      allFetchedDisplayCars = mergedData;
      setDisplayCars(mergedData);
      return mergedData;
    });
  }, [handleRequest]);

  const searchCarsAndOffers = useCallback(
    async (filters: SearchFiltersState): Promise<DisplayCar[]> => {
      setLoading(true);
      setError(null);
      try {
        let carsToFilter = allFetchedDisplayCars;
        if (carsToFilter.length === 0) {
          carsToFilter = await fetchAllCarsAndOffers();
        }

        const filtered = carsToFilter.filter((displayCar: DisplayCar) => {
          const { car, offers } = displayCar;

          const keywordLower = filters.keyword?.toLowerCase() ?? '';
          const brandLower = filters.brand?.toLowerCase() ?? '';

          const matchesKeyword =
            !filters.keyword ||
            car.brand?.toLowerCase().includes(keywordLower) ||
            car.model?.toLowerCase().includes(keywordLower) ||
            car.description?.toLowerCase().includes(keywordLower) ||
            offers.some(
              offer =>
                offer.dealershipNotes?.toLowerCase().includes(keywordLower) ||
                offer.dealership?.businessName?.toLowerCase().includes(keywordLower),
            );

          const priceFilterActive = !!filters.minPrice || !!filters.maxPrice;
          
          const matchesPrice =
          !priceFilterActive ||
          offers.some(
            offer =>
              (!filters.minPrice || offer.price >= Number(filters.minPrice)) &&
              (!filters.maxPrice || offer.price <= Number(filters.maxPrice)),
          );

        if (priceFilterActive && offers.length === 0) {
          return false;
        }

          const matchesMinYear = !filters.minYear || car.year >= Number(filters.minYear);
          const matchesMaxYear = !filters.maxYear || car.year <= Number(filters.maxYear);
          const matchesBrand = !filters.brand || car.brand?.toLowerCase() === brandLower;
          const matchesFuelType = !filters.fuelType || car.fuelType === filters.fuelType;
          const matchesTransmission =
            !filters.transmission || car.transmission === filters.transmission;

          return (
            matchesKeyword &&
            matchesPrice &&
            matchesMinYear &&
            matchesMaxYear &&
            matchesBrand &&
            matchesFuelType &&
            matchesTransmission
          );
        });

        setDisplayCars(filtered);
        return filtered;
      } catch (err: any) {
        const message = err.message || 'Failed to search cars/offers';
        setError(message);
        console.error('Search Error:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [fetchAllCarsAndOffers],
  );

  const getDisplayCarById = useCallback(async (carId: number | string): Promise<DisplayCar | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const numericCarId = Number(carId);

      const cachedData = allFetchedDisplayCars.find(dc => dc.car.id === numericCarId);
      if (cachedData) {
        return cachedData;
      }

      const car = await carService.getCarById(numericCarId);

      // TODO: change to something similar to const allOffersForCar = await carOfferService.getOffersByCarId(numericCarId);
      const allOffers = await carOfferService.getAll();
      
      const specificOffersData = allOffers.filter(o => o.carId === numericCarId);

      let populatedOffers: (CarOffer & { dealership?: Dealership })[] = [];

      if (specificOffersData.length > 0) {
        const dealershipIds = new Set(specificOffersData.map(o => o.dealershipId));
        const dealershipMap = new Map<number, Dealership>();

        try {
          const dealershipPromises = Array.from(dealershipIds).map(id =>
            dealershipService.getDealershipById(id).catch(err => {
              console.error(`Failed to fetch dealership ${id}`, err);
              return null;
            }),
          );
          const dealerships = (await Promise.all(dealershipPromises)).filter(d => d !== null) as Dealership[];
          for (const d of dealerships) {
            dealershipMap.set(d.id, d);
          }
        } catch (dealershipError) {
          console.error(`Error fetching dealerships`, dealershipError);
        }

        populatedOffers = specificOffersData.map(offer => ({
          ...offer,
          dealership: dealershipMap.get(offer.dealershipId),
        }));
      }
      return {
        car: car,
        offers: populatedOffers,
      };
    } catch (err: any) {
      const message = err.message || `Failed to get car data for ID ${carId}`;
      setError(message);
      console.error('Get Car Data By ID Error:', err);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    displayCars,
    loading,
    error,
    fetchAllCarsAndOffers,
    searchCarsAndOffers,
    getDisplayCarById,
    setDisplayCars: useCallback((newDisplayCars: DisplayCar[]) => {
      setDisplayCars(newDisplayCars);
      allFetchedDisplayCars = newDisplayCars;
    }, []),
    setError: useCallback((error: string | null) => setError(error), []),
  };
};