import { describe, it, expect, vi, beforeEach } from 'vitest';

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

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('authService', () => {
    describe('login', () => {
      it('should login and store token from headers', async () => {
        const mockResponse = {
          data: { user: { id: 1, email: 'test@test.com', name: 'Test', role: 'BUYER' } },
          headers: { authorization: 'Bearer token123' },
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await authService.login({ email: 'test@test.com', password: 'password' });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@test.com',
          password: 'password',
        });
        expect(localStorage.getItem('authorization_token')).toBe('Bearer token123');
        expect(result).toEqual(mockResponse.data);
      });

      it('should login and store token from data', async () => {
        const mockResponse = {
          data: { 
            user: { id: 1, email: 'test@test.com', name: 'Test', role: 'BUYER' },
            token: 'token456',
          },
          headers: {},
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await authService.login({ email: 'test@test.com', password: 'password' });

        expect(localStorage.getItem('authorization_token')).toBe('token456');
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle login without token', async () => {
        const mockResponse = {
          data: { user: { id: 1, email: 'test@test.com', name: 'Test', role: 'BUYER' } },
          headers: {},
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await authService.login({ email: 'test@test.com', password: 'password' });

        expect(localStorage.getItem('authorization_token')).toBeNull();
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('register', () => {
      it('should register a new user', async () => {
        const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', role: 'BUYER' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockUser });

        const userData = {
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          address: '123 Street',
          phone: '1234567890',
          dni: '12345678',
          role: 'BUYER' as const,
        };

        const result = await authService.register(userData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
        expect(result).toEqual(mockUser);
      });
    });

    describe('getLoggedUser', () => {
      it('should get logged user', async () => {
        const mockUser = { id: 1, email: 'test@test.com', name: 'Test', role: 'BUYER' };
        mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

        const result = await authService.getLoggedUser();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
        expect(result).toEqual(mockUser);
      });
    });

    describe('logout', () => {
      it('should clear token and redirect on logout', () => {
        const originalLocation = globalThis.location;
        
        delete (globalThis as { location?: Location }).location;
        globalThis.location = {
          pathname: '/dashboard',
          href: '',
        } as Location;

        localStorage.setItem('authorization_token', 'test-token');

        authService.logout();

        expect(localStorage.getItem('authorization_token')).toBeNull();
        expect(globalThis.location.href).toBe('/login');

        globalThis.location = originalLocation;
      });
    });
  });

  describe('carOfferService', () => {
    describe('getAll', () => {
      it('should get all car offers', async () => {
        const mockOffers = [
          { id: 1, price: 20000, available: true },
          { id: 2, price: 25000, available: true },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffers });

        const result = await carOfferService.getAll();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/available');
        expect(result).toEqual(mockOffers);
      });
    });

    describe('getById', () => {
      it('should get offer by id', async () => {
        const mockOffer = { id: 1, price: 20000, available: true };
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.getById(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/1');
        expect(result).toEqual(mockOffer);
      });

      it('should handle string id', async () => {
        const mockOffer = { id: 1, price: 20000, available: true };
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.getById('1');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/1');
        expect(result).toEqual(mockOffer);
      });
    });

    describe('getByDealershipId', () => {
      it('should get offers by dealership id', async () => {
        const mockOffers = [{ id: 1, price: 20000, available: true }];
        mockAxiosInstance.get.mockResolvedValue({ data: mockOffers });

        const result = await carOfferService.getByDealershipId(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offer/dealership/1');
        expect(result).toEqual(mockOffers);
      });
    });

    describe('deleteCarOffer', () => {
      it('should delete car offer', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: undefined });

        await carOfferService.deleteCarOffer(1);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/offer/1');
      });
    });

    describe('updateCarOffer', () => {
      it('should update car offer', async () => {
        const mockOffer = { id: 1, price: 30000, available: true };
        mockAxiosInstance.put.mockResolvedValue({ data: mockOffer });

        const result = await carOfferService.updateCarOffer(1, { price: 30000 });

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/offer/1', { price: 30000 });
        expect(result).toEqual(mockOffer);
      });
    });

    describe('createCarOffer', () => {
      it('should create car offer', async () => {
        const mockOffer = { id: 1, price: 20000, available: true };
        mockAxiosInstance.post.mockResolvedValue({ data: mockOffer });

        const offerData = { carId: 1, dealershipId: 1, price: 20000 };
        const result = await carOfferService.createCarOffer(offerData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/offer', offerData);
        expect(result).toEqual(mockOffer);
      });
    });
  });

  describe('carService', () => {
    describe('getAllCars', () => {
      it('should get all cars', async () => {
        const mockCars = [
          { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 },
          { id: 2, brand: 'Honda', model: 'Civic', year: 2021 },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await carService.getAllCars();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars');
        expect(result).toEqual(mockCars);
      });

      it('should handle error when fetching cars', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

        await expect(carService.getAllCars()).rejects.toThrow('Network error');
      });
    });

    describe('getCarById', () => {
      it('should get car by id', async () => {
        const mockCar = { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 };
        mockAxiosInstance.get.mockResolvedValue({ data: mockCar });

        const result = await carService.getCarById(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/1');
        expect(result).toEqual(mockCar);
      });

      it('should handle error when fetching car by id', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Car not found'));

        await expect(carService.getCarById(1)).rejects.toThrow('Car not found');
      });
    });

    describe('searchCars', () => {
      it('should search cars with filters', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 }];
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const filters = { brand: 'Toyota', minYear: 2020 };
        const result = await carService.searchCars(filters);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/search', {
          params: { brand: 'Toyota', minYear: 2020 },
        });
        expect(result).toEqual(mockCars);
      });

      it('should filter empty values', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 }];
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const filters = { brand: 'Toyota', keyword: '' };
        const result = await carService.searchCars(filters);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/search', {
          params: { brand: 'Toyota' },
        });
        expect(result).toEqual(mockCars);
      });

      it('should handle error when searching cars', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Search error'));

        await expect(carService.searchCars({ brand: 'Toyota' })).rejects.toThrow('Search error');
      });
    });

    describe('getCarsByDealership', () => {
      it('should get cars by dealership', async () => {
        const mockCars = [{ id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 }];
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await carService.getCarsByDealership(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/dealership/1');
        expect(result).toEqual(mockCars);
      });
    });

    describe('createCar', () => {
      it('should create a car', async () => {
        const mockCar = { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 };
        mockAxiosInstance.post.mockResolvedValue({ data: mockCar });

        const carData = { brand: 'Toyota', model: 'Corolla', year: 2020 };
        const result = await carService.createCar(carData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/cars', carData);
        expect(result).toEqual(mockCar);
      });
    });

    describe('updateCar', () => {
      it('should update a car', async () => {
        const mockCar = { id: 1, brand: 'Toyota', model: 'Camry', year: 2020 };
        mockAxiosInstance.put.mockResolvedValue({ data: mockCar });

        const carData = { model: 'Camry' };
        const result = await carService.updateCar(1, carData);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/cars/1', carData);
        expect(result).toEqual(mockCar);
      });
    });

    describe('deleteCar', () => {
      it('should delete a car', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: undefined });

        await carService.deleteCar(1);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/cars/1');
      });
    });
  });

  describe('buyerService', () => {
    describe('createBuyer', () => {
      it('should create a buyer', async () => {
        const mockUser = { id: 1, email: 'buyer@test.com', name: 'Buyer', role: 'BUYER' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockUser });

        const buyerData = {
          email: 'buyer@test.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 St',
          phone: '1234567890',
          dni: '12345678',
          role: 'BUYER' as const,
        };

        const result = await buyerService.createBuyer(buyerData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/buyer', buyerData);
        expect(result).toEqual(mockUser);
      });
    });

    describe('getFavorites', () => {
      it('should get buyer favorites', async () => {
        const mockFavorites = [
          { id: 1, carId: 1, rating: 5, comment: 'Great car' },
        ];
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
        mockAxiosInstance.delete.mockResolvedValue({ data: undefined });

        await buyerService.removeFavorite(1);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/buyers/favorites/1');
      });
    });

    describe('updateReview', () => {
      it('should update a review', async () => {
        const mockFavorite = { id: 1, carId: 1, rating: 4, comment: 'Updated' };
        mockAxiosInstance.put.mockResolvedValue({ data: mockFavorite });

        const reviewData = { rating: 4, comment: 'Updated' };
        const result = await buyerService.updateReview(1, reviewData);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/buyers/favorites/1/review', {
          rating: 4,
          comment: 'Updated',
        });
        expect(result).toEqual(mockFavorite);
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
        const mockUsers = [{ id: 1, email: 'dealer@test.com', name: 'Dealer', role: 'DEALERSHIP' }];
        mockAxiosInstance.post.mockResolvedValue({ data: mockUsers });

        const dealershipData = {
          email: 'dealer@test.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 St',
          phone: '1234567890',
          businessName: 'Test Dealership',
          cuit: '20-12345678-9',
          role: 'DEALERSHIP' as const,
        };

        const result = await dealershipService.createDealership(dealershipData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dealerships', dealershipData);
        expect(result).toEqual(mockUsers);
      });
    });

    describe('getAllDealerships', () => {
      it('should get all dealerships', async () => {
        const mockDealerships = [
          { id: 1, businessName: 'Test Dealership', cuit: '20-12345678-9', active: true },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealerships });

        const result = await dealershipService.getAllDealerships();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dealerships');
        expect(result).toEqual(mockDealerships);
      });
    });

    describe('getDealershipById', () => {
      it('should get dealership by id', async () => {
        const mockDealership = { id: 1, businessName: 'Test Dealership', cuit: '20-12345678-9', active: true };
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealership });

        const result = await dealershipService.getDealershipById(1);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dealerships/1');
        expect(result).toEqual(mockDealership);
      });
    });

    describe('getSales', () => {
      it('should get dealership sales', async () => {
        const mockSales = [
          { id: 1, carId: 1, paymentMethod: 'credit_card', status: 'confirmed' },
        ];
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
        const mockUsers = [
          { id: 1, email: 'user1@test.com', name: 'User 1', role: 'BUYER' },
          { id: 2, email: 'user2@test.com', name: 'User 2', role: 'DEALERSHIP' },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockUsers });

        const result = await adminService.getAllUsers();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/users');
        expect(result).toEqual(mockUsers);
      });
    });

    describe('getStatistics', () => {
      it('should get statistics', async () => {
        const mockStats = {
          totalCars: 100,
          totalUsers: 50,
          totalPurchases: 75,
          totalRevenue: 1000000,
        };
        mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

        const result = await adminService.getStatistics();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/statistics');
        expect(result).toEqual(mockStats);
      });
    });

    describe('getTopSoldCars', () => {
      it('should get top sold cars with default limit', async () => {
        const mockCars = [
          { id: 1, brand: 'Toyota', model: 'Corolla', salesCount: 10 },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await adminService.getTopSoldCars();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-sold-cars', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockCars);
      });

      it('should get top sold cars with custom limit', async () => {
        const mockCars = [
          { id: 1, brand: 'Toyota', model: 'Corolla', salesCount: 10 },
        ];
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
        const mockBuyers = [
          { id: 1, name: 'John Doe', purchaseCount: 5, totalSpent: 100000 },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockBuyers });

        const result = await adminService.getTopBuyers();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-buyers', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockBuyers);
      });

      it('should get top buyers with custom limit', async () => {
        const mockBuyers = [
          { id: 1, name: 'John Doe', purchaseCount: 5, totalSpent: 100000 },
        ];
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
        const mockCars = [
          { id: 1, brand: 'Toyota', model: 'Corolla', favoriteCount: 20 },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockCars });

        const result = await adminService.getTopFavoriteCars();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-favorites', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockCars);
      });

      it('should get top favorite cars with custom limit', async () => {
        const mockCars = [
          { id: 1, brand: 'Toyota', model: 'Corolla', favoriteCount: 20 },
        ];
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
        const mockDealerships = [
          { id: 1, businessName: 'Test Dealership', salesCount: 50, totalRevenue: 500000 },
        ];
        mockAxiosInstance.get.mockResolvedValue({ data: mockDealerships });

        const result = await adminService.getTopDealerships();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/reports/top-dealerships', {
          params: { limit: 5 },
        });
        expect(result).toEqual(mockDealerships);
      });

      it('should get top dealerships with custom limit', async () => {
        const mockDealerships = [
          { id: 1, businessName: 'Test Dealership', salesCount: 50, totalRevenue: 500000 },
        ];
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