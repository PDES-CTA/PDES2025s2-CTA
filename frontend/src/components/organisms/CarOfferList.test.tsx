import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarOfferList from './CarOfferList';
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

const mockCar1: Car = {
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

const mockCar2: Car = {
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

const mockOffer1: CarOffer = {
  id: 1,
  price: 20000,
  offerDate: '2024-01-15T00:00:00',
  dealershipNotes: 'Great car in excellent condition',
  available: true,
  car: mockCar1,
  dealership: mockDealership,
};

const mockOffer2: CarOffer = {
  id: 2,
  price: 25000,
  offerDate: '2024-01-16T00:00:00',
  dealershipNotes: 'Sporty and reliable',
  available: true,
  car: mockCar2,
  dealership: mockDealership,
};

const mockOffer3: CarOffer = {
  id: 3,
  price: 18000,
  offerDate: '2024-01-17T00:00:00',
  dealershipNotes: 'Budget friendly',
  available: false,
  car: mockCar1,
  dealership: mockDealership,
};

describe('CarOfferList', () => {
  const mockOnViewDetails = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty state', () => {
    it('should render empty state when offers array is empty', () => {
      render(
        <CarOfferList
          offers={[]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('No car offers available yet.')).toBeInTheDocument();
      expect(screen.getByText('Start by adding your first car offer!')).toBeInTheDocument();
    });

    it('should not render grid when offers array is empty', () => {
      const { container } = render(
        <CarOfferList
          offers={[]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).not.toBeInTheDocument();
    });

    it('should not render any offer cards when empty', () => {
      render(
        <CarOfferList
          offers={[]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /View Details/i })).not.toBeInTheDocument();
    });
  });

  describe('Rendering with offers', () => {
    it('should render single offer', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
    });

    it('should not render empty state when offers exist', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByText('No car offers available yet.')).not.toBeInTheDocument();
    });

    it('should render multiple offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    it('should render correct number of offer cards', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2, mockOffer3]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
      expect(viewDetailsButtons).toHaveLength(3);
    });

    it('should render offers in grid layout', () => {
      const { container } = render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should use offer id as key', () => {
      const { container } = render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
        />
      );

      // React keys are not in the DOM, but we can verify multiple cards are rendered
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('onViewDetails callback', () => {
    it('should call onViewDetails with car id when View Details clicked', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
      fireEvent.click(viewDetailsButton);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockCar1.id);
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should call onViewDetails with correct car id for multiple offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
      
      fireEvent.click(viewDetailsButtons[0]);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockCar1.id);

      fireEvent.click(viewDetailsButtons[1]);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockCar2.id);
    });

    it('should call onViewDetails multiple times', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
      
      fireEvent.click(viewDetailsButton);
      fireEvent.click(viewDetailsButton);
      fireEvent.click(viewDetailsButton);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(3);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockCar1.id);
    });
  });

  describe('onEdit callback', () => {
    it('should render Edit button when onEdit is provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('should not render Edit button when onEdit is undefined', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    });

    it('should call onEdit with offer id when Edit clicked', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /Edit/i });
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockOffer1.id);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit with correct offer id for multiple offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      
      fireEvent.click(editButtons[0]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockOffer1.id);

      fireEvent.click(editButtons[1]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockOffer2.id);
    });

    it('should render Edit buttons for all offers when onEdit provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2, mockOffer3]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons).toHaveLength(3);
    });
  });

  describe('onDelete callback', () => {
    it('should render Delete button when onDelete is provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should not render Delete button when onDelete is undefined', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
    });

    it('should call onDelete with offer id when Delete clicked', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockOffer1.id);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete with correct offer id for multiple offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      
      fireEvent.click(deleteButtons[0]);
      expect(mockOnDelete).toHaveBeenCalledWith(mockOffer1.id);

      fireEvent.click(deleteButtons[1]);
      expect(mockOnDelete).toHaveBeenCalledWith(mockOffer2.id);
    });

    it('should render Delete buttons for all offers when onDelete provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2, mockOffer3]}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Combined callbacks', () => {
    it('should render all buttons when all callbacks provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should only render View Details when no optional callbacks provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
    });

    it('should call different callbacks independently', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /View Details/i }));
      fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should render only Edit button when only onEdit provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
    });

    it('should render only Delete button when only onDelete provided', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    });
  });

  describe('Offer display', () => {
    it('should display available badge for available offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should display unavailable badge for unavailable offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer3]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Unavailable')).toBeInTheDocument();
    });

    it('should display all offer information', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText(/Year 2020/)).toBeInTheDocument();
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('should display offer notes', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
    });

    it('should display different information for different offers', () => {
      render(
        <CarOfferList
          offers={[mockOffer1, mockOffer2]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText(/20,?000|20\.000/)).toBeInTheDocument();
      expect(screen.getByText(/25,?000|25\.000/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle many offers', () => {
      const manyOffers = Array.from({ length: 50 }, (_, i) => ({
        ...mockOffer1,
        id: i + 1,
        car: {
          ...mockCar1,
          id: i + 1,
          model: `Model ${i + 1}`,
        },
      }));

      render(
        <CarOfferList
          offers={manyOffers}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
      expect(viewDetailsButtons).toHaveLength(50);
    });

    it('should handle offers with same car', () => {
      const duplicateCarOffers = [
        mockOffer1,
        { ...mockOffer1, id: 100, price: 22000 },
      ];

      render(
        <CarOfferList
          offers={duplicateCarOffers}
          onViewDetails={mockOnViewDetails}
        />
      );

      const toyotaText = screen.getAllByText('Toyota Corolla');
      expect(toyotaText).toHaveLength(2);
    });

    it('should handle offers with missing optional data', () => {
      const minimalOffer: CarOffer = {
        id: 99,
        price: 15000,
        offerDate: '2024-01-01T00:00:00',
        available: true,
        car: {
          id: 99,
          brand: 'Brand',
          model: 'Model',
          year: 2020,
          fuelType: 'NAFTA',
          transmission: 'MANUAL',
          color: 'White',
          publicationDate: '2024-01-01',
        },
        dealership: mockDealership,
      };

      render(
        <CarOfferList
          offers={[minimalOffer]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Brand Model')).toBeInTheDocument();
    });

    it('should handle re-render with different offers', () => {
      const { rerender } = render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();

      rerender(
        <CarOfferList
          offers={[mockOffer2]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    it('should handle re-render from empty to filled', () => {
      const { rerender } = render(
        <CarOfferList
          offers={[]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('No car offers available yet.')).toBeInTheDocument();

      rerender(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByText('No car offers available yet.')).not.toBeInTheDocument();
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    it('should handle re-render from filled to empty', () => {
      const { rerender } = render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();

      rerender(
        <CarOfferList
          offers={[]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
      expect(screen.getByText('No car offers available yet.')).toBeInTheDocument();
    });

    it('should handle adding callbacks after initial render', () => {
      const { rerender } = render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();

      rerender(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should handle removing callbacks after initial render', () => {
      const { rerender } = render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();

      rerender(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should have accessible empty state message', () => {
      render(
        <CarOfferList
          offers={[]}
          onViewDetails={mockOnViewDetails}
        />
      );

      const emptyMessage = screen.getByText('No car offers available yet.');
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should render semantic HTML structure', () => {
      const { container } = render(
        <CarOfferList
          offers={[mockOffer1]}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });
});