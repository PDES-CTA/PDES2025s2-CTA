export const FUEL_TYPES = [
  { value: 'NAFTA', label: 'Nafta' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELECTRICO', label: 'Eléctrico' },
  { value: 'GNC', label: 'GNC' }
];

export const TRANSMISSION_TYPES = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATICA', label: 'Automática' },
  { value: 'SEMI_AUTOMATICA', label: 'Semi-automática' }
];

export const DEFAULT_FILTERS = {
  keyword: '',
  minPrice: '',
  maxPrice: '',
  minYear: '',
  maxYear: '',
  brand: '',
  fuelType: '',
  transmission: ''
};

export const API_ENDPOINTS = {
  CARS: '/cars',
  CARS_SEARCH: '/cars/search',
  CAR_BY_ID: '/cars',
  CARS_BY_DEALERSHIP: '/cars/dealership'
};