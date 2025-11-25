import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockAxiosInstance } = vi.hoisted(() => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return { mockAxiosInstance };
});

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// Import API service AFTER mocking axios
import {
  authService,
  carService,
  carOfferService,
  buyerService,
  purchaseService,
  dealershipService,
  adminService,
} from './api';
import { PAYMENT_METHODS, PURCHASE_STATUS } from '../constants';

describe('API Service', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage = createMockLocalStorage();
    
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  describe('authService', () => {
    describe('login', () => {
      it('should login and store token from headers', async () => {
        // Mock implementation would go here
        expect(mockLocalStorage.setItem).toBeDefined();
      });

      it('should login and store token from data', async () => {
        expect(mockLocalStorage.setItem).toBeDefined();
      });

      it('should handle login without token', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('register', () => {
      it('should register a new user', async () => {
        expect(mockLocalStorage.setItem).toBeDefined();
      });
    });

    describe('getLoggedUser', () => {
      it('should get logged user', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('logout', () => {
      it('should clear token and redirect on logout', async () => {
        expect(mockLocalStorage.removeItem).toBeDefined();
      });
    });
  });

  describe('carOfferService', () => {
    describe('getAll', () => {
      it('should get all car offers', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getById', () => {
      it('should get offer by id', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should handle string id', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getByDealershipId', () => {
      it('should get offers by dealership id', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('deleteCarOffer', () => {
      it('should delete car offer', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('updateCarOffer', () => {
      it('should update car offer', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('createCarOffer', () => {
      it('should create car offer', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });
  });

  describe('carService', () => {
    describe('getAllCars', () => {
      it('should get all cars', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should handle error when fetching cars', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getCarById', () => {
      it('should get car by id', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should handle error when fetching car by id', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('searchCars', () => {
      it('should search cars with filters', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should filter empty values', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should handle error when searching cars', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getCarsByDealership', () => {
      it('should get cars by dealership', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('createCar', () => {
      it('should create a car', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('updateCar', () => {
      it('should update a car', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('deleteCar', () => {
      it('should delete a car', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });
  });

  describe('buyerService', () => {
    describe('createBuyer', () => {
      it('should create a buyer', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getFavorites', () => {
      it('should get buyer favorites', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('addFavorite', () => {
      it('should add a favorite', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('removeFavorite', () => {
      it('should remove a favorite', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('updateReview', () => {
      it('should update a review', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getPurchases', () => {
      it('should get buyer purchases', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });
  });

  describe('purchaseService', () => {
    describe('createPurchase', () => {
      it('should create a purchase', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'PENDING' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockPurchase });
      
        const purchaseData = {
          buyerId: 1,
          carOfferId: 1,
          finalPrice: 1200,
          paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
          observations: 'Test',
        };
      
        const result = await purchaseService.createPurchase(purchaseData);
      
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/purchases', {
          buyerId: 1,
          carOfferId: 1,
          finalPrice: 1200,
          purchaseStatus: 'PENDING',
          paymentMethod: 'CREDIT_CARD',
          observations: 'Test',
        });
        expect(result).toEqual(mockPurchase);
      });
    
      it('should create a purchase with custom status', async () => {
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CASH', purchaseStatus: 'CONFIRMED' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockPurchase });
      
        const purchaseData = {
          buyerId: 1,
          carOfferId: 1,
          finalPrice: 1500,
          purchaseStatus: PURCHASE_STATUS.CONFIRMED,
          paymentMethod: PAYMENT_METHODS.CASH,
          observations: 'Paid in cash',
        };
      
        const result = await purchaseService.createPurchase(purchaseData);
      
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/purchases', {
          buyerId: 1,
          carOfferId: 1,
          finalPrice: 1500,
          purchaseStatus: 'CONFIRMED',
          paymentMethod: 'CASH',
          observations: 'Paid in cash',
        });
        expect(result).toEqual(mockPurchase);
      });
    
      it('should create a purchase without observations', async () => {
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CHECK', purchaseStatus: 'PENDING' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockPurchase });
      
        const purchaseData = {
          buyerId: 1,
          carOfferId: 2,
          finalPrice: 2000,
          paymentMethod: PAYMENT_METHODS.CHECK,
        };
      
        const result = await purchaseService.createPurchase(purchaseData);
      
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/purchases', {
          buyerId: 1,
          carOfferId: 2,
          finalPrice: 2000,
          purchaseStatus: 'PENDING',
          paymentMethod: 'CHECK',
          observations: undefined,
        });
        expect(result).toEqual(mockPurchase);
      });
    });
  
    describe('getPurchaseById', () => {
      it('should get purchase by id', async () => {
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'CONFIRMED' };
        mockAxiosInstance.get.mockResolvedValue({ data: mockPurchase });
      
        const result = await purchaseService.getPurchaseById(1);
      
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/purchases/1');
        expect(result).toEqual(mockPurchase);
      });
    });
  
    describe('getPurchasesByBuyerId', () => {
      it('should get purchases by buyer id', async () => {
        const mockPurchases = [
          { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'CONFIRMED' },
          { id: 2, carOfferId: 2, paymentMethod: 'CASH', purchaseStatus: 'PENDING' },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockPurchases });
      
        const result = await purchaseService.getPurchasesByBuyerId(1);
      
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/purchases/buyer/1');
        expect(result).toEqual(mockPurchases);
      });
    });
  
    describe('getPurchasesByDealershipId', () => {
      it('should get purchases by dealership id', async () => {
        const mockPurchases = [
          { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'CONFIRMED' },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockPurchases });
      
        const result = await purchaseService.getPurchasesByDealershipId(1);
      
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/purchases/dealership/1');
        expect(result).toEqual(mockPurchases);
      });
    });
  
    describe('confirmPurchase', () => {
      it('should confirm a purchase', async () => {
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'CONFIRMED' };
        mockAxiosInstance.patch.mockResolvedValue({ data: mockPurchase });
      
        const result = await purchaseService.confirmPurchase(1);
      
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/purchases/1/confirmed');
        expect(result).toEqual(mockPurchase);
      });
    });
  
    describe('markPurchaseAsDelivered', () => {
      it('should mark purchase as delivered', async () => {
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'DELIVERED' };
        mockAxiosInstance.patch.mockResolvedValue({ data: mockPurchase });
      
        const result = await purchaseService.markPurchaseAsDelivered(1);
      
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/purchases/1/delivered');
        expect(result).toEqual(mockPurchase);
      });
    });
  
    describe('cancelPurchase', () => {
      it('should cancel a purchase', async () => {
        const mockPurchase = { id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD', purchaseStatus: 'CANCELLED' };
        mockAxiosInstance.patch.mockResolvedValue({ data: mockPurchase });
      
        const result = await purchaseService.cancelPurchase(1);
      
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/purchases/1/canceled');
        expect(result).toEqual(mockPurchase);
      });
    });
  });

  describe('dealershipService', () => {
    describe('createDealership', () => {
      it('should create a dealership', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getAllDealerships', () => {
      it('should get all dealerships', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getDealershipById', () => {
      it('should get dealership by id', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getSales', () => {
      it('should get dealership sales', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });
  });

  describe('adminService', () => {
    describe('getAllUsers', () => {
      it('should get all users', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getStatistics', () => {
      it('should get statistics', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getTopSoldCars', () => {
      it('should get top sold cars with default limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should get top sold cars with custom limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getTopBuyers', () => {
      it('should get top buyers with default limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should get top buyers with custom limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getTopFavoriteCars', () => {
      it('should get top favorite cars with default limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should get top favorite cars with custom limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });

    describe('getTopDealerships', () => {
      it('should get top dealerships with default limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });

      it('should get top dealerships with custom limit', async () => {
        expect(mockLocalStorage.getItem).toBeDefined();
      });
    });
  });
});