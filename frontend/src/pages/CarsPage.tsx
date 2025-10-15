import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { authService } from '../services/api';
import { CarList, SearchFilters } from '../components/organisms';
import { SearchFiltersState } from '../components/organisms/SearchFilters';
import { ErrorMessage } from '../components/molecules';
import { LoadingSpinner } from '../components/atoms';
import styles from './CarsPage.module.css';
import { useCarSearch } from '../hooks';

export default function CarsPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
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

  const { carOffers, loading, error, fetchAllCarOffers, searchCarOffers } = useCarSearch();

  useEffect(() => {
    fetchAllCarOffers();
  }, [fetchAllCarOffers]);

  const handleSearch = async () => {
    await searchCarOffers(filters);
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
    fetchAllCarOffers();
  };

  const handleViewDetails = (carId: string | number) => {
    navigate(`/cars/${carId}`);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={fetchAllCarOffers} />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Available Cars</h1>
            <p className={styles.subtitle}>Find the perfect car for you</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            Log Out
          </button>
        </div>

        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        <CarList carOffers={carOffers} onViewDetails={handleViewDetails} />
      </div>
    </div>
  );
}