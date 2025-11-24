import { ChangeEvent } from 'react';
import { Button, Input, Select } from '../atoms';
import styles from './SearchFilters.module.css';

const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'GNC'] as const;
const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC'] as const;

export interface SearchFiltersState {
  keyword: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  brand: string;
  fuelType: string;
  transmission: string;
}

interface SearchFiltersProps {
  readonly filters: SearchFiltersState;
  readonly onFiltersChange: (updater: (prev: SearchFiltersState) => SearchFiltersState) => void;
  readonly onSearch: () => void;
  readonly onClearFilters: () => void;
  readonly showFilters: boolean;
  readonly onToggleFilters: () => void;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  showFilters,
  onToggleFilters
}: SearchFiltersProps) {
  const handleFilterChange = (key: keyof SearchFiltersState, value: string) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.quickSearch}>
        <Input
          type="text"
          placeholder="Search by brand, model or keyword..."
          value={filters.keyword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('keyword', e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              label="Maximum Price"
              type="number"
              placeholder="Ex: 2000000"
              value={filters.maxPrice}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('maxPrice', e.target.value)}
            />
            <Input
              label="Minimum Year"
              type="number"
              placeholder="Ex: 2015"
              value={filters.minYear}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('minYear', e.target.value)}
            />
            <Input
              label="Maximum Year"
              type="number"
              placeholder="Ex: 2024"
              value={filters.maxYear}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('maxYear', e.target.value)}
            />
            <Input
              label="Brand"
              type="text"
              placeholder="Ex: Toyota, Ford..."
              value={filters.brand}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('brand', e.target.value)}
            />
            <Select
              label="Fuel"
              value={filters.fuelType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('fuelType', e.target.value)}
              options={[
                { value: '', label: 'All' },
                ...FUEL_TYPES.map(type => ({ value: type, label: type }))
              ]}
            />
            <Select
              label="Transmission"
              value={filters.transmission}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('transmission', e.target.value)}
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