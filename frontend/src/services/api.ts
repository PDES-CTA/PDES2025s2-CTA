import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { Car } from "../types/car";

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
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authorization_token");
      if (globalThis.location.pathname !== '/login') {
        globalThis.location.href = "/login";
      }
    }
    const message = error.response?.data || error.message;
    return Promise.reject(new Error(typeof message === 'string' ? message : 'An error occurred'));
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
  name: string;
  dni: string;
  cuit?: string;
  role: 'BUYER' | 'DEALERSHIP';
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  token?: string;
  user: User;
}

interface SearchFilters {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  brand?: string;
  fuelType?: string;
  transmission?: string;
}

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

interface Purchase {
  id: number;
  carId: number;
  car: Car;
  paymentMethod: string;
  observations?: string;
  status: string;
  createdAt: string;
  purchaseDate?: string;
  finalPrice?: number;
}

interface PurchaseData {
  carId: number;
  paymentMethod: string;
  observations?: string;
}

interface Dealership {
  id: number;
  name: string;
  cuit: string;
  address?: string;
  phone?: string;
  email: string;
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

// ==================== CAR SERVICE ====================
export const carService = {
  async getAllCars(): Promise<Car[]> {
    const response = await apiClient.get<Car[]>("/cars");
    return response.data;
  },

  async getCarById(carId: string | number): Promise<Car> {
    const response = await apiClient.get<Car>(`/cars/${carId}`);
    return response.data;
  },

  async searchCars(filters: SearchFilters): Promise<Car[]> {
    const response = await apiClient.get<Car[]>("/cars/search", {
      params: filters
    });
    return response.data;
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
  },

  async getPurchases(): Promise<Purchase[]> {
    const response = await apiClient.get<Purchase[]>("/buyers/purchases");
    return response.data;
  }
};

// ==================== PURCHASE SERVICE ====================
export const purchaseService = {
  async createPurchase(purchaseData: PurchaseData): Promise<Purchase> {
    const response = await apiClient.post<Purchase>("/purchases", {
      carId: purchaseData.carId,
      paymentMethod: purchaseData.paymentMethod,
      observations: purchaseData.observations
    });
    return response.data;
  },

  async getPurchaseById(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.get<Purchase>(`/purchases/${purchaseId}`);
    return response.data;
  },

  async confirmPurchase(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.patch<Purchase>(`/purchases/${purchaseId}/confirm`);
    return response.data;
  },

  async cancelPurchase(purchaseId: string | number): Promise<Purchase> {
    const response = await apiClient.patch<Purchase>(`/purchases/${purchaseId}/cancel`);
    return response.data;
  }
};

// ==================== DEALERSHIP SERVICE ====================
export const dealershipService = {
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
  }
};

export default {
  auth: authService,
  car: carService,
  buyer: buyerService,
  purchase: purchaseService,
  dealership: dealershipService,
  admin: adminService
};