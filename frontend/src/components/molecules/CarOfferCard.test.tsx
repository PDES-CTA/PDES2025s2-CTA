import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DealershipOfferCard from './DealershipOfferCard';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';
import { Dealership } from '../../types/dealership';
import { authService, purchaseService } from '../../services/api';
import * as carUtils from '../../utils/carUtils';

vi.mock('../../services/api', () => ({
  authService: {
    getLoggedUser: vi.fn(),
  },
  purchaseService: {
    createPurchase: vi.fn(),
  },
}));

vi.mock('../../utils/carUtils', () => ({
  formatPrice: vi.fn((price: number) => `${price.toLocaleString()}`),
}));

vi.mock('../organisms/PurchaseConfirmationModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }: {
    isOpen: boolean;
    onConfirm: (paymentMethod: string, observations: string) => Promise<void>;
    onCancel: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="purchase-modal">
        <h2>Confirm Purchase</h2>
        <button onClick={async () => {
          await onConfirm('CREDIT_CARD', 'Test observations');
        }}>
          Confirm
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  },
}));

const mockCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  fuelType: 'NAFTA' as const,
  transmission: 'MANUAL' as const,
  color: 'White',
  description: 'Great car',
  publicationDate: '2024-01-15',
  images: ['https://example.com/car1.jpg'],
};

const mockDealership: Dealership = {
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

const mockOffer: CarOffer = {
  id: 1,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

const mockDealershipWithoutOptionalFields: Dealership = {
  id: 2,
  businessName: 'Minimal Dealership',
  cuit: '30-98765432-1',
  email: 'minimal@contact.com.ar',
  phone: undefined,
  address: undefined,
  city: undefined,
  province: undefined,
  description: undefined,
  active: true,
  registrationDate: '2024-01-01T00:00:00',
};

const mockUser = {
  id: 1,
  email: 'buyer@test.com',
  name: 'Test Buyer',
  role: 'BUYER',
};

const mockBuyer = {
  id: 1,
  firstName: 'Test',
  lastName: 'Buyer',
  dni: 12345678,
  email: 'buyer@test.com',
  phone: '1234567890',
  address: '123 Test St',
  registrationDate: '2024-01-01',
};

describe('DealershipOfferCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getLoggedUser).mockResolvedValue(mockUser);
  });

  describe('No Offer State', () => {
    it('should render no offer message when offer is not provided', () => {
      render(<DealershipOfferCard />);
      expect(screen.getByText('There are currently no dealership offers for this vehicle.')).toBeInTheDocument();
    });

    it('should render no offer message when offer is provided but dealership is null', () => {
      const offerWithNullDealership: CarOffer = {
        ...mockOffer,
        dealership: null as unknown as Dealership,
      };
      render(<DealershipOfferCard offer={offerWithNullDealership} />);
      expect(screen.getByText('There are currently no dealership offers for this vehicle.')).toBeInTheDocument();
    });

    it('should render no offer message when dealership is provided but offer is null', () => {
      render(<DealershipOfferCard dealership={mockDealership} />);
      expect(screen.getByText('There are currently no dealership offers for this vehicle.')).toBeInTheDocument();
    });

    it('should render building icon in no offer state', () => {
      const { container } = render(<DealershipOfferCard />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Basic Rendering', () => {
    it('should render dealership name', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(screen.getByText('Test Dealership')).toBeInTheDocument();
    });

    it('should render dealership name with building icon', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const heading = screen.getByText('Test Dealership').closest('h3');
      const icon = heading?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should format and display offer price', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(carUtils.formatPrice).toHaveBeenCalledWith(20000);
      expect(screen.getByText('20,000')).toBeInTheDocument();
    });

    it('should render Purchase button', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(screen.getByText('Purchase')).toBeInTheDocument();
    });

    it('should render Purchase button with shopping cart icon', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const button = screen.getByText('Purchase').closest('button');
      const icon = button?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Address Display', () => {
    it('should render complete address with city and province', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(screen.getByText(/123 Main St, Buenos Aires, Buenos Aires/)).toBeInTheDocument();
    });

    it('should render address with city but without province', () => {
      const dealershipWithoutProvince: Dealership = {
        ...mockDealership,
        province: undefined,
      };
      const offerWithDealership: CarOffer = {
        ...mockOffer,
        dealership: dealershipWithoutProvince,
      };
      render(<DealershipOfferCard offer={offerWithDealership} />);
      expect(screen.getByText(/123 Main St, Buenos Aires/)).toBeInTheDocument();
    });

    it('should render address with province but without city', () => {
      const dealershipWithoutCity: Dealership = {
        ...mockDealership,
        city: undefined,
      };
      const offerWithDealership: CarOffer = {
        ...mockOffer,
        dealership: dealershipWithoutCity,
      };
      render(<DealershipOfferCard offer={offerWithDealership} />);
      expect(screen.getByText(/123 Main St, Buenos Aires/)).toBeInTheDocument();
    });

    it('should render only address when city and province are missing', () => {
      const dealershipWithOnlyAddress: Dealership = {
        ...mockDealership,
        city: undefined,
        province: undefined,
      };
      const offerWithDealership: CarOffer = {
        ...mockOffer,
        dealership: dealershipWithOnlyAddress,
      };
      render(<DealershipOfferCard offer={offerWithDealership} />);
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    it('should not render address section when address is not provided', () => {
      const offerWithMinimalDealership: CarOffer = {
        ...mockOffer,
        dealership: mockDealershipWithoutOptionalFields,
      };
      render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
      expect(screen.queryByText(/Main St/)).not.toBeInTheDocument();
    });

    it('should render MapPin icon with address', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const addressText = screen.getByText(/123 Main St/);
      const parent = addressText.closest('p');
      const icon = parent?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Contact Information', () => {
    it('should render phone number with tel link', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const phoneLink = screen.getByRole('link', { name: '1234567890' });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:1234567890');
    });

    it('should not render phone section when phone is not provided', () => {
      const offerWithMinimalDealership: CarOffer = {
        ...mockOffer,
        dealership: mockDealershipWithoutOptionalFields,
      };
      render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
      expect(screen.queryByText(/1234567890/)).not.toBeInTheDocument();
    });

    it('should render phone icon with phone number', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const phoneLink = screen.getByRole('link', { name: '1234567890' });
      const parent = phoneLink.closest('p');
      const icon = parent?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render email with mailto link', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const emailLink = screen.getByRole('link', { name: 'contact@dealership.com' });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@dealership.com');
    });

    it('should render email icon with email address', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      const emailLink = screen.getByRole('link', { name: 'contact@dealership.com' });
      const parent = emailLink.closest('p');
      const icon = parent?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render both phone and email when available', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(screen.getByRole('link', { name: '1234567890' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'contact@dealership.com' })).toBeInTheDocument();
    });
  });

  describe('Dealership Notes', () => {
    it('should render dealership notes when provided', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
    });

    it('should not render dealership notes when not provided', () => {
      const offerWithoutNotes: CarOffer = {
        ...mockOffer,
        dealershipNotes: undefined,
      };
      render(<DealershipOfferCard offer={offerWithoutNotes} />);
      expect(screen.queryByText('Great car in excellent condition')).not.toBeInTheDocument();
    });

    it('should not render dealership notes when empty string', () => {
      const offerWithEmptyNotes: CarOffer = {
        ...mockOffer,
        dealershipNotes: '',
      };
      render(<DealershipOfferCard offer={offerWithEmptyNotes} />);
      expect(screen.queryByText('Great car in excellent condition')).not.toBeInTheDocument();
    });

    it('should handle long dealership notes', () => {
      const offerWithLongNotes: CarOffer = {
        ...mockOffer,
        dealershipNotes: 'This is a very long note about the car that contains many details about its condition, history, and features. It should be displayed properly without breaking the layout.',
      };
      render(<DealershipOfferCard offer={offerWithLongNotes} />);
      expect(screen.getByText(/This is a very long note/)).toBeInTheDocument();
    });
  });

  describe('Dealership Prop Priority', () => {
    it('should use separate dealership prop when provided', () => {
      const separateDealership: Dealership = {
        ...mockDealership,
        businessName: 'Separate Dealership',
      };
      render(<DealershipOfferCard offer={mockOffer} dealership={separateDealership} />);
      expect(screen.getByText('Separate Dealership')).toBeInTheDocument();
      expect(screen.queryByText('Test Dealership')).not.toBeInTheDocument();
    });

    it('should use dealership from offer when separate dealership prop is not provided', () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      expect(screen.getByText('Test Dealership')).toBeInTheDocument();
    });

    it('should prioritize separate dealership prop over offer dealership', () => {
      const separateDealership: Dealership = {
        ...mockDealership,
        businessName: 'Priority Dealership',
        email: 'priority@dealership.com',
      };
      render(<DealershipOfferCard offer={mockOffer} dealership={separateDealership} />);
      expect(screen.getByText('Priority Dealership')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'priority@dealership.com' })).toBeInTheDocument();
    });
  });

  describe('Purchase Modal Interaction', () => {
    it('should open modal when Purchase button is clicked', async () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      
      expect(screen.queryByTestId('purchase-modal')).not.toBeInTheDocument();
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
    });

    it('should close modal when cancel is clicked', async () => {
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('purchase-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Purchase API Call', () => {
    it('should call authService.getLoggedUser when confirming purchase', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        observations: 'Test observations',
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(authService.getLoggedUser).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });

    it('should call purchaseService.createPurchase with correct parameters', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        observations: 'Test observations',
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(purchaseService.createPurchase).toHaveBeenCalledWith({
          buyerId: 1,
          carOfferId: 1,
          finalPrice: 20000,
          purchaseStatus: 'PENDING',
          paymentMethod: 'CREDIT_CARD',
          observations: 'Test observations',
        });
      });
      
      alertSpy.mockRestore();
    });

    it('should show success alert after successful purchase', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase completed successfully!');
      });
      
      alertSpy.mockRestore();
    });

    it('should close modal after successful purchase', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('purchase-modal')).not.toBeInTheDocument();
      });
      
      alertSpy.mockRestore();
    });

    it('should handle purchase error', async () => {
      vi.mocked(purchaseService.createPurchase).mockRejectedValue(new Error('Purchase failed'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to complete purchase. Please try again.');
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      
      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle undefined observations', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CASH' as const,
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(purchaseService.createPurchase).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'CREDIT_CARD',
            observations: 'Test observations',
          })
        );
      });
      
      alertSpy.mockRestore();
    });
  });

  describe('Callbacks', () => {
    it('should call onPurchaseSuccess after successful purchase', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const onPurchaseSuccess = vi.fn();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} onPurchaseSuccess={onPurchaseSuccess} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(onPurchaseSuccess).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });

    it('should not call onPurchaseSuccess when purchase fails', async () => {
      vi.mocked(purchaseService.createPurchase).mockRejectedValue(new Error('Purchase failed'));
      const onPurchaseSuccess = vi.fn();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} onPurchaseSuccess={onPurchaseSuccess} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      
      expect(onPurchaseSuccess).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      
      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should not crash when onPurchaseSuccess is not provided', async () => {
      const mockPurchase = {
        id: 1,
        finalPrice: 20000,
        purchaseDate: '2024-01-15',
        purchaseStatus: 'PENDING' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        carOffer: mockOffer,
        buyer: mockBuyer,
      };
      
      vi.mocked(purchaseService.createPurchase).mockResolvedValue(mockPurchase);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DealershipOfferCard offer={mockOffer} />);
      
      const purchaseButton = screen.getByText('Purchase');
      fireEvent.click(purchaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase completed successfully!');
      });
      
      alertSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle offers with very high prices', () => {
      const expensiveOffer: CarOffer = {
        ...mockOffer,
        price: 9999999,
      };
      render(<DealershipOfferCard offer={expensiveOffer} />);
      expect(carUtils.formatPrice).toHaveBeenCalledWith(9999999);
    });

    it('should handle offers with zero price', () => {
      const freeOffer: CarOffer = {
        ...mockOffer,
        price: 0,
      };
      render(<DealershipOfferCard offer={freeOffer} />);
      expect(carUtils.formatPrice).toHaveBeenCalledWith(0);
    });

    it('should render minimal dealership with only required fields', () => {
      const offerWithMinimalDealership: CarOffer = {
        ...mockOffer,
        dealership: mockDealershipWithoutOptionalFields,
      };
      render(<DealershipOfferCard offer={offerWithMinimalDealership} />);
      
      expect(screen.getByText('Minimal Dealership')).toBeInTheDocument();
      expect(screen.getByText('20,000')).toBeInTheDocument();
      expect(screen.queryByText(/Main St/)).not.toBeInTheDocument();
      expect(screen.queryByText(/1234567890/)).not.toBeInTheDocument();
    });

    it('should handle special characters in contact information', () => {
      const specialDealership: Dealership = {
        ...mockDealership,
        phone: '+54 11 1234-5678',
        email: 'test+special@dealership.com',
      };
      const offerWithSpecialChars: CarOffer = {
        ...mockOffer,
        dealership: specialDealership,
      };
      render(<DealershipOfferCard offer={offerWithSpecialChars} />);
      
      const phoneLink = screen.getByRole('link', { name: '+54 11 1234-5678' });
      const emailLink = screen.getByRole('link', { name: 'test+special@dealership.com' });
      
      expect(phoneLink).toHaveAttribute('href', 'tel:+54 11 1234-5678');
      expect(emailLink).toHaveAttribute('href', 'mailto:test+special@dealership.com');
    });
  });
});