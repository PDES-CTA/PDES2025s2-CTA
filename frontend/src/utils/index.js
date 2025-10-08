// ============ FORMATTERS ============

export const formatPrice = (price) => {
  if (!price && price !== 0) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatKilometers = (km) => {
  if (!km && km !== 0) return '0 km';
  return `${new Intl.NumberFormat('es-AR').format(km)} km`;
};

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ============ VALIDATORS ============

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidDNI = (dni) => {
  const cleanDni = dni.replace(/\D/g, '');
  return /^\d{7,8}$/.test(cleanDni);
};

export const isValidCUIT = (cuit) => {
  const cleanCuit = cuit.replace(/[-_]/g, '');
  return /^\d{11}$/.test(cleanCuit);
};

export const isValidPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^\d{10}$/.test(cleanPhone);
};

// ============ HELPERS ============

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};