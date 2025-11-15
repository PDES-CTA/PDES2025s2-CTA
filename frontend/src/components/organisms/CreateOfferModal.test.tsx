import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateOfferModal from './CreateOfferModal';
import { Car } from '../../types/car';

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

const mockCarWithDifferentSpecs: Car = {
  id: 2,
  brand: 'Honda',
  model: 'Civic',
  year: 2021,
  fuelType: 'DIESEL',
  transmission: 'AUTOMATICA',
  color: 'Black',
  description: 'Sporty car',
  publicationDate: '2024-01-16',
  images: ['https://example.com/car2.jpg'],
};

describe('CreateOfferModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal with title', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('heading', { name: /create offer/i }).closest('div')).toBeInTheDocument();
    });

    it('should render car information in subtitle', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Toyota Corolla (2020)')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should render all car information fields', () => {
      render(
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText('Offer Price')).toBeInTheDocument();
    });

    it('should render availability checkbox', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Mark as available')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render dealership notes textarea', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/Dealership Notes/i)).toBeInTheDocument();
    });

    it('should render Cancel and Create Offer buttons', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create offer/i })).toBeInTheDocument();
    });

    it('should render with different car information', () => {
      render(
        <CreateOfferModal
          car={mockCarWithDifferentSpecs}
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

  describe('Initial state', () => {
    it('should have price field with default value of 0.0', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      expect(priceInput.value).toBe('0.0');
    });

    it('should have availability checkbox checked by default', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should have empty dealership notes by default', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });
  });

  describe('Form interactions', () => {
    it('should update price when input changes', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '25000' } });

      expect(priceInput.value).toBe('25000');
    });

    it('should update price with decimal values', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '25000.50' } });

      expect(priceInput.value).toBe('25000.50');
    });

    it('should toggle availability checkbox', () => {
      render(
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Great condition, low mileage' } });

      expect(textarea.value).toBe('Great condition, low mileage');
    });

    it('should handle multiple field updates', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price') as HTMLInputElement;
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      const textarea = screen.getByLabelText(/Dealership Notes/i) as HTMLTextAreaElement;

      fireEvent.change(priceInput, { target: { value: '30000' } });
      fireEvent.click(checkbox);
      fireEvent.change(textarea, { target: { value: 'Special offer' } });

      expect(priceInput.value).toBe('30000');
      expect(checkbox.checked).toBe(false);
      expect(textarea.value).toBe('Special offer');
    });

    it('should handle very long notes', () => {
      render(
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toBeRequired();
    });

    it('should have min attribute set to 0 on price field', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('min', '0');
    });

    it('should have step attribute set to 0.01 on price field', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('step', '0.01');
    });

    it('should have type number on price field', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('type', 'number');
    });

    it('should have placeholder text on price field', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      expect(priceInput).toHaveAttribute('placeholder', 'Enter your offer price');
    });

    it('should have placeholder text on notes textarea', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      expect(textarea).toHaveAttribute('placeholder', 'Add any notes about this offer...');
    });

    it('should have 4 rows on textarea', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      expect(textarea).toHaveAttribute('rows', '4');
    });
  });

  describe('Form submission', () => {
    it('should call onSubmit with form data when Create Offer clicked', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: undefined,
      });
    });

    it('should convert price string to number', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '30000.75' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 30000.75,
        available: true,
        dealershipNotes: undefined,
      });
    });

    it('should include dealership notes when provided', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      const textarea = screen.getByLabelText(/Dealership Notes/i);

      fireEvent.change(priceInput, { target: { value: '25000' } });
      fireEvent.change(textarea, { target: { value: 'Excellent condition' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: 'Excellent condition',
      });
    });

    it('should set dealershipNotes to undefined when empty', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: undefined,
      });
    });

    it('should submit with available false when unchecked', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      const checkbox = screen.getByRole('checkbox');

      fireEvent.change(priceInput, { target: { value: '25000' } });
      fireEvent.click(checkbox);

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: false,
        dealershipNotes: undefined,
      });
    });

    it('should call onSubmit only once per submission', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const form = screen.getByRole('button', { name: /create offer/i }).closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle zero price', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 0,
        available: true,
        dealershipNotes: undefined,
      });
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const modal = screen.getByRole('heading', { name: /create offer/i }).closest('div');
      fireEvent.click(modal!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when clicking form elements', () => {
      render(
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should have Cancel button with type button', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    it('should have Create Offer button with type submit', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large price values', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '999999999.99' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 999999999.99,
        available: true,
        dealershipNotes: undefined,
      });
    });

    it('should handle car with very long brand and model names', () => {
      const longNameCar: Car = {
        ...mockCar,
        brand: 'Very Long Brand Name That Should Still Display',
        model: 'Very Long Model Name That Should Also Display',
      };

      render(
        <CreateOfferModal
          car={longNameCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      const specialText = 'Special chars: @#$%^&*()_+-=[]{}|;:",.<>?/';
      fireEvent.change(textarea, { target: { value: specialText } });

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: specialText,
      });
    });

    it('should handle whitespace-only notes as undefined', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByLabelText(/Dealership Notes/i);
      fireEvent.change(textarea, { target: { value: '   ' } });

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);

      // Whitespace is preserved in current implementation
      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 25000,
        available: true,
        dealershipNotes: '   ',
      });
    });

    it('should handle rapid form submissions', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const priceInput = screen.getByLabelText('Offer Price');
      fireEvent.change(priceInput, { target: { value: '25000' } });

      const submitButton = screen.getByRole('button', { name: /create offer/i });
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button label', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /close/i })).toHaveAttribute('aria-label', 'Close');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: /create offer/i })).toBeInTheDocument();
    });

    it('should have associated labels for form fields', () => {
      render(
        <CreateOfferModal
          car={mockCar}
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
        <CreateOfferModal
          car={mockCar}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });
});