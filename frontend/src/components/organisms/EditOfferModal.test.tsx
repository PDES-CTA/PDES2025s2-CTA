import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditOfferModal from './EditOfferModal';
import { CarOffer } from '../../types/carOffer';
import { Car } from '../../types/car';
import { Dealership } from '../../types/dealership';

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

const mockCar: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  fuelType: 'NAFTA',
  transmission: 'MANUAL',
  color: 'White',
  description: 'Great car',
  publicationDate: '2024-01-15',
  images: ['https://example.com/car1.jpg'],
};

const mockOffer: CarOffer = {
  id: 1,
  price: 25000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar,
  dealership: mockDealership,
};

const mockOfferWithoutNotes: CarOffer = {
  id: 2,
  price: 30000,
  offerDate: '2024-01-16T00:00:00',
  available: false,
  car: mockCar,
  dealership: mockDealership,
};

const mockOfferWithDifferentCar: CarOffer = {
  id: 3,
  price: 28000,
  offerDate: '2024-01-17T00:00:00',
  dealershipNotes: 'Special offer',
  available: true,
  car: {
    ...mockCar,
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    color: 'Black',
    transmission: 'AUTOMATICA',
    fuelType: 'DIESEL',
  },
  dealership: mockDealership,
};

describe('EditOfferModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal with title', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Edit Offer')).toBeInTheDocument();
    });

    it('should render car information in subtitle', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Toyota Corolla (2020)')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should render all car information fields', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Brand:')).toBeInTheDocument();
      expect(screen.getByText('Toyota')).toBeInTheDocument();
      expect(screen.getByText('Model:')).toBeInTheDocument();
      expect(screen.getByText('Corolla')).toBeInTheDocument();
      expect(screen.getByText('Year:')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('Color:')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.getByText('Transmission:')).toBeInTheDocument();
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
      expect(screen.getByText('Fuel Type:')).toBeInTheDocument();
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
    });

    it('should render price input field', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText('Offer Price')).toBeInTheDocument();
    });

    it('should render availability checkbox', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Mark as available')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render dealership notes textarea', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/Dealership Notes/i)).toBeInTheDocument();
    });

    it('should render Cancel and Update Offer buttons', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update offer/i })).toBeInTheDocument();
    });

    it('should render with different car information', () => {
      render(
        <EditOfferModal
          offer={mockOfferWithDifferentCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Honda Civic (2021)')).toBeInTheDocument();
      expect(screen.getByText('Honda')).toBeInTheDocument();
      expect(screen.getByText('Civic')).toBeInTheDocument();
      expect(screen.getByText('2021')).toBeInTheDocument();
      expect(screen.getByText('Black')).toBeInTheDocument();
      expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
      expect(screen.getByText('DIESEL')).toBeInTheDocument();
    });
  });

  describe('Initial state from offer', () => {
    it('should populate price field with offer price', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      expect(priceInput.value).toBe('25000');
    });

    it('should populate availability checkbox with offer availability', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should populate notes with offer notes', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Great car in excellent condition');
    });

    it('should have empty notes when offer has no notes', () => {
      render(
        <EditOfferModal
          offer={mockOfferWithoutNotes}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should set checkbox to unchecked when offer is unavailable', () => {
      render(
        <EditOfferModal
          offer={mockOfferWithoutNotes}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should populate with decimal price values', () => {
      const offerWithDecimalPrice: CarOffer = {
        ...mockOffer,
        price: 25000.75,
      };

      render(
        <EditOfferModal
          offer={offerWithDecimalPrice}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      expect(priceInput.value).toBe('25000.75');
    });
  });

  describe('Form interactions', () => {
    it('should update price when input changes', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '30000' } });

      expect(priceInput.value).toBe('30000');
    });

    it('should update price with decimal values', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '30000.99' } });

      expect(priceInput.value).toBe('30000.99');
    });

    it('should toggle availability checkbox', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      expect(checkbox.checked).toBe(true);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });

    it('should update dealership notes when typing', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Updated notes' } });

      expect(textarea.value).toBe('Updated notes');
    });

    it('should clear existing notes', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '' } });

      expect(textarea.value).toBe('');
    });

    it('should handle multiple field updates', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;

      fireEvent.change(priceInput, { target: { value: '32000' } });
      fireEvent.click(checkbox);
      fireEvent.change(textarea, { target: { value: 'Completely updated' } });

      expect(priceInput.value).toBe('32000');
      expect(checkbox.checked).toBe(false);
      expect(textarea.value).toBe('Completely updated');
    });

    it('should handle very long notes', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const longNotes = 'A'.repeat(1000);
      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: longNotes } });

      expect(textarea.value).toBe(longNotes);
    });
  });

  describe('Form validation', () => {
    it('should have required attribute on price field', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toBeRequired();
    });

    it('should have min attribute set to 0 on price field', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('min', '0');
    });

    it('should have step attribute set to 0.01 on price field', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('step', '0.01');
    });

    it('should have type number on price field', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('type', 'number');
    });

    it('should have placeholder text on price field', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('placeholder', 'Enter your offer price');
    });

    it('should have placeholder text on notes textarea', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      expect(textarea).toHaveAttribute('placeholder', 'Add any notes about this offer...');
    });

    it('should have 4 rows on textarea', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      expect(textarea).toHaveAttribute('rows', '4');
    });
  });

  describe('Form submission', () => {
    it('should call onSubmit with updated form data when Update Offer clicked', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '28000' } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 28000,
        available: true,
        dealershipNotes: 'Great car in excellent condition',
      });
    });

    it('should convert price string to number', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '30000.50' } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 30000.50,
        available: true,
        dealershipNotes: 'Great car in excellent condition',
      });
    });

    it('should submit with updated notes', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      fireEvent.change(textarea, { target: { value: 'Completely updated notes' } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: 'Completely updated notes',
      });
    });

    it('should set dealershipNotes to undefined when cleared', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      fireEvent.change(textarea, { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: undefined,
      });
    });

    it('should submit with available false when unchecked', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: false,
        dealershipNotes: 'Great car in excellent condition',
      });
    });

    it('should submit with all fields updated', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      const checkbox = screen.getByRole('checkbox');
      const textarea = screen.getByLabelText(/Dealership Notes/i);

      fireEvent.change(priceInput, { target: { value: '35000' } });
      fireEvent.click(checkbox);
      fireEvent.change(textarea, { target: { value: 'All updated' } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 35000,
        available: false,
        dealershipNotes: 'All updated',
      });
    });

    it('should call onSubmit only once per submission', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const form = screen.getByRole('button', { name: /update offer/i }).closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should submit without modifying any fields', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: 'Great car in excellent condition',
      });
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button clicked', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', () => {
      const { container } = render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside modal', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const modal = screen.getByRole('heading', { name: /edit offer/i }).closest('div');
      fireEvent.click(modal!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when clicking form elements', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.click(priceInput);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not close when submitting form', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should have Cancel button with type button', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    it('should have Update Offer button with type submit', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large price values', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '999999999.99' } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 999999999.99,
        available: true,
        dealershipNotes: 'Great car in excellent condition',
      });
    });

    it('should handle offer with very long brand and model names', () => {
      const offerWithLongNames: CarOffer = {
        ...mockOffer,
        car: {
          ...mockCar,
          brand: 'Very Long Brand Name That Should Still Display',
          model: 'Very Long Model Name That Should Also Display',
        },
      };

      render(
        <EditOfferModal
          offer={offerWithLongNames}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(
        screen.getByText(/Very Long Brand Name That Should Still Display Very Long Model Name That Should Also Display/i)
      ).toBeInTheDocument();
    });

    it('should handle special characters in notes', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      const specialText = 'Special chars: @#$%^&*()_+-=[]{}|;:",.<>?/';
      fireEvent.change(textarea, { target: { value: specialText } });

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: specialText,
      });
    });

    it('should handle rapid form submissions', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /update offer/i });
      
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });

    it('should handle offer with zero price', () => {
      const zeroOffer: CarOffer = {
        ...mockOffer,
        price: 0,
      };

      render(
        <EditOfferModal
          offer={zeroOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      expect(priceInput.value).toBe('0');
    });

    it('should preserve form state after close attempt on modal content', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '35000' } });

      const modal = screen.getByRole('heading', { name: /edit offer/i }).closest('div');
      fireEvent.click(modal!);

      expect(priceInput.value).toBe('35000');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button label', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /close/i })).toHaveAttribute('aria-label', 'Close');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: /edit offer/i })).toBeInTheDocument();
    });

    it('should have associated labels for form fields', () => {
      render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText('Offer Price')).toBeInTheDocument();
      expect(screen.getByLabelText(/Dealership Notes/i)).toBeInTheDocument();
      expect(screen.getByText('Mark as available')).toBeInTheDocument();
    });

    it('should have accessible form structure', () => {
      const { container } = render(
        <EditOfferModal
          offer={mockOffer}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });
});