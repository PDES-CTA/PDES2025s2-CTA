import { Button, Input, Select } from '../atoms';
import styles from './SearchFilters.module.css';

const FUEL_TYPES = ['NAFTA', 'DIESEL', 'HIBRIDO', 'ELECTRICO', 'GNC'];
const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATICA', 'SEMI_AUTOMATICA'];

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
          placeholder="Buscar por marca, modelo o palabra clave..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.searchActions}>
          <Button onClick={onSearch} variant="primary">
            Buscar
          </Button>
          <Button onClick={onToggleFilters} variant="secondary">
            Filtros {showFilters ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filtersGrid}>
            <Input
              label="Precio Mínimo"
              type="number"
              placeholder="Ej: 500000"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              label="Precio Máximo"
              type="number"
              placeholder="Ej: 2000000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
            <Input
              label="Año Mínimo"
              type="number"
              placeholder="Ej: 2015"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
            />
            <Input
              label="Año Máximo"
              type="number"
              placeholder="Ej: 2024"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            />
            <Input
              label="Marca"
              type="text"
              placeholder="Ej: Toyota, Ford..."
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />
            <Select
              label="Combustible"
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                ...FUEL_TYPES.map(type => ({ value: type, label: type }))
              ]}
            />
            <Select
              label="Transmisión"
              value={filters.transmission}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              options={[
                { value: '', label: 'Todas' },
                ...TRANSMISSION_TYPES.map(type => ({ value: type, label: type }))
              ]}
            />
            <div className={styles.clearAction}>
              <Button onClick={onClearFilters} variant="neutral" fullWidth>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}