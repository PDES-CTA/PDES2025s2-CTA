// Roles de usuario
export const ROLES = {
  BUYER: 'BUYER',
  DEALERSHIP: 'DEALERSHIP',
  ADMIN: 'ADMIN'
};

// Tipos de combustible
export const FUEL_TYPES = {
  NAFTA: 'NAFTA',
  DIESEL: 'DIESEL',
  HIBRIDO: 'HIBRIDO',
  ELECTRICO: 'ELECTRICO',
  GNC: 'GNC'
};

export const FUEL_TYPE_LABELS = {
  NAFTA: 'Nafta',
  DIESEL: 'Diésel',
  HIBRIDO: 'Híbrido',
  ELECTRICO: 'Eléctrico',
  GNC: 'GNC'
};

// Tipos de transmisión
export const TRANSMISSION_TYPES = {
  MANUAL: 'MANUAL',
  AUTOMATICA: 'AUTOMATICA',
  SEMI_AUTOMATICA: 'SEMI_AUTOMATICA'
};

export const TRANSMISSION_TYPE_LABELS = {
  MANUAL: 'Manual',
  AUTOMATICA: 'Automática',
  SEMI_AUTOMATICA: 'Semi-automática'
};

// Estados de compra
export const PURCHASE_STATUS = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADA: 'CONFIRMADA',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA'
};

export const PURCHASE_STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada'
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CARS: '/cars',
  CAR_DETAIL: '/cars/:id',
  FAVORITES: '/favorites',
  PURCHASES: '/purchases',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PROFILE: '/profile'
};

// Helper para generar rutas dinámicas
export const generateRoute = {
  carDetail: (id) => `/cars/${id}`,
  userProfile: (id) => `/profile/${id}`
};