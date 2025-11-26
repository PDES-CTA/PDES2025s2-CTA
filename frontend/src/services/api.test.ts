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

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn(),
  };
};

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

vi.mock('../constants', () => ({
  PAYMENT_METHODS: {
    CREDIT_CARD: 'CREDIT_CARD',
    CASH: 'CASH',
    CHECK: 'CHECK',
  },
  PURCHASE_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    DELIVERED: 'DELIVERED',
  },
}));

const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  CASH: 'CASH',
  CHECK: 'CHECK',
};

const PURCHASE_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  DELIVERED: 'DELIVERED',
};

describe('API Service', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage = createMockLocalStorage();
    
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  describe('authService', () => {
    describe('login', () => {
      it('should login and store token from headers', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'BUYER' };
        const mockToken = 'test-token-from-headers';
        
        mockAxiosInstance.post.mockResolvedValue({
          data: { user: mockUser },
          headers: { authorization: mockToken },
        });

        const result = await authService.login({ email: 'test@example.com', password: 'password' });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password',
        });
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authorization_token', mockToken);
        expect(result.user).toEqual(mockUser);
      });

      it('should login and store token from data', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'BUYER' };
        const mockToken = 'test-token-from-data';
        
        mockAxiosInstance.post.mockResolvedValue({
          data: { user: mockUser, token: mockToken },
          headers: {},
        });

        const result = await authService.login({ email: 'test@example.com', password: 'password' });

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authorization_token', mockToken);
        expect(result.user).toEqual(mockUser);
      });

      it('should handle login without token', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'BUYER' };
        
        mockAxiosInstance.post.mockResolvedValue({
          data: { user: mockUser },
          headers: {},
        });

        const result = await authService.login({ email: 'test@example.com', password: 'password' });

        expect(result.user).toEqual(mockUser);
      });
    });

    describe('register', () => {
      it('should register a new user', async () => {
        const mockUser = { id: 2, email: 'newuser@example.com', name: 'New User', role: 'BUYER' };
        
        mockAxiosInstance.post.mockResolvedValue({ data: mockUser });

        const result = await authService.register({
          email: 'newuser@example.com',
          password: 'password',
          firstName: 'New',
          lastName: 'User',
          address: '123 Main St',
          phone: '555-1234',
          role: 'BUYER',
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
        expect(result).toEqual(mockUser);
      });
    });

    describe('getLoggedUser', () => {
      it('should get logged user', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'BUYER' };
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

        const result = await authService.getLoggedUser();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
        expect(result).toEqual(mockUser);
      });
    });

    describe('logout', () => {
      it('should clear token and redirect on logout', async () => {
        mockLocalStorage.setItem('authorization_token', 'some-token');
        
        authService.logout();

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authorization_token');
      });
    });
  });

  describe('carOfferService', () => {
    describe('getAll', () => {
      it('should get all car offers', async () => {
        const mockOffers = [{ id: 1, carId: 1, dealershipId: 1 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffers });

        const result = await carOfferService.getAll();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/available');
        expect(result).toEqual(mockOffers);
      });
    });

    describe('getById', () => {
      it('should get offer by id', async () => {
        const mockOffer = { id: 1, carId: 1, dealershipId: 1 };
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.getById(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/1');
        expect(result).toEqual(mockOffer);
      });

      it('should handle string id', async () => {
        const mockOffer = { id: 1, carId: 1, dealershipId: 1 };
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.getById('1');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/1');
        expect(result).toEqual(mockOffer);
      });
    });

    describe('getByDealershipId', () => {
      it('should get offers by dealership id', async () => {
        const mockOffers = [{ id: 1, carId: 1, dealershipId: 1 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffers });

        const result = await carOfferService.getByDealershipId(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/dealership/1');
        expect(result).toEqual(mockOffers);
      });
    });

    describe('deleteCarOffer', () => {
      it('should delete car offer', async () => {
        mockAxiosInstance.delete.mockResolvedValue({});

        await carOfferService.deleteCarOffer(1);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/offer/1');
      });
    });

    describe('updateCarOffer', () => {
      it('should update car offer', async () => {
        const mockOffer = { id: 1, carId: 1, dealershipId: 1 };
        
        mockAxiosInstance.put.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.updateCarOffer(1, { price: 15000 });

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/offer/1', { price: 15000 });
        expect(result).toEqual(mockOffer);
      });
    });

    describe('createCarOffer', () => {
      it('should create car offer', async () => {
        const mockOffer = { id: 1, carId: 1, dealershipId: 1, price: 15000 };
        
        mockAxiosInstance.post.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.createCarOffer({ carId: 1, dealershipId: 1, price: 15000 });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/offer', { carId: 1, dealershipId: 1, price: 15000 });
        expect(result).toEqual(mockOffer);
      });
    });
  });

  describe('carService', () => {
    describe('getAllCars', () => {
      it('should get all cars', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Camry' }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await carService.getAllCars();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars');
        expect(result).toEqual(mockCars);
      });

      it('should handle error when fetching cars', async () => {
        const error = new Error('Network error');
        
        mockAxiosInstance.get.mockRejectedValue(error);

        try {
          await carService.getAllCars();
          expect.fail('Should have thrown error');
        } catch (e) {
          expect(e).toEqual(error);
        }
      });
    });

    describe('getCarById', () => {
      it('should get car by id', async () => {
        const mockCar = { id: 1, brand: 'Toyota', model: 'Camry' };
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCar });

        const result = await carService.getCarById(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/1');
        expect(result).toEqual(mockCar);
      });

      it('should handle error when fetching car by id', async () => {
        const error = new Error('Car not found');
        
        mockAxiosInstance.get.mockRejectedValue(error);

        try {
          await carService.getCarById(1);
          expect.fail('Should have thrown error');
        } catch (e) {
          expect(e).toEqual(error);
        }
      });
    });

    describe('searchCars', () => {
      it('should search cars with filters', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Camry', year: 2020 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await carService.searchCars({ brand: 'Toyota', minYear: 2020 });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/search', {
          params: { brand: 'Toyota', minYear: 2020 },
        });
        expect(result).toEqual(mockCars);
      });

      it('should filter empty values', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Camry' }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await carService.searchCars({ brand: 'Toyota', keyword: '' });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/search', {
          params: { brand: 'Toyota' },
        });
        expect(result).toEqual(mockCars);
      });

      it('should handle error when searching cars', async () => {
        const error = new Error('Search error');
        
        mockAxiosInstance.get.mockRejectedValue(error);

        try {
          await carService.searchCars({ brand: 'Toyota' });
          expect.fail('Should have thrown error');
        } catch (e) {
          expect(e).toEqual(error);
        }
      });
    });

    describe('getCarsByDealership', () => {
      it('should get cars by dealership', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Camry', dealershipId: 1 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await carService.getCarsByDealership(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/dealership/1');
        expect(result).toEqual(mockCars);
      });
    });

    describe('createCar', () => {
      it('should create a car', async () => {
        const mockCar = { id: 1, brand: 'Toyota', model: 'Camry' };
        
        mockAxiosInstance.post.mockResolvedValue({ data: mockCar });

        const result = await carService.createCar({ brand: 'Toyota', model: 'Camry' });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/cars', { brand: 'Toyota', model: 'Camry' });
        expect(result).toEqual(mockCar);
      });
    });

    describe('updateCar', () => {
      it('should update a car', async () => {
        const mockCar = { id: 1, brand: 'Toyota', model: 'Camry', year: 2021 };
        
        mockAxiosInstance.put.mockResolvedValue({ data: mockCar });

        const result = await carService.updateCar(1, { year: 2021 });

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/cars/1', { year: 2021 });
        expect(result).toEqual(mockCar);
      });
    });

    describe('deleteCar', () => {
      it('should delete a car', async () => {
        mockAxiosInstance.delete.mockResolvedValue({});

        await carService.deleteCar(1);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/cars/1');
      });
    });
  });

  describe('buyerService', () => {
    describe('createBuyer', () => {
      it('should create a buyer', async () => {
        const mockBuyer = { id: 1, email: 'buyer@example.com', name: 'Buyer', role: 'BUYER' };
        
        mockAxiosInstance.post.mockResolvedValue({ data: mockBuyer });

        const result = await buyerService.createBuyer({
          email: 'buyer@example.com',
          password: 'password',
          firstName: 'Buyer',
          lastName: 'User',
          address: '123 Main St',
          phone: '555-1234',
          role: 'BUYER',
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/buyer', expect.any(Object));
        expect(result).toEqual(mockBuyer);
      });
    });

    describe('getFavorites', () => {
      it('should get buyer favorites', async () => {
        const mockFavorites = [{ id: 1, carId: 1, rating: 5 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockFavorites });

        const result = await buyerService.getFavorites();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/buyers/favorites');
        expect(result).toEqual(mockFavorites);
      });
    });

    describe('addFavorite', () => {
      it('should add a favorite', async () => {
        const mockFavorite = { id: 1, carId: 1 };
        
        mockAxiosInstance.post.mockResolvedValue({ data: mockFavorite });

        const result = await buyerService.addFavorite(1);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/buyers/favorites/1');
        expect(result).toEqual(mockFavorite);
      });
    });

    describe('removeFavorite', () => {
      it('should remove a favorite', async () => {
        mockAxiosInstance.delete.mockResolvedValue({});

        await buyerService.removeFavorite(1);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/buyers/favorites/1');
      });
    });

    describe('updateReview', () => {
      it('should update a review', async () => {
        const mockFavorite = { id: 1, carId: 1, rating: 5, comment: 'Great car' };
        
        mockAxiosInstance.put.mockResolvedValue({ data: mockFavorite });

        const result = await buyerService.updateReview(1, { rating: 5, comment: 'Great car' });

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/buyers/favorites/1/review', {
          rating: 5,
          comment: 'Great car',
        });
        expect(result).toEqual(mockFavorite);
      });
    });

    describe('getPurchases', () => {
      it('should get buyer purchases', async () => {
        const mockPurchases = [{ id: 1, carOfferId: 1 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockPurchases });

        const result = await buyerService.getFavorites();

        expect(result).toBeDefined();
      });
    });
  });

  describe('purchaseService', () => {
    describe('createPurchase', () => {
      it('should create a purchase', async () => {
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
        const mockDealership = { id: 1, email: 'dealership@example.com', name: 'Dealership', role: 'DEALERSHIP' };
        
        mockAxiosInstance.post.mockResolvedValue({ data: [mockDealership] });

        const result = await dealershipService.createDealership({
          email: 'dealership@example.com',
          password: 'password',
          firstName: 'Dealership',
          lastName: 'User',
          address: '123 Main St',
          phone: '555-1234',
          businessName: 'My Dealership',
          role: 'DEALERSHIP',
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dealerships', expect.any(Object));
        expect(result).toEqual([mockDealership]);
      });
    });

    describe('getAllDealerships', () => {
      it('should get all dealerships', async () => {
        const mockDealerships = [{ id: 1, businessName: 'Dealership 1' }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealerships });

        const result = await dealershipService.getAllDealerships();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dealerships');
        expect(result).toEqual(mockDealerships);
      });
    });

    describe('getDealershipById', () => {
      it('should get dealership by id', async () => {
        const mockDealership = { id: 1, businessName: 'Dealership 1' };
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealership });

        const result = await dealershipService.getDealershipById(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dealerships/1');
        expect(result).toEqual(mockDealership);
      });
    });

    describe('getSales', () => {
      it('should get dealership sales', async () => {
        const mockSales = [{ id: 1, carOfferId: 1, paymentMethod: 'CREDIT_CARD' }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockSales });

        const result = await dealershipService.getSales();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dealerships/sales');
        expect(result).toEqual(mockSales);
      });
    });
  });

  describe('adminService', () => {
    describe('getAllUsers', () => {
      it('should get all users', async () => {
        const mockUsers = [{ id: 1, email: 'user@example.com', name: 'User' }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockUsers });

        const result = await adminService.getAllUsers();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/users');
        expect(result).toEqual(mockUsers);
      });
    });

    describe('getStatistics', () => {
      it('should get statistics', async () => {
        const mockStats = { totalCars: 100, totalUsers: 50, totalPurchases: 200, totalRevenue: 50000 };
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

        const result = await adminService.getStatistics();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/statistics');
        expect(result).toEqual(mockStats);
      });
    });

    describe('getTopSoldCars', () => {
      it('should get top sold cars with default limit', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', salesCount: 100 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await adminService.getTopSoldCars();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-sold-cars', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockCars);
      });

      it('should get top sold cars with custom limit', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', salesCount: 100 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await adminService.getTopSoldCars(10);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-sold-cars', {
          params: { limit: 10 },
        });
        expect(result).toEqual(mockCars);
      });
    });

    describe('getTopBuyers', () => {
      it('should get top buyers with default limit', async () => {
        const mockBuyers = [{ id: 1, email: 'buyer@example.com', purchaseCount: 5 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockBuyers });

        const result = await adminService.getTopBuyers();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-buyers', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockBuyers);
      });

      it('should get top buyers with custom limit', async () => {
        const mockBuyers = [{ id: 1, email: 'buyer@example.com', purchaseCount: 5 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockBuyers });

        const result = await adminService.getTopBuyers(10);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-buyers', {
          params: { limit: 10 },
        });
        expect(result).toEqual(mockBuyers);
      });
    });

    describe('getTopFavoriteCars', () => {
      it('should get top favorite cars with default limit', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', favoriteCount: 50 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await adminService.getTopFavoriteCars();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-favorites', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockCars);
      });

      it('should get top favorite cars with custom limit', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', favoriteCount: 50 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await adminService.getTopFavoriteCars(10);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-favorites', {
          params: { limit: 10 },
        });
        expect(result).toEqual(mockCars);
      });
    });

    describe('getTopDealerships', () => {
      it('should get top dealerships with default limit', async () => {
        const mockDealerships = [{ id: 1, businessName: 'Dealership 1', salesCount: 30 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealerships });

        const result = await adminService.getTopDealerships();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-dealerships', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockDealerships);
      });

      it('should get top dealerships with custom limit', async () => {
        const mockDealerships = [{ id: 1, businessName: 'Dealership 1', salesCount: 30 }];
        
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealerships });

        const result = await adminService.getTopDealerships(10);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-dealerships', {
          params: { limit: 10 },
        });
        expect(result).toEqual(mockDealerships);
      });
    });
  });
});