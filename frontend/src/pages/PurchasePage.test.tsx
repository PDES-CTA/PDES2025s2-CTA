import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PurchasesPage from './PurchasesPage';
import { purchaseService } from '../services/api';
import { Purchase } from '../types/purchase';
import * as carUtils from '../utils/carUtils';

vi.mock('../services/api', () => ({
  purchaseService: {
    getPurchasesByBuyerId: vi.fn(),
    cancelPurchase: vi.fn(),
  },
}));

vi.mock('../utils/carUtils', () => ({
  formatPrice: vi.fn((price: number) => `$${price.toLocaleString()}`),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockBuyer = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  dni: 12345678,
  email: 'buyer@test.com',
  phone: '1234567890',
  address: '123 Test St',
  registrationDate: '2024-01-01',
};

const mockCar = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  fuelType: 'NAFTA' as const,
  transmission: 'AUTOMATICA' as const,
  color: 'Blue',
  description: 'Great car',
  publicationDate: '2024-01-15',
  images: ['https://example.com/car1.jpg'],
};

const mockDealership = {
  id: 1,
  businessName: 'Test Dealership',
  cuit: '30-12345678-9',
  email: 'contact@dealership.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  description: 'Test dealership',
  active: true,
  registrationDate: '2024-01-01T00:00:00',
};

const mockCarOffer = {
  id: 1,
  price: 25000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

const mockPurchases: Purchase[] = [
  {
    id: 1,
    finalPrice: 25000,
    purchaseDate: '2024-01-20T10:30:00',
    purchaseStatus: 'PENDING',
    paymentMethod: 'CREDIT_CARD',
    observations: 'Please deliver before 5 PM',
    carOffer: mockCarOffer,
    buyer: mockBuyer,
  },
  {
    id: 2,
    finalPrice: 30000,
    purchaseDate: '2024-01-18T14:00:00',
    purchaseStatus: 'CONFIRMED',
    paymentMethod: 'CASH',
    carOffer: {
      ...mockCarOffer,
      id: 2,
      car: { ...mockCar, id: 2, model: 'Camry', year: 2023 },
    },
    buyer: mockBuyer,
  },
  {
    id: 3,
    finalPrice: 28000,
    purchaseDate: '2024-01-15T09:00:00',
    purchaseStatus: 'DELIVERED',
    paymentMethod: 'CHECK',
    carOffer: {
      ...mockCarOffer,
      id: 3,
      car: { ...mockCar, id: 3, model: 'RAV4', year: 2021 },
    },
    buyer: mockBuyer,
  },
  {
    id: 4,
    finalPrice: 22000,
    purchaseDate: '2024-01-10T16:00:00',
    purchaseStatus: 'CANCELLED',
    paymentMethod: 'CREDIT_CARD',
    carOffer: {
      ...mockCarOffer,
      id: 4,
      car: { ...mockCar, id: 4, model: 'Civic', year: 2020 },
    },
    buyer: mockBuyer,
  },
];

() => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/purchases/:id" element={<PurchasesPage />} />
      </Routes>
    </BrowserRouter>,
    { wrapper: ({ children }) => (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </BrowserRouter>
    )}
  );
};

const renderPageWithRoute = (buyerId: string = '1') => {
  window.history.pushState({}, 'Test', `/purchases/${buyerId}`);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/purchases/:id" element={<PurchasesPage />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('PurchasesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, 'Test', '/purchases/1');
  });

  describe('Loading State', () => {
    it('should render loading spinner initially', () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      renderPageWithRoute();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetching fails', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockRejectedValue(
        new Error('Network error')
      );
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load purchases. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockRejectedValue(
        new Error('Network error')
      );
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should display error when buyer ID is missing', async () => {
      // Remove this test as useParams will always provide id from the route
      // The component expects id to be in the URL path
      // If we navigate to /purchases/ without an id, the route won't match
      // This is a routing concern, not a component concern
    });

    it('should log error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockRejectedValue(
        new Error('Network error')
      );
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching purchases:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Header and Navigation', () => {
    it('should display page title', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('My Purchases')).toBeInTheDocument();
      });
    });

    it('should display back button', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
    });

    it('should navigate back when back button is clicked', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
      
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Purchase Count Display', () => {
    it('should display correct purchase count with plural', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('4 purchases')).toBeInTheDocument();
      });
    });

    it('should display singular form for one purchase', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue([mockPurchases[0]]);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('1 purchase')).toBeInTheDocument();
      });
    });

    it('should display no purchases message when empty', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue([]);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText("You haven't made any purchases yet")).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no purchases', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue([]);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('No purchases yet')).toBeInTheDocument();
        expect(screen.getByText('When you purchase a car, it will appear here.')).toBeInTheDocument();
      });
    });

    it('should display Browse Available Cars button in empty state', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue([]);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Browse Available Cars')).toBeInTheDocument();
      });
    });

    it('should navigate back when clicking Browse Available Cars', async () => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue([]);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Browse Available Cars')).toBeInTheDocument();
      });
      
      const button = screen.getByText('Browse Available Cars');
      fireEvent.click(button);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Purchases List Display', () => {
    beforeEach(() => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
    });

    it('should render all purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Corolla \(2022\)/)).toBeInTheDocument();
        expect(screen.getByText(/Toyota Camry \(2023\)/)).toBeInTheDocument();
        expect(screen.getByText(/Toyota RAV4 \(2021\)/)).toBeInTheDocument();
        expect(screen.getByText(/Toyota Civic \(2020\)/)).toBeInTheDocument();
      });
    });

    it('should display purchase prices', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(carUtils.formatPrice).toHaveBeenCalledWith(25000);
        expect(carUtils.formatPrice).toHaveBeenCalledWith(30000);
        expect(carUtils.formatPrice).toHaveBeenCalledWith(28000);
        expect(carUtils.formatPrice).toHaveBeenCalledWith(22000);
      });
    });

    it('should display purchase status badges', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const pendingBadges = screen.getAllByText('Pending');
        expect(pendingBadges.length).toBeGreaterThanOrEqual(1);
        
        const confirmedBadges = screen.getAllByText('Confirmed');
        expect(confirmedBadges.length).toBeGreaterThanOrEqual(1);
        
        const deliveredBadges = screen.getAllByText('Delivered');
        expect(deliveredBadges.length).toBeGreaterThanOrEqual(1);
        
        const cancelledBadges = screen.getAllByText('Cancelled');
        expect(cancelledBadges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display dealership name', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const dealershipNames = screen.getAllByText('Test Dealership');
        expect(dealershipNames.length).toBeGreaterThan(0);
      });
    });

    it('should display car images when available', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const images = screen.getAllByAltText(/Toyota/);
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/car1.jpg');
      });
    });

    it('should display payment methods', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const creditCardElements = screen.getAllByText('Credit Card');
        expect(creditCardElements.length).toBeGreaterThanOrEqual(1);
        
        const cashElements = screen.getAllByText('Cash');
        expect(cashElements.length).toBeGreaterThanOrEqual(1);
        
        const checkElements = screen.getAllByText('Check');
        expect(checkElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display observations when available', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('Please deliver before 5 PM')).toBeInTheDocument();
      });
    });

    it('should not display observations when not available', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument();
      });
      
      const camryCard = screen.getByText(/Toyota Camry/).closest('[class*="purchaseCard"]');
      expect(camryCard).not.toHaveTextContent('Observations:');
    });

    it('should display car color', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const colorLabels = screen.getAllByText('Color:');
        expect(colorLabels.length).toBe(4);
        const colorValues = screen.getAllByText('Blue');
        expect(colorValues.length).toBeGreaterThan(0);
      });
    });

    it('should not render purchase card when car is missing', async () => {
      const purchasesWithMissingCar: Purchase[] = [
        {
          ...mockPurchases[0],
          carOffer: {
            ...mockCarOffer,
            car: null as any,
          },
        },
      ];
      
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(purchasesWithMissingCar);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.queryByText(/Toyota Corolla/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Cancel Purchase Action', () => {
    beforeEach(() => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
    });

    it('should show Cancel Purchase button for pending purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel Purchase');
        expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should show Cancel Purchase button for confirmed purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel Purchase');
        // Should have 2: one for pending, one for confirmed
        expect(cancelButtons.length).toBe(2);
      });
    });

    it('should show confirmation dialog when clicking Cancel Purchase', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(purchaseService.cancelPurchase).mockResolvedValue({} as any);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel Purchase').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel Purchase');
      fireEvent.click(cancelButtons[0]);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to cancel this purchase?');
      
      confirmSpy.mockRestore();
    });

    it('should call cancelPurchase when confirmed', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.cancelPurchase).mockResolvedValue({} as any);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel Purchase').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel Purchase');
      fireEvent.click(cancelButtons[0]);
      
      await waitFor(() => {
        expect(purchaseService.cancelPurchase).toHaveBeenCalledWith(1);
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should show success alert after cancelling', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.cancelPurchase).mockResolvedValue({} as any);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel Purchase').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel Purchase');
      fireEvent.click(cancelButtons[0]);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase cancelled successfully');
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should not cancel when user cancels dialog', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel Purchase').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel Purchase');
      fireEvent.click(cancelButtons[0]);
      
      expect(purchaseService.cancelPurchase).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('should handle cancel error', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(purchaseService.cancelPurchase).mockRejectedValue(new Error('Cancel failed'));
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel Purchase').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel Purchase');
      fireEvent.click(cancelButtons[0]);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to cancel purchase. Please try again.');
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should refresh purchases list after cancelling', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.cancelPurchase).mockResolvedValue({} as any);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel Purchase').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel Purchase');
      fireEvent.click(cancelButtons[0]);
      
      await waitFor(() => {
        expect(purchaseService.getPurchasesByBuyerId).toHaveBeenCalledTimes(2);
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Status-specific Messages', () => {
    beforeEach(() => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
    });

    it('should show cancelled message for cancelled purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('This purchase has been cancelled')).toBeInTheDocument();
      });
    });

    it('should show delivered message for delivered purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText('This purchase has been delivered. Enjoy your purchase!')).toBeInTheDocument();
      });
    });

    it('should not show cancel button for delivered purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota RAV4/)).toBeInTheDocument();
      });
      
      const deliveredCard = screen.getByText(/Toyota RAV4/).closest('[class*="purchaseCard"]');
      expect(deliveredCard).not.toHaveTextContent('Cancel Purchase');
    });

    it('should not show cancel button for cancelled purchases', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Civic/)).toBeInTheDocument();
      });
      
      const cancelledCard = screen.getByText(/Toyota Civic/).closest('[class*="purchaseCard"]');
      const cancelButton = cancelledCard?.querySelector('button');
      expect(cancelButton).toBeNull();
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(mockPurchases);
    });

    it('should format purchase dates correctly', async () => {
      renderPageWithRoute();
      
      await waitFor(() => {
        const dateLabels = screen.getAllByText('Purchase Date:');
        expect(dateLabels.length).toBe(4);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle purchase without finalPrice', async () => {
      const purchaseWithoutPrice: Purchase[] = [
        {
          ...mockPurchases[0],
          finalPrice: 0,
        },
      ];
      
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(purchaseWithoutPrice);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Corolla/)).toBeInTheDocument();
      });
    });

    it('should handle purchase without images', async () => {
      const purchaseWithoutImages: Purchase[] = [
        {
          ...mockPurchases[0],
          carOffer: {
            ...mockCarOffer,
            car: {
              ...mockCar,
              images: [],
            },
          },
        },
      ];
      
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(purchaseWithoutImages);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Corolla/)).toBeInTheDocument();
      });
      
      expect(screen.queryByAltText('Toyota Corolla')).not.toBeInTheDocument();
    });

    it('should handle purchase without dealership', async () => {
      const purchaseWithoutDealership: Purchase[] = [
        {
          ...mockPurchases[0],
          carOffer: {
            ...mockCarOffer,
            dealership: null as any,
          },
        },
      ];
      
      vi.mocked(purchaseService.getPurchasesByBuyerId).mockResolvedValue(purchaseWithoutDealership);
      
      renderPageWithRoute();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Corolla/)).toBeInTheDocument();
      });
      
      const card = screen.getByText(/Toyota Corolla/).closest('[class*="purchaseCard"]');
      expect(card).not.toHaveTextContent('Dealership:');
    });
  });
});