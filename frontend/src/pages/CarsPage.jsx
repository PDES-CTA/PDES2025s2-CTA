import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { carService, authService } from '../services/api';
import { CarList, SearchFilters } from '../components/organisms';
import { ErrorMessage } from '../components/molecules';
import { LoadingSpinner } from '../components/atoms';
import styles from './CarsPage.module.css';
import { useCarSearch } from '../hooks';

export default function CarsPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    brand: '',
    fuelType: '',
    transmission: ''
  });

  const { cars, loading, error, fetchAllCars, searchCars } = useCarSearch();

  useEffect(() => {
    fetchAllCars();
  }, [fetchAllCars]);

  const handleSearch = async () => {
    await searchCars(filters);
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
    fetchAllCars();
  };

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={fetchAllCars} />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Autos Disponibles</h1>
            <p className={styles.subtitle}>Encontrá el auto perfecto para vos</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            Cerrar Sesión
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

        <CarList cars={cars} onViewDetails={handleViewDetails} />
      </div>
    </div>
  );
}