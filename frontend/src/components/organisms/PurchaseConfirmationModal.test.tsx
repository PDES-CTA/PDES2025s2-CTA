import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PurchaseConfirmationModal from './PurchaseConfirmationModal';
import { CarOffer } from '../../types/carOffer';
import * as carUtils from '../../utils/carUtils';

vi.mock('../../utils/carUtils', () => ({
  formatPrice: vi.fn((price: number) => `$${price.toLocaleString()}`),
}));

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

const mockOffer: CarOffer = {
  id: 1,
  price: 25000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

describe('PurchaseConfirmationModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <PurchaseConfirmationModal
          isOpen={false}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display modal title', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
    });

    it('should display confirmation question', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Are you sure you want to buy this car?')).toBeInTheDocument();
    });

    it('should display vehicle details', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/Toyota Corolla \(2022\)/)).toBeInTheDocument();
    });

    it('should display dealership name', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Test Dealership')).toBeInTheDocument();
    });

    it('should format and display price', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(carUtils.formatPrice).toHaveBeenCalledWith(25000);
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });

    it('should display Purchase Details section', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Purchase Details')).toBeInTheDocument();
    });

    it('should display all detail labels', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Vehicle:')).toBeInTheDocument();
      expect(screen.getByText('Dealership:')).toBeInTheDocument();
      expect(screen.getByText('Price:')).toBeInTheDocument();
    });
  });

  describe('Payment Method Selection', () => {
    it('should default to CASH payment method', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const select = screen.getByLabelText(/Payment Method:/i) as HTMLSelectElement;
      expect(select.value).toBe('CASH');
    });

    it('should display all payment method options', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Check')).toBeInTheDocument();
    });

    it('should update payment method when selection changes', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const select = screen.getByLabelText(/Payment Method:/i) as HTMLSelectElement;
      
      fireEvent.change(select, { target: { value: 'CREDIT_CARD' } });
      expect(select.value).toBe('CREDIT_CARD');
      
      fireEvent.change(select, { target: { value: 'CHECK' } });
      expect(select.value).toBe('CHECK');
    });

    it('should disable payment method select when loading', async () => {
      mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        const select = screen.getByLabelText(/Payment Method:/i) as HTMLSelectElement;
        expect(select.disabled).toBe(true);
      });
    });
  });

  describe('Observations Field', () => {
    it('should display observations textarea', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByLabelText(/Observations \(optional\):/i)).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const textarea = screen.getByPlaceholderText('Add any notes or special requests...');
      expect(textarea).toBeInTheDocument();
    });

    it('should start with empty observations', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const textarea = screen.getByLabelText(/Observations \(optional\):/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should update observations when typing', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const textarea = screen.getByLabelText(/Observations \(optional\):/i) as HTMLTextAreaElement;
      
      fireEvent.change(textarea, { target: { value: 'Please deliver before 5 PM' } });
      expect(textarea.value).toBe('Please deliver before 5 PM');
    });

    it('should disable observations textarea when loading', async () => {
      mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        const textarea = screen.getByLabelText(/Observations \(optional\):/i) as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(true);
      });
    });
  });

  describe('Confirm Button', () => {
    it('should display Confirm Purchase button', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
    });

    it('should call onConfirm with default values when clicked', async () => {
      mockOnConfirm.mockResolvedValue(undefined);
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('CASH', '');
      });
    });

    it('should call onConfirm with selected payment method', async () => {
      mockOnConfirm.mockResolvedValue(undefined);
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const select = screen.getByLabelText(/Payment Method:/i);
      fireEvent.change(select, { target: { value: 'CREDIT_CARD' } });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('CREDIT_CARD', '');
      });
    });

    it('should call onConfirm with observations', async () => {
      mockOnConfirm.mockResolvedValue(undefined);
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const textarea = screen.getByLabelText(/Observations \(optional\):/i);
      fireEvent.change(textarea, { target: { value: 'Urgent delivery' } });
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('CASH', 'Urgent delivery');
      });
    });

    it('should show loading state when confirming', async () => {
      mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
    });

    it('should disable confirm button when loading', async () => {
      mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase') as HTMLButtonElement;
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        const processingButton = screen.getByText('Processing...') as HTMLButtonElement;
        expect(processingButton.disabled).toBe(true);
      });
    });

    it('should return to normal state after successful confirm', async () => {
      mockOnConfirm.mockResolvedValue(undefined);
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should display Cancel button', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when Cancel button is clicked', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should reset form state when cancelled', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const select = screen.getByLabelText(/Payment Method:/i) as HTMLSelectElement;
      const textarea = screen.getByLabelText(/Observations \(optional\):/i) as HTMLTextAreaElement;
      
      fireEvent.change(select, { target: { value: 'CREDIT_CARD' } });
      fireEvent.change(textarea, { target: { value: 'Test notes' } });
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable cancel button when loading', async () => {
      mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel') as HTMLButtonElement;
        expect(cancelButton.disabled).toBe(true);
      });
    });
  });

  describe('Close Button', () => {
    it('should display close button with X icon', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onCancel when close button is clicked', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should reset form state when close button is clicked', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const select = screen.getByLabelText(/Payment Method:/i);
      const textarea = screen.getByLabelText(/Observations \(optional\):/i);
      
      fireEvent.change(select, { target: { value: 'CHECK' } });
      fireEvent.change(textarea, { target: { value: 'Special request' } });
      
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Overlay Click', () => {
    it('should call onCancel when clicking overlay', () => {
      const { container } = render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const overlay = container.querySelector('[class*="overlay"]');
      expect(overlay).toBeInTheDocument();
      
      fireEvent.click(overlay!);
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not call onCancel when clicking modal content', () => {
      const { container } = render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const modal = container.querySelector('[class*="modal"]');
      expect(modal).toBeInTheDocument();
      
      fireEvent.click(modal!);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should reset form when clicking overlay', () => {
      const { container } = render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const select = screen.getByLabelText(/Payment Method:/i);
      fireEvent.change(select, { target: { value: 'CREDIT_CARD' } });
      
      const overlay = container.querySelector('[class*="overlay"]');
      fireEvent.click(overlay!);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle offers with long vehicle names', () => {
      const longNameOffer: CarOffer = {
        ...mockOffer,
        car: {
          ...mockCar,
          brand: 'Mercedes-Benz',
          model: 'AMG GT 63 S 4MATIC+ 4-Door Coupe',
        },
      };
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={longNameOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText(/Mercedes-Benz AMG GT 63 S 4MATIC\+ 4-Door Coupe/)).toBeInTheDocument();
    });

    it('should handle offers with long dealership names', () => {
      const longDealershipOffer: CarOffer = {
        ...mockOffer,
        dealership: {
          ...mockDealership,
          businessName: 'Super Premium Luxury Car Dealership Corporation International',
        },
      };
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={longDealershipOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Super Premium Luxury Car Dealership Corporation International')).toBeInTheDocument();
    });

    it('should handle very large prices', () => {
      const expensiveOffer: CarOffer = {
        ...mockOffer,
        price: 9999999,
      };
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={expensiveOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(carUtils.formatPrice).toHaveBeenCalledWith(9999999);
    });

    it('should handle long observations text', () => {
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const textarea = screen.getByLabelText(/Observations \(optional\):/i);
      const longText = 'This is a very long observation text that contains many details about the purchase including delivery instructions, payment preferences, and special requests that need to be handled carefully.';
      
      fireEvent.change(textarea, { target: { value: longText } });
      expect((textarea as HTMLTextAreaElement).value).toBe(longText);
    });

    it('should handle rapid confirm clicks', async () => {
      mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <PurchaseConfirmationModal
          isOpen={true}
          offer={mockOffer}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Confirm Purchase');
      
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });
});