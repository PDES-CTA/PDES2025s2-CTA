import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { authService, carService, carOfferService } from '../services/api';
import { ErrorMessage } from '../components/molecules';
import { LoadingSpinner } from '../components/atoms';
import SmallButton from '../components/atoms/SmallButton';
import { Car } from '../types/car';
import styles from './CarPoolPage.module.css';
import CreateOfferModal from '../components/organisms/CreateOfferModal';
import CarCarousel from '../components/organisms/CarCarousel';

export default function CarPoolPage() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const fetchAvailableCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user (dealership)
      const user = await authService.getLoggedUser();
      if (!user?.id) {
        throw new Error('No dealership found for current user');
      }

      // Fetch all cars and dealership's offers in parallel
      const [carsData, dealershipOffers] = await Promise.all([
        carService.getAllCars(),
        carOfferService.getByDealershipId(user.id)
      ]);

      // Get car IDs that already have offers from this dealership
      const offeredCarIds = new Set(dealershipOffers.map(offer => offer.car.id));

      // Filter out cars that already have offers
      const availableCars = carsData.filter(car => !offeredCarIds.has(car.id));

      setCars(availableCars);
      setFilteredCars(availableCars);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load available cars';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCars(cars);
    } else {
      const filtered = cars.filter(car => {
        const searchLower = searchTerm.toLowerCase();
        return (
          car.brand.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.year.toString().includes(searchLower) ||
          car.color.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCars(filtered);
    }
  }, [searchTerm, cars]);

  const handleViewDetails = (carId: string | number) => {
    navigate(`/cars/${carId}`);
  };

  const handleAddNewOffer = (carId: string | number) => {
    const car = filteredCars.find(c => c.id === carId);
    if (car) {
      setSelectedCar(car);
    }
  };

  const handleCreateOffer = async (offerData: {
    price: number;
    available: boolean;
    dealershipNotes?: string;
  }) => {
    if (!selectedCar) return;

    try {
      // Get the current dealership user
      const user = await authService.getLoggedUser();
      if (!user?.id) {
        throw new Error('No dealership found for current user');
      }

      await carOfferService.createCarOffer({
        carId: selectedCar.id,
        dealershipId: user.id,
        price: offerData.price,
        dealershipNotes: offerData.dealershipNotes || null,
      });
      
      setSelectedCar(null);
      // Navigate to dealership offers page
      navigate('/offers');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create offer';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <ErrorMessage error={error} onRetry={fetchAvailableCars} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Car Pool</h1>
            <p className={styles.subtitle}>
              Browse {filteredCars.length} available {filteredCars.length === 1 ? 'car' : 'cars'}
            </p>
          </div>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search by brand, model, year, or color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <SmallButton onClick={() => {}} variant="secondary">
            <Filter size={18} />
            Filters
          </SmallButton>
        </div>

        {filteredCars.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <Search className={styles.emptyStateIcon} size={64} />
              <h2 className={styles.emptyStateTitle}>
                {searchTerm ? 'No Cars Found' : 'No Cars Available'}
              </h2>
              <p className={styles.emptyStateText}>
                {searchTerm 
                  ? `No cars match "${searchTerm}". Try a different search term.`
                  : 'There are no cars available in the pool at the moment. Check back later!'
                }
              </p>
              {searchTerm && (
                <SmallButton onClick={() => setSearchTerm('')} variant="primary">
                  Clear Search
                </SmallButton>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <CarCarousel 
              cars={filteredCars} 
              onAddOffer={handleAddNewOffer}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}

        {selectedCar && (
          <CreateOfferModal
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
            onSubmit={handleCreateOffer}
          />
        )}
      </div>
    </div>
  );
}