import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CarOfferList from './CarOfferList';
import { CarOffer } from '../../types/carOffer';
import { Car } from '../../types/car';
import { Dealership } from '../../types/dealership';

// Mock the CarOfferCard component
vi.mock('../molecules/CarOfferCard', () => ({
  default: ({ offer, onEdit, onDelete }: any) => (
    <div data-testid={`car-offer-card-${offer.id}`} className="card">
      <div>{offer.car.brand} {offer.car.model}</div>
      <div>Year {offer.car.year}</div>
      <div>{offer.car.fuelType}</div>
      <div>{offer.car.transmission}</div>
      <div>{offer.car.color}</div>
      <div>${offer.price.toLocaleString()}</div>
      {offer.dealershipNotes && <div>{offer.dealershipNotes}</div>}
      <div>{offer.available ? 'Available' : 'Unavailable'}</div>
      {onEdit && (
        <button onClick={() => onEdit()}>Edit</button>
      )}
      {onDelete && (
        <button onClick={() => onDelete()}>Delete</button>
      )}
    </div>
  ),
}));

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

const mockCar3: Car = {
  id: 3,
  brand: 'Ford',
  model: 'Focus',
  year: 2019,
  fuelType: 'ELECTRICO',
  transmission: 'AUTOMATICA',
  color: 'Blue',
  description: 'Electric car',
  publicationDate: '2024-01-17',
  images: ['https://example.com/car3.jpg'],
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

const mockOffer4: CarOffer = {
  id: 4,
  price: 30000,
  offerDate: '2024-01-18T00:00:00',
  dealershipNotes: 'Premium electric vehicle',
  available: true,
  car: mockCar3,
  dealership: mockDealership,
};

describe('CarOfferList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty state rendering', () => {
    it('should render empty state message when offers array is empty', () => {
      render(<CarOfferList offers={[]} />);

      expect(screen.getByText('No car offers available yet.')).toBeInTheDocument();
      expect(screen.getByText('Start by adding your first car offer!')).toBeInTheDocument();
    });

    it('should render empty state with proper class name', () => {
      const { container } = render(<CarOfferList offers={[]} />);
      
      const emptyDiv = container.querySelector('[class*="empty"]');
      expect(emptyDiv).toBeInTheDocument();
    });

    it('should not render grid container when empty', () => {
      const { container } = render(<CarOfferList offers={[]} />);

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).not.toBeInTheDocument();
    });

    it('should not render any CarOfferCard when empty', () => {
      render(<CarOfferList offers={[]} />);

      expect(screen.queryByTestId(/car-offer-card/)).not.toBeInTheDocument();
    });

    it('should render two paragraph elements in empty state', () => {
      const { container } = render(<CarOfferList offers={[]} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
    });
  });

  describe('Rendering with offers', () => {
    it('should render single offer correctly', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    it('should not render empty state when offers exist', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.queryByText('No car offers available yet.')).not.toBeInTheDocument();
      expect(screen.queryByText('Start by adding your first car offer!')).not.toBeInTheDocument();
    });

    it('should render multiple offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-2')).toBeInTheDocument();
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    it('should render correct number of offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-3')).toBeInTheDocument();
    });

    it('should render grid container when offers exist', () => {
      const { container } = render(<CarOfferList offers={[mockOffer1, mockOffer2]} />);

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should pass offer data to CarOfferCard component', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Year 2020')).toBeInTheDocument();
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('should render offers with correct keys', () => {
      const { container } = render(<CarOfferList offers={[mockOffer1, mockOffer2]} />);

      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBe(2);
    });

    it('should render all four test offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3, mockOffer4]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-4')).toBeInTheDocument();
    });
  });

  describe('onEdit callback behavior', () => {
    it('should pass onEdit callback to CarOfferCard when provided', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).toBeInTheDocument();
    });

    it('should not pass onEdit to CarOfferCard when undefined', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      const editButton = screen.queryByRole('button', { name: 'Edit' });
      expect(editButton).not.toBeInTheDocument();
    });

    it('should call onEdit with correct offer id when clicked', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      editButton.click();

      expect(mockOnEdit).toHaveBeenCalledWith(1);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit with correct ids for multiple offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3]} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      
      editButtons[0].click();
      expect(mockOnEdit).toHaveBeenCalledWith(1);

      editButtons[1].click();
      expect(mockOnEdit).toHaveBeenCalledWith(2);

      editButtons[2].click();
      expect(mockOnEdit).toHaveBeenCalledWith(3);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
    });

    it('should provide edit buttons for all offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3]} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      expect(editButtons).toHaveLength(3);
    });

    it('should handle multiple clicks on same edit button', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      
      editButton.click();
      editButton.click();
      editButton.click();

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('should handle string offer ids', () => {
      const offerWithStringId = { ...mockOffer1, id: 'offer-123' as any };
      
      render(<CarOfferList offers={[offerWithStringId]} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      editButton.click();

      expect(mockOnEdit).toHaveBeenCalledWith('offer-123');
    });
  });

  describe('onDelete callback behavior', () => {
    it('should pass onDelete callback to CarOfferCard when provided', () => {
      render(<CarOfferList offers={[mockOffer1]} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should not pass onDelete to CarOfferCard when undefined', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      const deleteButton = screen.queryByRole('button', { name: 'Delete' });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('should call onDelete with correct offer id when clicked', () => {
      render(<CarOfferList offers={[mockOffer1]} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      deleteButton.click();

      expect(mockOnDelete).toHaveBeenCalledWith(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete with correct ids for multiple offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer4]} onDelete={mockOnDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      
      deleteButtons[0].click();
      expect(mockOnDelete).toHaveBeenCalledWith(1);

      deleteButtons[1].click();
      expect(mockOnDelete).toHaveBeenCalledWith(2);

      deleteButtons[2].click();
      expect(mockOnDelete).toHaveBeenCalledWith(4);

      expect(mockOnDelete).toHaveBeenCalledTimes(3);
    });

    it('should provide delete buttons for all offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3]} onDelete={mockOnDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons).toHaveLength(3);
    });

    it('should handle multiple clicks on same delete button', () => {
      render(<CarOfferList offers={[mockOffer2]} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      
      deleteButton.click();
      deleteButton.click();

      expect(mockOnDelete).toHaveBeenCalledTimes(2);
      expect(mockOnDelete).toHaveBeenCalledWith(2);
    });

    it('should handle string offer ids for delete', () => {
      const offerWithStringId = { ...mockOffer1, id: 'offer-xyz' as any };
      
      render(<CarOfferList offers={[offerWithStringId]} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      deleteButton.click();

      expect(mockOnDelete).toHaveBeenCalledWith('offer-xyz');
    });
  });

  describe('Combined callback behavior', () => {
    it('should render both edit and delete buttons when both callbacks provided', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('should not render any buttons when no callbacks provided', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('should call callbacks independently', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      screen.getByRole('button', { name: 'Edit' }).click();
      screen.getByRole('button', { name: 'Delete' }).click();

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('should render only edit button when only onEdit provided', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('should render only delete button when only onDelete provided', () => {
      render(<CarOfferList offers={[mockOffer1]} onDelete={mockOnDelete} />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    });

    it('should handle different callbacks on different offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });

      editButtons[0].click();
      deleteButtons[1].click();

      expect(mockOnEdit).toHaveBeenCalledWith(1);
      expect(mockOnDelete).toHaveBeenCalledWith(2);
    });

    it('should render correct number of buttons for multiple offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Data display in cards', () => {
    it('should display car brand and model', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    it('should display car year', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('Year 2020')).toBeInTheDocument();
    });

    it('should display fuel type', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('NAFTA')).toBeInTheDocument();
    });

    it('should display transmission type', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('MANUAL')).toBeInTheDocument();
    });

    it('should display car color', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('should display offer price', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('$20,000')).toBeInTheDocument();
    });

    it('should display dealership notes', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
    });

    it('should display available status for available offers', () => {
      render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should display unavailable status for unavailable offers', () => {
      render(<CarOfferList offers={[mockOffer3]} />);

      expect(screen.getByText('Unavailable')).toBeInTheDocument();
    });

    it('should display different data for different offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer4]} />);

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('Ford Focus')).toBeInTheDocument();
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
      expect(screen.getByText('DIESEL')).toBeInTheDocument();
      expect(screen.getByText('ELECTRICO')).toBeInTheDocument();
    });

    it('should display multiple prices correctly', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer2]} />);

      expect(screen.getByText('$20,000')).toBeInTheDocument();
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle large number of offers', () => {
      const manyOffers = Array.from({ length: 50 }, (_, i) => ({
        ...mockOffer1,
        id: i + 1,
        car: {
          ...mockCar1,
          id: i + 1,
          model: `Model${i + 1}`,
        },
      }));

      render(<CarOfferList offers={manyOffers} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-50')).toBeInTheDocument();
    });

    it('should handle offers with same car but different offer ids', () => {
      const duplicateCarOffers = [
        mockOffer1,
        { ...mockOffer1, id: 100, price: 22000 },
        { ...mockOffer1, id: 101, price: 19000 },
      ];

      render(<CarOfferList offers={duplicateCarOffers} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-100')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-101')).toBeInTheDocument();
    });

    it('should handle offers with minimal data', () => {
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

      render(<CarOfferList offers={[minimalOffer]} />);

      expect(screen.getByTestId('car-offer-card-99')).toBeInTheDocument();
      expect(screen.getByText('Brand Model')).toBeInTheDocument();
    });

    it('should handle offers without dealership notes', () => {
      const offerWithoutNotes = { ...mockOffer1, dealershipNotes: undefined };

      render(<CarOfferList offers={[offerWithoutNotes]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
    });

    it('should handle very high prices', () => {
      const highPriceOffer = { ...mockOffer1, price: 999999999 };

      render(<CarOfferList offers={[highPriceOffer]} />);

      expect(screen.getByText('$999,999,999')).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      const zeroPriceOffer = { ...mockOffer1, price: 0 };

      render(<CarOfferList offers={[zeroPriceOffer]} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('should handle mixed available and unavailable offers', () => {
      render(<CarOfferList offers={[mockOffer1, mockOffer3, mockOffer2]} />);

      const availableElements = screen.getAllByText('Available');
      const unavailableElements = screen.getAllByText('Unavailable');

      expect(availableElements).toHaveLength(2);
      expect(unavailableElements).toHaveLength(1);
    });

    it('should handle offers with long notes', () => {
      const longNotesOffer = {
        ...mockOffer1,
        dealershipNotes: 'A'.repeat(500),
      };

      render(<CarOfferList offers={[longNotesOffer]} />);

      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('should handle special characters in notes', () => {
      const specialCharsOffer = {
        ...mockOffer1,
        dealershipNotes: 'Special <>&"\'',
      };

      render(<CarOfferList offers={[specialCharsOffer]} />);

      expect(screen.getByText('Special <>&"\'')).toBeInTheDocument();
    });
  });

  describe('Component re-rendering', () => {
    it('should update when offers change', () => {
      const { rerender } = render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.queryByText('Honda Civic')).not.toBeInTheDocument();

      rerender(<CarOfferList offers={[mockOffer2]} />);

      expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    it('should update from empty to filled', () => {
      const { rerender } = render(<CarOfferList offers={[]} />);

      expect(screen.getByText('No car offers available yet.')).toBeInTheDocument();

      rerender(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.queryByText('No car offers available yet.')).not.toBeInTheDocument();
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });

    it('should update from filled to empty', () => {
      const { rerender } = render(<CarOfferList offers={[mockOffer1, mockOffer2]} />);

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();

      rerender(<CarOfferList offers={[]} />);

      expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
      expect(screen.getByText('No car offers available yet.')).toBeInTheDocument();
    });

    it('should handle adding callbacks dynamically', () => {
      const { rerender } = render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();

      rerender(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('should handle removing callbacks dynamically', () => {
      const { rerender } = render(
        <CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();

      rerender(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('should handle adding more offers', () => {
      const { rerender } = render(<CarOfferList offers={[mockOffer1]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('car-offer-card-2')).not.toBeInTheDocument();

      rerender(<CarOfferList offers={[mockOffer1, mockOffer2]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-2')).toBeInTheDocument();
    });

    it('should handle removing offers', () => {
      const { rerender } = render(<CarOfferList offers={[mockOffer1, mockOffer2, mockOffer3]} />);

      expect(screen.getByTestId('car-offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-2')).toBeInTheDocument();

      rerender(<CarOfferList offers={[mockOffer2]} />);

      expect(screen.queryByTestId('car-offer-card-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('car-offer-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('car-offer-card-3')).not.toBeInTheDocument();
    });

    it('should handle changing offer order', () => {
      const { container, rerender } = render(
        <CarOfferList offers={[mockOffer1, mockOffer2]} />
      );

      let cards = container.querySelectorAll('[data-testid^="car-offer-card"]');
      expect(cards[0]).toHaveAttribute('data-testid', 'car-offer-card-1');
      expect(cards[1]).toHaveAttribute('data-testid', 'car-offer-card-2');

      rerender(<CarOfferList offers={[mockOffer2, mockOffer1]} />);

      cards = container.querySelectorAll('[data-testid^="car-offer-card"]');
      expect(cards[0]).toHaveAttribute('data-testid', 'car-offer-card-2');
      expect(cards[1]).toHaveAttribute('data-testid', 'car-offer-card-1');
    });

    it('should clear mock state between updates', () => {
      const { rerender } = render(
        <CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />
      );

      screen.getByRole('button', { name: 'Edit' }).click();
      expect(mockOnEdit).toHaveBeenCalledTimes(1);

      mockOnEdit.mockClear();

      rerender(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      screen.getByRole('button', { name: 'Edit' }).click();
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid consecutive updates', () => {
      const { rerender } = render(<CarOfferList offers={[mockOffer1]} />);

      rerender(<CarOfferList offers={[mockOffer2]} />);
      rerender(<CarOfferList offers={[mockOffer3]} />);
      rerender(<CarOfferList offers={[mockOffer4]} />);

      expect(screen.getByText('Ford Focus')).toBeInTheDocument();
      expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
    });
  });

  describe('Props validation and types', () => {
    it('should accept number offer ids', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      screen.getByRole('button', { name: 'Edit' }).click();
      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('should accept string offer ids', () => {
      const stringIdOffer = { ...mockOffer1, id: 'abc-123' as any };

      render(<CarOfferList offers={[stringIdOffer]} onEdit={mockOnEdit} />);

      screen.getByRole('button', { name: 'Edit' }).click();
      expect(mockOnEdit).toHaveBeenCalledWith('abc-123');
    });

    it('should work without optional callbacks', () => {
      expect(() => {
        render(<CarOfferList offers={[mockOffer1]} />);
      }).not.toThrow();
    });

    it('should work with only onEdit callback', () => {
      expect(() => {
        render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);
      }).not.toThrow();
    });

    it('should work with only onDelete callback', () => {
      expect(() => {
        render(<CarOfferList offers={[mockOffer1]} onDelete={mockOnDelete} />);
      }).not.toThrow();
    });

    it('should work with both callbacks', () => {
      expect(() => {
        render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML for empty state', () => {
      const { container } = render(<CarOfferList offers={[]} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
    });

    it('should have accessible edit buttons', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).toHaveAccessibleName();
    });

    it('should have accessible delete buttons', () => {
      render(<CarOfferList offers={[mockOffer1]} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toHaveAccessibleName();
    });

    it('should render proper container structure', () => {
      const { container } = render(<CarOfferList offers={[mockOffer1]} />);

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Performance considerations', () => {
    it('should render large lists efficiently', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        ...mockOffer1,
        id: i,
        car: { ...mockCar1, id: i },
      }));

      const start = performance.now();
      render(<CarOfferList offers={largeList} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000);
    });

    it('should handle rapid callback invocations', () => {
      render(<CarOfferList offers={[mockOffer1]} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });

      for (let i = 0; i < 10; i++) {
        editButton.click();
      }

      expect(mockOnEdit).toHaveBeenCalledTimes(10);
    });
  });
});