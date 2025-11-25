import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DealershipSalesPage from './DealershipSalesPage';
import { purchaseService, authService } from '../services/api';
import { Purchase } from '../types/purchase';
import * as carUtils from '../utils/carUtils';

vi.mock('../services/api', () => ({
  authService: {
    getLoggedUser: vi.fn(),
  },
  purchaseService: {
    getPurchasesByDealershipId: vi.fn(),
    confirmPurchase: vi.fn(),
    markPurchaseAsDelivered: vi.fn(),
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

const mockUser = {
  id: 1,
  email: 'dealer@test.com',
  name: 'Test Dealer',
  role: 'DEALERSHIP',
};

const mockBuyer = {
  id: 2,
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

const mockSales: Purchase[] = [
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
    buyer: { ...mockBuyer, id: 3, email: 'buyer2@test.com' },
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
    buyer: { ...mockBuyer, id: 4, email: 'buyer3@test.com' },
  },
];

const renderPage = () => {
  return render(
    <BrowserRouter>
      <DealershipSalesPage />
    </BrowserRouter>
  );
};

describe('DealershipSalesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getLoggedUser).mockResolvedValue(mockUser);
    vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue(mockSales);
  });

  describe('Loading State', () => {
    it('should render loading spinner initially', () => {
      renderPage();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetching fails', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockRejectedValue(
        new Error('Network error')
      );
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load sales. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockRejectedValue(
        new Error('Network error')
      );
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should log error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockRejectedValue(
        new Error('Network error')
      );
      
      renderPage();
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching sales:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Header and Navigation', () => {
    it('should display page title', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });
    });

    it('should display back button', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
    });

    it('should navigate back when back button is clicked', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
      
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Sales Count Display', () => {
    it('should display correct sales count with plural', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('3 total sales')).toBeInTheDocument();
      });
    });

    it('should display singular form for one sale', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue([mockSales[0]]);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('1 total sale')).toBeInTheDocument();
      });
    });

    it('should display no sales message when empty', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue([]);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('No sales yet')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Cards', () => {
    it('should display total potential sales statistic', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Total Potential Sales')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should calculate and display total revenue', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Revenue')).toBeInTheDocument();
        // 30000 (CONFIRMED) + 28000 (DELIVERED) = 58000
        expect(carUtils.formatPrice).toHaveBeenCalledWith(58000);
      });
    });

    it('should only include confirmed and delivered sales in revenue', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(carUtils.formatPrice).toHaveBeenCalledWith(58000);
      });
    });

    it('should not display stats when no sales', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue([]);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.queryByText('Total Potential Sales')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no sales', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue([]);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('No sales yet')).toBeInTheDocument();
        expect(screen.getByText('When customers purchase your car offers, they will appear here.')).toBeInTheDocument();
      });
    });

    it('should display Back to Offers button in empty state', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue([]);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Back to Offers')).toBeInTheDocument();
      });
    });

    it('should navigate back when clicking Back to Offers', async () => {
      vi.mocked(purchaseService.getPurchasesByDealershipId).mockResolvedValue([]);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Back to Offers')).toBeInTheDocument();
      });
      
      const button = screen.getByText('Back to Offers');
      fireEvent.click(button);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Sales List Display', () => {
    it('should render all sales', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Corolla \(2022\)/)).toBeInTheDocument();
        expect(screen.getByText(/Toyota Camry \(2023\)/)).toBeInTheDocument();
        expect(screen.getByText(/Toyota RAV4 \(2021\)/)).toBeInTheDocument();
      });
    });

    it('should display sale prices', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(carUtils.formatPrice).toHaveBeenCalledWith(25000);
        expect(carUtils.formatPrice).toHaveBeenCalledWith(30000);
        expect(carUtils.formatPrice).toHaveBeenCalledWith(28000);
      });
    });

    it('should display purchase status badges', async () => {
      renderPage();
      
      await waitFor(() => {
        const statusBadges = screen.getAllByText('Pending');
        expect(statusBadges.length).toBeGreaterThanOrEqual(1);
        
        const confirmedBadges = screen.getAllByText('Confirmed');
        expect(confirmedBadges.length).toBeGreaterThanOrEqual(1);
        
        const deliveredBadges = screen.getAllByText('Delivered');
        expect(deliveredBadges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display buyer email', async () => {
      renderPage();
      
      await waitFor(() => {
        const emailLinks = screen.getAllByRole('link', { name: 'buyer@test.com' });
        expect(emailLinks.length).toBeGreaterThan(0);
        expect(emailLinks[0]).toHaveAttribute('href', 'mailto:buyer@test.com');
      });
    });

    it('should display buyer phone when available', async () => {
      renderPage();
      
      await waitFor(() => {
        const phoneLinks = screen.getAllByRole('link', { name: '1234567890' });
        expect(phoneLinks.length).toBeGreaterThan(0);
        expect(phoneLinks[0]).toHaveAttribute('href', 'tel:1234567890');
      });
    });

    it('should display car images when available', async () => {
      renderPage();
      
      await waitFor(() => {
        const images = screen.getAllByAltText(/Toyota/);
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/car1.jpg');
      });
    });

    it('should display payment method', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
        expect(screen.getByText('Cash')).toBeInTheDocument();
        expect(screen.getByText('Check')).toBeInTheDocument();
      });
    });

    it('should display observations when available', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Please deliver before 5 PM')).toBeInTheDocument();
      });
    });

    it('should not display observations when not available', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument();
      });
      
      // The Camry sale doesn't have observations
      const camryCard = screen.getByText(/Toyota Camry/).closest('[class*="saleCard"]');
      expect(camryCard).not.toHaveTextContent('Notes:');
    });

    it('should display car color', async () => {
      renderPage();
      
      await waitFor(() => {
        const colorLabels = screen.getAllByText('Color:');
        expect(colorLabels.length).toBe(3);
        const colorValues = screen.getAllByText('Blue');
        expect(colorValues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Confirm Purchase Action', () => {
    it('should show Confirm Purchase button for pending sales', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when clicking Confirm', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(purchaseService.confirmPurchase).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to confirm this purchase?');
      
      confirmSpy.mockRestore();
    });

    it('should call confirmPurchase when confirmed', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.confirmPurchase).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(purchaseService.confirmPurchase).toHaveBeenCalledWith(1);
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should show success alert after confirming', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.confirmPurchase).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase confirmed successfully!');
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should not confirm when user cancels dialog', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      expect(purchaseService.confirmPurchase).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('should handle confirm error', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(purchaseService.confirmPurchase).mockRejectedValue(new Error('Confirm failed'));
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to confirm purchase. Please try again.');
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Mark as Delivered Action', () => {
    it('should show Mark as Delivered button for confirmed sales', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Mark as Delivered')).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when clicking Mark as Delivered', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(purchaseService.markPurchaseAsDelivered).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Mark as Delivered')).toBeInTheDocument();
      });
      
      const button = screen.getByText('Mark as Delivered');
      fireEvent.click(button);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to mark this purchase as delivered?');
      
      confirmSpy.mockRestore();
    });

    it('should call markPurchaseAsDelivered when confirmed', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.markPurchaseAsDelivered).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Mark as Delivered')).toBeInTheDocument();
      });
      
      const button = screen.getByText('Mark as Delivered');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(purchaseService.markPurchaseAsDelivered).toHaveBeenCalledWith(2);
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should show success alert after marking as delivered', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.markPurchaseAsDelivered).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Mark as Delivered')).toBeInTheDocument();
      });
      
      const button = screen.getByText('Mark as Delivered');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase marked as delivered!');
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Cancel Purchase Action', () => {
    it('should show Cancel button for pending sales', async () => {
      renderPage();
      
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel');
        expect(cancelButtons.length).toBeGreaterThan(0);
      });
    });

    it('should show Cancel button for confirmed sales', async () => {
      renderPage();
      
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel');
        // Should have 2: one for pending, one for confirmed
        expect(cancelButtons.length).toBe(2);
      });
    });

    it('should call cancelPurchase when confirmed', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.cancelPurchase).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      
      await waitFor(() => {
        expect(purchaseService.cancelPurchase).toHaveBeenCalled();
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should show success alert after cancelling', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.cancelPurchase).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
      });
      
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase cancelled successfully!');
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Action Buttons by Status', () => {
    it('should not show action buttons for delivered sales', async () => {
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Toyota RAV4/)).toBeInTheDocument();
      });
      
      const deliveredCard = screen.getByText(/Toyota RAV4/).closest('[class*="saleCard"]');
      expect(deliveredCard).not.toHaveTextContent('Confirm Purchase');
      expect(deliveredCard).not.toHaveTextContent('Mark as Delivered');
    });
  });

  describe('Data Refresh', () => {
    it('should refresh sales list after confirming purchase', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(purchaseService.confirmPurchase).mockResolvedValue({} as any);
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(purchaseService.getPurchasesByDealershipId).toHaveBeenCalledTimes(2);
      });
      
      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
});