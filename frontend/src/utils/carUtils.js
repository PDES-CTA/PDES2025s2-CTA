export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatMileage = (mileage) => {
  return `${mileage.toLocaleString()} km`;
};

export const getFuelTypeClass = (fuelType) => {
  const classes = {
    'NAFTA': 'fuel-nafta',
    'DIESEL': 'fuel-diesel',
    'HIBRIDO': 'fuel-hybrid',
    'ELECTRICO': 'fuel-electric',
    'GNC': 'fuel-gnc'
  };
  return classes[fuelType] || '';
};

export const getTransmissionClass = (transmission) => {
  const classes = {
    'MANUAL': 'transmission-manual',
    'AUTOMATICA': 'transmission-auto',
    'SEMI_AUTOMATICA': 'transmission-semi'
  };
  return classes[transmission] || '';
};

export const getFuelTypeLabel = (fuelType) => {
  const labels = {
    'NAFTA': 'Nafta',
    'DIESEL': 'Diesel',
    'HIBRIDO': 'Híbrido',
    'ELECTRICO': 'Eléctrico',
    'GNC': 'GNC'
  };
  return labels[fuelType] || fuelType;
};

export const getTransmissionLabel = (transmission) => {
  const labels = {
    'MANUAL': 'Manual',
    'AUTOMATICA': 'Automática',
    'SEMI_AUTOMATICA': 'Semi-automática'
  };
  return labels[transmission] || transmission;
};