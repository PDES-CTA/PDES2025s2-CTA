export type FuelType = 'NAFTA' | 'DIESEL' | 'HIBRIDO' | 'ELECTRICO' | 'GNC';
export type TransmissionType = 'MANUAL' | 'AUTOMATICA' | 'SEMI_AUTOMATICA';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatMileage = (mileage: number): string => {
  return `${mileage.toLocaleString()} km`;
};

export const getFuelTypeClass = (fuelType: FuelType): string => {
  const classes: Record<FuelType, string> = {
    'NAFTA': 'fuel-nafta',
    'DIESEL': 'fuel-diesel',
    'HIBRIDO': 'fuel-hybrid',
    'ELECTRICO': 'fuel-electric',
    'GNC': 'fuel-gnc'
  };
  return classes[fuelType] || '';
};

export const getTransmissionClass = (transmission: TransmissionType): string => {
  const classes: Record<TransmissionType, string> = {
    'MANUAL': 'transmission-manual',
    'AUTOMATICA': 'transmission-auto',
    'SEMI_AUTOMATICA': 'transmission-semi'
  };
  return classes[transmission] || '';
};

export const getFuelTypeLabel = (fuelType: FuelType): string => {
  const labels: Record<FuelType, string> = {
    'NAFTA': 'Nafta',
    'DIESEL': 'Diesel',
    'HIBRIDO': 'Híbrido',
    'ELECTRICO': 'Eléctrico',
    'GNC': 'GNC'
  };
  return labels[fuelType] || fuelType;
};

export const getTransmissionLabel = (transmission: TransmissionType): string => {
  const labels: Record<TransmissionType, string> = {
    'MANUAL': 'Manual',
    'AUTOMATICA': 'Automática',
    'SEMI_AUTOMATICA': 'Semi-automática'
  };
  return labels[transmission] || transmission;
};