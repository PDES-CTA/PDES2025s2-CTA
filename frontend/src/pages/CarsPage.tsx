import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShoppingBag } from 'lucide-react';
import { authService } from '../services/api';
import { CarList, SearchFilters } from '../components/organisms';
import { SearchFiltersState } from '../components/organisms/SearchFilters';
import { ErrorMessage } from '../components/molecules';
import { LoadingSpinner } from '../components/atoms';
import { ROUTES, generateRoute } from '../constants';
import styles from './CarsPage.module.css';
import { useCarSearch } from '../hooks';

export default function CarsPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [filters, setFilters] = useState<SearchFiltersState>({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    brand: '',
    fuelType: '',
    transmission: ''
  });

  const {
      displayCars,
      loading,
      error,
      fetchAllCarsAndOffers,
      searchCarsAndOffers
  } = useCarSearch();

  useEffect(() => {
    fetchAllCarsAndOffers();
    
    // Fetch current user
    const fetchUser = async () => {
      try {
        const user = await authService.getLoggedUser();
        setUserId(user.id);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, [fetchAllCarsAndOffers]);

  const handleSearch = async () => {
    await searchCarsAndOffers(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      brand: '',
      fuelType: '',
      transmission: ''
    });
    fetchAllCarsAndOffers();
  };

  const handleViewDetails = (carId: string | number) => {
    navigate(generateRoute.carDetail(carId));
  };

  const handleMyPurchases = () => {
    if (userId) {
      navigate(generateRoute.userPurchases(userId));
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate(ROUTES.LOGIN);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={fetchAllCarsAndOffers} />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Available Cars</h1>
            <p className={styles.subtitle}>Find the perfect car for you</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={handleMyPurchases} className={styles.purchasesButton}>
              <ShoppingBag size={20} />
              My Purchases
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>

        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        <CarList displayCars={displayCars} onViewDetails={handleViewDetails} />
      </div>
    </div>
  );
}