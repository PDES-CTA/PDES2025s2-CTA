// ============ FORMATTERS ============
export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatKilometers = (km: number | null | undefined): string => {
  if (km === null || km === undefined) return '0 km';
  return `${new Intl.NumberFormat('es-AR').format(km)} km`;
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ============ VALIDATORS ============
export const isValidEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (email.length > 254) return false;
  
  return regex.test(email);
};

export const isValidDNI = (dni: string): boolean => {
  const cleanDni = dni.replace(/\D/g, '');
  return /^\d{7,8}$/.test(cleanDni);
};

export const isValidCUIT = (cuit: string): boolean => {
  const cleanCuit = cuit.replace(/[-_]/g, '');
  return /^\d{11}$/.test(cleanCuit);
};

export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^\d{10}$/.test(cleanPhone);
};

// ============ HELPERS ============
export const truncateText = (text: string | null | undefined, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const cleanObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce<Partial<T>>((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      (acc as Record<string, unknown>)[key] = value;
    }
    return acc;
  }, {});
};

export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};