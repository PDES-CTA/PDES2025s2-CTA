// User roles
export const ROLES = {
  BUYER: 'BUYER',
  DEALERSHIP: 'DEALERSHIP',
  ADMINISTRATOR: 'ADMINISTRATOR'
};

// Fuel types
export const FUEL_TYPES = {
  GASOLINE: 'GASOLINE',
  DIESEL: 'DIESEL',
  HYBRID: 'HYBRID',
  ELECTRIC: 'ELECTRIC',
  GNC: 'GNC'
};

export const FUEL_TYPE_LABELS = {
  GASOLINE: 'Gasoline',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric',
  GNC: 'CNG'
};

// Transmission types
export const TRANSMISSION_TYPES = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
  SEMI_AUTOMATIC: 'SEMI_AUTOMATIC'
};

export const TRANSMISSION_TYPE_LABELS = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatic',
  SEMI_AUTOMATIC: 'Semi-automatic'
};

// Purchase statuses
export const PURCHASE_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const PURCHASE_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CHECK: 'CHECK',
  CREDIT_CARD: 'CREDIT_CARD'
};

export const PAYMENT_METHOD_LABELS = {
  CASH: 'Cash',
  CHECK: 'Check',
  CREDIT_CARD: 'Credit Card'
};

// Report types
export const REPORT_TYPES = {
  MOST_SOLD_CARS: 'MOST_SOLD_CARS',
  TOP_BUYERS: 'TOP_BUYERS',
  FAVORITE_CARS: 'FAVORITE_CARS',
  TOP_AGENCIES: 'TOP_AGENCIES'
};

export const REPORT_TYPE_LABELS = {
  MOST_SOLD_CARS: 'Most Sold Cars',
  TOP_BUYERS: 'Top Buyers',
  FAVORITE_CARS: 'Favorite Cars',
  TOP_AGENCIES: 'Top Agencies'
};

// Application routes
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

// Helper for dynamic routes
export const generateRoute = {
  carDetail: (id: string | number): string => `/cars/${id}`,
  userProfile: (id: string | number): string => `/profile/${id}`
};