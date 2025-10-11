import axios from "axios";

// Configuración centralizada
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Instancia de axios configurada
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authorization_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo centralizado de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authorization_token");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ==================== AUTH SERVICE ====================
export const authService = {
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    const token = response.headers["authorization"] || response.data.token;
    if (token) {
      localStorage.setItem("authorization_token", token);
    }
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  async getLoggedUser() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  logout() {
    localStorage.removeItem("authorization_token");
    window.location.href = "/login";
  }
};

// ==================== CAR SERVICE ====================
export const carService = {
  async getAllCars() {
    const response = await apiClient.get("/cars");
    return response.data;
  },

  async getCarById(carId) {
    const response = await apiClient.get(`/cars/${carId}`);
    return response.data;
  },

  async searchCars(filters) {
    const response = await apiClient.get("/cars/search", {
      params: filters
    });
    return response.data;
  },

  async getCarsByDealership(dealershipId) {
    const response = await apiClient.get(`/cars/dealership/${dealershipId}`);
    return response.data;
  },

  async createCar(carData) {
    const response = await apiClient.post("/cars", carData);
    return response.data;
  },

  async updateCar(carId, carData) {
    const response = await apiClient.put(`/cars/${carId}`, carData);
    return response.data;
  },

  async deleteCar(carId) {
    const response = await apiClient.delete(`/cars/${carId}`);
    return response.data;
  }
};

// ==================== BUYER SERVICE ====================
export const buyerService = {
  async getFavorites() {
    const response = await apiClient.get("/buyers/favorites");
    return response.data;
  },

  async addFavorite(carId) {
    const response = await apiClient.post(`/buyers/favorites/${carId}`);
    return response.data;
  },

  async removeFavorite(favoriteId) {
    const response = await apiClient.delete(`/buyers/favorites/${favoriteId}`);
    return response.data;
  },

  async updateReview(favoriteId, reviewData) {
    const response = await apiClient.put(`/buyers/favorites/${favoriteId}/review`, {
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response.data;
  },

  async getPurchases() {
    const response = await apiClient.get("/buyers/purchases");
    return response.data;
  }
};

// ==================== PURCHASE SERVICE ====================
export const purchaseService = {
  async createPurchase(purchaseData) {
    const response = await apiClient.post("/purchases", {
      carId: purchaseData.carId,
      paymentMethod: purchaseData.paymentMethod,
      observations: purchaseData.observations
    });
    return response.data;
  },

  async getPurchaseById(purchaseId) {
    const response = await apiClient.get(`/purchases/${purchaseId}`);
    return response.data;
  },

  async confirmPurchase(purchaseId) {
    const response = await apiClient.patch(`/purchases/${purchaseId}/confirm`);
    return response.data;
  },

  async cancelPurchase(purchaseId) {
    const response = await apiClient.patch(`/purchases/${purchaseId}/cancel`);
    return response.data;
  }
};

// ==================== DEALERSHIP SERVICE ====================
export const dealershipService = {
  async getAllDealerships() {
    const response = await apiClient.get("/dealerships");
    return response.data;
  },

  async getDealershipById(dealershipId) {
    const response = await apiClient.get(`/dealerships/${dealershipId}`);
    return response.data;
  },

  async getSales() {
    const response = await apiClient.get("/dealerships/sales");
    return response.data;
  }
};

// ==================== ADMIN SERVICE ====================
export const adminService = {
  async getAllUsers() {
    const response = await apiClient.get("/admin/users");
    return response.data;
  },

  async getStatistics() {
    const response = await apiClient.get("/admin/statistics");
    return response.data;
  },

  async getTopSoldCars(limit = 5) {
    const response = await apiClient.get("/admin/reports/top-sold-cars", {
      params: { limit }
    });
    return response.data;
  },

  async getTopBuyers(limit = 5) {
    const response = await apiClient.get("/admin/reports/top-buyers", {
      params: { limit }
    });
    return response.data;
  },

  async getTopFavoriteCars(limit = 5) {
    const response = await apiClient.get("/admin/reports/top-favorites", {
      params: { limit }
    });
    return response.data;
  },

  async getTopDealerships(limit = 5) {
    const response = await apiClient.get("/admin/reports/top-dealerships", {
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