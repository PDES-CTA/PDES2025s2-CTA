import { Button, Input, Select } from '../atoms';
import styles from './SearchFilters.module.css';

const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'GNC'];
const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC'];

export default function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  showFilters,
  onToggleFilters
}) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.quickSearch}>
        <Input
          type="text"
          placeholder="Search by brand, model or keyword..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.searchActions}>
          <Button onClick={onSearch} variant="primary">
            Search
          </Button>
          <Button onClick={onToggleFilters} variant="secondary">
            Filters {showFilters ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filtersGrid}>
            <Input
              label="Minimum Price"
              type="number"
              placeholder="Ex: 500000"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              label="Maximum Price"
              type="number"
              placeholder="Ex: 2000000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
            <Input
              label="Minimum Year"
              type="number"
              placeholder="Ex: 2015"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
            />
            <Input
              label="Maximum Year"
              type="number"
              placeholder="Ex: 2024"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            />
            <Input
              label="Brand"
              type="text"
              placeholder="Ex: Toyota, Ford..."
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />
            <Select
              label="Fuel"
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              options={[
                { value: '', label: 'All' },
                ...FUEL_TYPES.map(type => ({ value: type, label: type }))
              ]}
            />
            <Select
              label="Transmission"
              value={filters.transmission}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              options={[
                { value: '', label: 'All' },
                ...TRANSMISSION_TYPES.map(type => ({ value: type, label: type }))
              ]}
            />
            <div className={styles.clearAction}>
              <Button onClick={onClearFilters} variant="neutral" fullWidth>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}