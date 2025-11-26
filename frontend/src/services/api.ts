import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { Car } from "../types/car";
import { CarOffer } from "../types/carOffer";
import { Purchase } from "../types/purchase";

// Centralized configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Configured axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add the auth token
/* v8 ignore next 11 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authorization_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

// Response interceptor for global error handling
/* v8 ignore next 13 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authorization_token");
      if (globalThis.location.pathname !== '/login') {
        globalThis.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ==================== TYPES ====================
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  dni?: string;
  cuit?: string;
  businessName?: string;
  city?: string;
  province?: string;
  description?: string;
  role: 'BUYER' | 'DEALERSHIP' | 'ADMINISTRATOR';
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  token?: string;
  user: User;
}

//interface SearchFilters {
//  keyword?: string;
//  minPrice?: number;
//  maxPrice?: number;
//  minYear?: number;
//  maxYear?: number;
//  brand?: string;
//  fuelType?: string;
//  transmission?: string;
//}

interface Favorite {
  id: number;
  carId: number;
  car: Car;
  rating?: number;
  comment?: string;
  createdAt: string;
}

interface ReviewData {
  rating: number;
  comment: string;
}

interface PurchaseData {
  buyerId: number;
  carOfferId: number;
  finalPrice: number;
  purchaseDate?: string;
  purchaseStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'CHECK';
  observations?: string;
}

interface Dealership {
  id: number;
  businessName: string;
  cuit: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  registrationDate: string;
  active: boolean;
  description?: string;
}

interface Statistics {
  totalCars: number;
  totalUsers: number;
  totalPurchases: number;
  totalRevenue: number;
}

interface TopSoldCar extends Car {
  salesCount: number;
}

interface TopBuyer extends User {
  purchaseCount: number;
  totalSpent: number;
}

interface TopFavoriteCar extends Car {
  favoriteCount: number;
}

interface TopDealership extends Dealership {
  salesCount: number;
  totalRevenue: number;
}

// ==================== AUTH SERVICE ====================
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
    const token = response.headers["authorization"] || response.data.token;
    if (token) {
      localStorage.setItem("authorization_token", token);
    }
    return response.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await apiClient.post<User>("/auth/register", userData);
    return response.data;
  },

  async getLoggedUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("authorization_token");
    globalThis.location.href = "/login";
  }
};

// ==================== CAR OFFER SERVICE ====================

export const carOfferService = {
  getAll: async (): Promise<CarOffer[]> => {
    const response = await apiClient.get<CarOffer[]>('/offer/available');
    return response.data;
  },
  getById: async (id: string | number): Promise<CarOffer> => {
    const response = await apiClient.get<CarOffer>(`/offer/${id}`);
    return response.data;
  },
  getByDealershipId: async (dealershipId: string | number): Promise<CarOffer[]> => {
    const response = await apiClient.get<CarOffer[]>(`/offer/dealership/${dealershipId}`);
    return response.data;
  },
  getAvailableByDealershipId: async (dealershipId: string | number): Promise<CarOffer[]> => {
    const response = await apiClient.get<CarOffer[]>(`/offer/dealership/${dealershipId}/available`);
    return response.data;
  },
  markAsUnavailable: async (id: string | number): Promise<void> => {
    await apiClient.patch(`/offer/${id}/unavailable`);
  },
  deleteCarOffer: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/offer/${id}`);
  },
  updateCarOffer: async (id: string | number, data: unknown): Promise<CarOffer> => {
    const response = await apiClient.put<CarOffer>(`/offer/${id}`, data);
    return response.data;
  },
  createCarOffer: async (data: unknown): Promise<CarOffer> => {
    const response = await apiClient.post<CarOffer>('/offer', data);
    return response.data;
  },
};

// ==================== CAR SERVICE ====================
export interface CarSearchQuery {
    keyword?: string;
    minYear?: number | string;
    maxYear?: number | string;
    brand?: string;
    fuelType?: string;
    transmission?: string;
}

export const carService = {
  async getAllCars(): Promise<Car[]> {
    try {
      const response = await apiClient.get<Car[]>('/cars');
      return response.data;
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  },

  async getCarById(id: string | number): Promise<Car> {
    try {
      const response = await apiClient.get<Car>(`/cars/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching car with id ${id}:`, error);
      throw error;
    }
  },

  async searchCars(filters: CarSearchQuery): Promise<Car[]> {
     try {
       const params = Object.fromEntries(
         Object.entries(filters).filter(([, value]) => value != null && value !== '')
       );
       const response = await apiClient.get<Car[]>('/cars/search', { params });
       return response.data;
     } catch (error) {
       console.error("Error searching cars:", error);
       throw error;
     }
   },

  async getCarsByDealership(dealershipId: string | number): Promise<Car[]> {
    const response = await apiClient.get<Car[]>(`/cars/dealership/${dealershipId}`);
    return response.data;
  },

  async createCar(carData: Partial<Car>): Promise<Car> {
    const response = await apiClient.post<Car>("/cars", carData);
    return response.data;
  },

  async updateCar(carId: string | number, carData: Partial<Car>): Promise<Car> {
    const response = await apiClient.put<Car>(`/cars/${carId}`, carData);
    return response.data;
  },

  async deleteCar(carId: string | number): Promise<void> {
    const response = await apiClient.delete(`/cars/${carId}`);
    return response.data;
  }
};

// ==================== BUYER SERVICE ====================
export const buyerService = {
  async createBuyer(buyerData: RegisterData): Promise<User> {
    const response = await apiClient.post<User>("/buyer", buyerData);
    return response.data;
  },

  async getFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<Favorite[]>("/buyers/favorites");
    return response.data;
  },

  async addFavorite(carId: string | number): Promise<Favorite> {
    const response = await apiClient.post<Favorite>(`/buyers/favorites/${carId}`);
    return response.data;
  },

  async removeFavorite(favoriteId: string | number): Promise<void> {
    const response = await apiClient.delete(`/buyers/favorites/${favoriteId}`);
    return response.data;
  },

  async updateReview(favoriteId: string | number, reviewData: ReviewData): Promise<Favorite> {
    const response = await apiClient.put<Favorite>(`/buyers/favorites/${favoriteId}/review`, {
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response.data;
  }
};

// ==================== PURCHASE SERVICE ====================
export const purchaseService = {
  async createPurchase(purchaseData: PurchaseData): Promise<Purchase> {
    const response = await apiClient.post<Purchase>("/purchases", {
      buyerId: purchaseData.buyerId,
      carOfferId: purchaseData.carOfferId,
      finalPrice: purchaseData.finalPrice,
      purchaseStatus: purchaseData.purchaseStatus || 'PENDING',
      paymentMethod: purchaseData.paymentMethod,
      observations: purchaseData.observations
    });
    return response.data;
  },
  async getPurchaseById(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.get<Purchase>(`/purchases/${purchaseId}`);
    return response.data;
  },

  async getPurchasesByBuyerId(buyerId: string | number): Promise<Purchase[]> {
    const response = await apiClient.get<Purchase[]>(`/purchases/buyer/${buyerId}`);
    return response.data;
  },

  async getPurchasesByDealershipId(dealershipId: string | number): Promise<Purchase[]> {
    const response = await apiClient.get<Purchase[]>(`/purchases/dealership/${dealershipId}`);
    return response.data;
  },

  async confirmPurchase(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.patch<Purchase>(`/purchases/${purchaseId}/confirmed`);
    return response.data;
  },

  async markPurchaseAsDelivered(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.patch<Purchase>(`/purchases/${purchaseId}/delivered`);
    return response.data;
  },

  async cancelPurchase(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.patch<Purchase>(`/purchases/${purchaseId}/canceled`);
    return response.data;
  }
};

// ==================== DEALERSHIP SERVICE ====================
export const dealershipService = {
  async createDealership(dealershipData: RegisterData): Promise<User[]> {
    const response = await apiClient.post<User[]>("/dealerships", dealershipData);
    return response.data;
  },

  async getAllDealerships(): Promise<Dealership[]> {
    const response = await apiClient.get<Dealership[]>("/dealerships");
    return response.data;
  },

  async getDealershipById(dealershipId: string | number): Promise<Dealership> {
    const response = await apiClient.get<Dealership>(`/dealerships/${dealershipId}`);
    return response.data;
  },

  async getSales(): Promise<Purchase[]> {
    const response = await apiClient.get<Purchase[]>("/dealerships/sales");
    return response.data;
  }
};

// ==================== ADMIN SERVICE ====================
export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/admin/users");
    return response.data;
  },

  async getStatistics(): Promise<Statistics> {
    const response = await apiClient.get<Statistics>("/admin/statistics");
    return response.data;
  },

  async getTopSoldCars(limit: number = 5): Promise<TopSoldCar[]> {
    const response = await apiClient.get<TopSoldCar[]>("/admin/reports/top-sold-cars", {
      params: { limit }
    });
    return response.data;
  },

  async getTopBuyers(limit: number = 5): Promise<TopBuyer[]> {
    const response = await apiClient.get<TopBuyer[]>("/admin/reports/top-buyers", {
      params: { limit }
    });
    return response.data;
  },

  async getTopFavoriteCars(limit: number = 5): Promise<TopFavoriteCar[]> {
    const response = await apiClient.get<TopFavoriteCar[]>("/admin/reports/top-favorites", {
      params: { limit }
    });
    return response.data;
  },

  async getTopDealerships(limit: number = 5): Promise<TopDealership[]> {
    const response = await apiClient.get<TopDealership[]>("/admin/reports/top-dealerships", {
      params: { limit }
    });
    return response.data;
  },

  async getDashboardOverview() {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  async getAllBuyers() {
    const response = await apiClient.get('/admin/buyers');
    return response.data;
  },

  async getAllDealerships() {
    const response = await apiClient.get('/admin/dealerships');
    return response.data;
  },

  async getUserFavorites(userId: number) {
    const response = await apiClient.get(`/admin/users/${userId}/favorites`);
    return response.data;
  },

  async getCarFavoriteCount(carId: number) {
    const response = await apiClient.get(`/admin/cars/${carId}/favorite-count`);
    return response.data;
  },

  async getAllFavoritesWithReviews() {
    const response = await apiClient.get('/admin/favorites-with-reviews');
    return response.data;
  },

  async getCarReviews(carId: number) {
    const response = await apiClient.get(`/admin/cars/${carId}/reviews`);
    return response.data;
  },

  async getUserReviews(userId: number) {
    const response = await apiClient.get(`/admin/users/${userId}/reviews`);
    return response.data;
  },

  async getTopRatedCars() {
    const response = await apiClient.get('/admin/top-rated-cars');
    return response.data;
  },

  async getAllPurchases() {
    const response = await apiClient.get('/admin/purchases');
    return response.data;
  },

  async getUserPurchases(userId: number) {
    const response = await apiClient.get(`/admin/users/${userId}/purchases`);
    return response.data;
  },

  async getDealershipPurchases(dealershipId: number) {
    const response = await apiClient.get(`/admin/dealerships/${dealershipId}/purchases`);
    return response.data;
  },

  async getDealershipRevenue(dealershipId: number) {
    const response = await apiClient.get(`/admin/dealerships/${dealershipId}/revenue`);
    return response.data;
  },

  async getTotalSystemRevenue() {
    const response = await apiClient.get('/admin/revenue');
    return response.data;
  }
};

export default {
  auth: authService,
  car: carService,
  buyer: buyerService,
  purchase: purchaseService,
  dealership: dealershipService,
  admin: adminService,
  carOffer: carOfferService
};