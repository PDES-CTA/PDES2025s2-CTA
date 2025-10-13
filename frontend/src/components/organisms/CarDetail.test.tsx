import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CarDetail from './CarDetail';
import { FUEL_TYPES, TRANSMISSION_TYPES } from '../../constants';
import type { Car } from '../../types/car';

vi.mock('../atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../atoms')>();
  return {
    ...actual,
    LoadingSpinner: () => <div>Cargando...</div>,
  };
});

vi.mock('../../utils/carUtils', () => ({
  formatPrice: (price: number) => `$ ${price.toLocaleString('es-AR', { minimumFractionDigits: 0 }).replace(/,/g, '.')}`,
  formatDate: (date: string) => `Published: ${new Date(date).toLocaleDateString('es-AR')}`,
  getFuelTypeClass: (fuel: string) => `fuel-${fuel.toLowerCase()}`,
  getTransmissionClass: (transmission: string) => `transmission-${transmission.toLowerCase()}`,
}));


const mockCar: Car = {
  id: 456,
  brand: 'Honda',
  model: 'Civic',
  year: 2021,
  price: 28000,
  mileage: 30000,
  color: 'Red',
  fuelType: FUEL_TYPES.GASOLINE,
  transmission: TRANSMISSION_TYPES.MANUAL,
  description: 'Excellent condition, well maintained',
  images: ['https://example.com/honda.jpg'],
  available: true,
  publicationDate: '2024-02-10'
};

describe('CarDetail', () => {
  const mockOnBack = vi.fn();
  const mockGetCarById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading spinner initially', () => {
    mockGetCarById.mockImplementation(() => new Promise(() => {})); // Represents a pending promise

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    expect(screen.getByText(/cargando.../i)).toBeInTheDocument();
  });

  it('should load and display car details successfully', async () => {
    mockGetCarById.mockResolvedValue(mockCar);

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    expect(screen.getByText('Year 2021')).toBeInTheDocument();
    expect(screen.getByText('$ 28.000')).toBeInTheDocument();
    expect(screen.getByText(/30.000\s*km/)).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Excellent condition, well maintained')).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    mockGetCarById.mockRejectedValue(new Error('Failed to fetch car'));

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch car/i)).toBeInTheDocument();
    });
  });

  it('should display "Car not found" when car is null', async () => {
    mockGetCarById.mockResolvedValue(null);

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Car not found')).toBeInTheDocument();
    });
  });

  it('should call onBack when back button is clicked', async () => {
    mockGetCarById.mockResolvedValue(mockCar);
    const user = userEvent.setup();

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => expect(screen.getByText('Honda Civic')).toBeInTheDocument());

    const backButton = screen.getByRole('button', { name: /back to catalog/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });


  it('should display placeholder when car has no images', async () => {
    const carWithoutImages = { ...mockCar, images: [] };
    mockGetCarById.mockResolvedValue(carWithoutImages);

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => expect(screen.getByText('Honda Civic')).toBeInTheDocument());

    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('should display "Sold" badge and disable button when car is not available', async () => {
    const unavailableCar = { ...mockCar, available: false };
    mockGetCarById.mockResolvedValue(unavailableCar);

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /not available/i });
    expect(button).toBeDisabled();
  });

  it('should enable contact dealer button when car is available', async () => {
    mockGetCarById.mockResolvedValue(mockCar);

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => expect(screen.getByText('Contact Dealer')).toBeInTheDocument());

    const button = screen.getByRole('button', { name: /contact dealer/i });
    expect(button).not.toBeDisabled();
  });

  it('should not display description section when car has no description', async () => {
    const carWithoutDescription = { ...mockCar, description: undefined };
    mockGetCarById.mockResolvedValue(carWithoutDescription);

    render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => expect(screen.getByText('Honda Civic')).toBeInTheDocument());

    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('should call getCarById with correct carId and refetch when it changes', async () => {
    mockGetCarById.mockResolvedValue(mockCar);

    const { rerender } = render(
      <CarDetail 
        carId="456" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => {
      expect(mockGetCarById).toHaveBeenCalledWith('456');
    });

    const newCar = { ...mockCar, id: 789, brand: 'Toyota', model: 'Corolla' };
    mockGetCarById.mockResolvedValue(newCar);

    rerender(
      <CarDetail 
        carId="789" 
        onBack={mockOnBack} 
        getCarById={mockGetCarById} 
      />
    );

    await waitFor(() => {
      expect(mockGetCarById).toHaveBeenCalledWith('789');
    });

    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(mockGetCarById).toHaveBeenCalledTimes(2);
  });
});