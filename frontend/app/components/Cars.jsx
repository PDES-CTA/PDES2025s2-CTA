'use client';
import { useState, useEffect } from 'react';
import CarList from './CarList';
import CarDetail from './CarDetail';
import SearchFilters from './SearchFilters';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';
import { useCarSearch } from './hooks/useCarSearch';
import styles from './styles/Cars.module.css';

export default function Cars() {
  const [selectedCarId, setSelectedCarId] = useState(null);
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

  const {
    cars,
    loading,
    error,
    fetchAllCars,
    searchCars,
    getCarById
  } = useCarSearch();

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
    setSelectedCarId(carId);
  };

  const handleBackToList = () => {
    setSelectedCarId(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={fetchAllCars} />;

  if (selectedCarId) {
    return (
      <CarDetail 
        carId={selectedCarId} 
        onBack={handleBackToList}
        getCarById={getCarById}
      />
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Catálogo de Autos</h1>
        <p className={styles.subtitle}>Encontra el auto perfecto para vos</p>
      </header>

      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <CarList
        cars={cars}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}