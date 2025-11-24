import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarCarousel from './CarCarousel';
import { Car } from '../../types/car';

const mockCar1: Car = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  fuelType: 'NAFTA',
  transmission: 'MANUAL',
  color: 'White',
  description: 'Great car in excellent condition',
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
  description: 'Sporty and reliable',
  publicationDate: '2024-01-16',
  images: ['https://example.com/car2.jpg', 'https://example.com/car2-2.jpg'],
};

const mockCar3: Car = {
  id: 3,
  brand: 'Ford',
  model: 'Focus',
  year: 2019,
  fuelType: 'NAFTA',
  transmission: 'MANUAL',
  color: 'Blue',
  description: 'Compact and efficient',
  publicationDate: '2024-01-17',
  images: [],
};

const mockCarWithoutImages: Car = {
  id: 4,
  brand: 'Chevrolet',
  model: 'Cruze',
  year: 2022,
  fuelType: 'NAFTA',
  transmission: 'AUTOMATICA',
  color: 'Red',
  publicationDate: '2024-01-18',
  images: undefined,
};

const mockCarWithoutDescription: Car = {
  id: 5,
  brand: 'Mazda',
  model: 'CX-5',
  year: 2023,
  fuelType: 'NAFTA',
  transmission: 'AUTOMATICA',
  color: 'Silver',
  publicationDate: '2024-01-19',
  images: ['https://example.com/car5.jpg'],
};

describe('CarCarousel', () => {
  const mockOnAddOffer = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with empty cars array', () => {
    it('should return null when cars array is empty', () => {
      const { container } = render(
        <CarCarousel 
          cars={[]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render any content when cars is empty', () => {
      render(
        <CarCarousel 
          cars={[]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.queryByText(/View Details/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Add to Offer/i)).not.toBeInTheDocument();
    });
  });

  describe('Rendering with single car', () => {
    it('should render featured car details', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Year 2020')).toBeInTheDocument();
    });

    it('should render car specifications', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Fuel:')).toBeInTheDocument();
      expect(screen.getByText('NAFTA')).toBeInTheDocument();
      expect(screen.getByText('Transmission:')).toBeInTheDocument();
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
      expect(screen.getByText('Color:')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('should render car description when available', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Great car in excellent condition')).toBeInTheDocument();
    });

    it('should not render description when not available', () => {
      render(
        <CarCarousel 
          cars={[mockCarWithoutDescription]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add to Offer/i })).toBeInTheDocument();
    });

    it('should not render "Other Available Cars" section with single car', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.queryByText('Other Available Cars')).not.toBeInTheDocument();
    });

    it('should render car image when available', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      const carImage = images.find(img => img.getAttribute('src') === mockCar1.images![0]);
      expect(carImage).toBeDefined();
      expect(carImage).toHaveAttribute('alt', 'Toyota Corolla');
    });

    it('should render placeholder when no images', () => {
      const { container } = render(
        <CarCarousel 
          cars={[mockCarWithoutImages]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const placeholders = container.querySelectorAll('svg');
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  describe('Rendering with multiple cars', () => {
    it('should render first car as featured by default', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Year 2020')).toBeInTheDocument();
    });

    it('should render "Other Available Cars" section', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Other Available Cars')).toBeInTheDocument();
    });

    it('should render other cars in grid', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Should show car2 and car3, but not car1 (featured)
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('Ford Focus')).toBeInTheDocument();
    });

    it('should show correct number of other cars', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // car2 and car3 should be in other cars section
      const otherCarsSection = screen.getByText('Other Available Cars').parentElement;
      expect(otherCarsSection).toBeInTheDocument();
      
      // Verify 2 car cards exist (excluding featured)
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('Ford Focus')).toBeInTheDocument();
    });

    it('should display year for other cars', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('2021')).toBeInTheDocument();
      expect(screen.getByText('2019')).toBeInTheDocument();
    });

    it('should render two cars correctly', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Other Available Cars')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });
  });

  describe('Featured car switching', () => {
    it('should switch featured car when clicking on other car', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Initially showing car1
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      
      // Click on car2 card
      const car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      fireEvent.click(car2Card!);
      
      // Now car2 should be featured
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('Year 2021')).toBeInTheDocument();
      expect(screen.getByText('Sporty and reliable')).toBeInTheDocument();
    });

    it('should update other cars section after switching', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Click on car2
      const car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      fireEvent.click(car2Card!);
      
      // Now car1 and car3 should be in other cars
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('Ford Focus')).toBeInTheDocument();
    });

    it('should switch featured car multiple times', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Click car2
      let car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      fireEvent.click(car2Card!);
      expect(screen.getByText('Year 2021')).toBeInTheDocument();
      
      // Click car3
      const car3Card = screen.getByText('Ford Focus').closest('div[class*="carCard"]');
      fireEvent.click(car3Card!);
      expect(screen.getByText('Year 2019')).toBeInTheDocument();
      
      // Click car1
      const car1Card = screen.getByText('Toyota Corolla').closest('div[class*="carCard"]');
      fireEvent.click(car1Card!);
      expect(screen.getByText('Year 2020')).toBeInTheDocument();
    });

    it('should display correct specifications after switching', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Initially car1
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
      
      // Switch to car2
      const car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      fireEvent.click(car2Card!);
      
      expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
      expect(screen.getByText('DIESEL')).toBeInTheDocument();
      expect(screen.getByText('Black')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call onViewDetails with correct car id when View Details clicked', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
      fireEvent.click(viewDetailsButton);
      
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockCar1.id);
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should call onAddOffer with correct car id when Add to Offer clicked', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const addOfferButton = screen.getByRole('button', { name: /Add to Offer/i });
      fireEvent.click(addOfferButton);
      
      expect(mockOnAddOffer).toHaveBeenCalledWith(mockCar1.id);
      expect(mockOnAddOffer).toHaveBeenCalledTimes(1);
    });

    it('should call handlers with featured car id after switching', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Switch to car2
      const car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      fireEvent.click(car2Card!);
      
      // Click buttons
      const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
      fireEvent.click(viewDetailsButton);
      
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockCar2.id);
    });

    it('should call both handlers independently', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /View Details/i }));
      fireEvent.click(screen.getByRole('button', { name: /Add to Offer/i }));
      
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnAddOffer).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on same button', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const addButton = screen.getByRole('button', { name: /Add to Offer/i });
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      
      expect(mockOnAddOffer).toHaveBeenCalledTimes(3);
    });
  });

  describe('Image handling', () => {
    it('should display first image for featured car', () => {
      render(
        <CarCarousel 
          cars={[mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      const carImage = images.find(img => img.getAttribute('src') === mockCar2.images![0]);
      expect(carImage).toBeDefined();
    });

    it('should only display first image even when multiple images exist', () => {
      render(
        <CarCarousel 
          cars={[mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      const hasSecondImage = images.some(img => img.getAttribute('src') === mockCar2.images![1]);
      expect(hasSecondImage).toBe(false);
    });

    it('should show placeholder when images array is empty', () => {
      const { container } = render(
        <CarCarousel 
          cars={[mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const placeholders = container.querySelectorAll('svg');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should show placeholder when images is undefined', () => {
      const { container } = render(
        <CarCarousel 
          cars={[mockCarWithoutImages]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const placeholders = container.querySelectorAll('svg');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should handle image error by showing placeholder', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      const carImage = images.find(img => img.getAttribute('src') === mockCar1.images![0]) as HTMLImageElement;
      
      fireEvent.error(carImage);
      
      expect(carImage.style.display).toBe('none');
    });

    it('should display images for other cars when available', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      const car2Image = images.find(img => img.getAttribute('src') === mockCar2.images![0]);
      expect(car2Image).toBeDefined();
    });

    it('should show placeholder for other cars without images', () => {
      const { container } = render(
        <CarCarousel 
          cars={[mockCar1, mockCar3]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const placeholders = container.querySelectorAll('svg');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should have correct alt text for images', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      expect(images.some(img => img.getAttribute('alt') === 'Toyota Corolla')).toBe(true);
      expect(images.some(img => img.getAttribute('alt') === 'Honda Civic')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle cars with very long names', () => {
      const longNameCar: Car = {
        ...mockCar1,
        brand: 'Very Long Brand Name That Should Still Display',
        model: 'Very Long Model Name That Should Also Display',
      };
      
      render(
        <CarCarousel 
          cars={[longNameCar]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText(/Very Long Brand Name/)).toBeInTheDocument();
      expect(screen.getByText(/Very Long Model Name/)).toBeInTheDocument();
    });

    it('should handle cars with very long descriptions', () => {
      const longDescCar: Car = {
        ...mockCar1,
        description: 'A'.repeat(500),
      };
      
      render(
        <CarCarousel 
          cars={[longDescCar]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('should handle many cars', () => {
      const manyCars = Array.from({ length: 20 }, (_, i) => ({
        ...mockCar1,
        id: i + 1,
        model: `Model ${i + 1}`,
      }));
      
      render(
        <CarCarousel 
          cars={manyCars} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Other Available Cars')).toBeInTheDocument();
      
      expect(screen.getByText('Toyota Model 1')).toBeInTheDocument();
    });

    it('should handle switching to last car in large list', () => {
      const manyCars = Array.from({ length: 10 }, (_, i) => ({
        ...mockCar1,
        id: i + 1,
        brand: `Brand${i + 1}`,
        model: `Model${i + 1}`,
      }));
      
      render(
        <CarCarousel 
          cars={manyCars} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const lastCarCard = screen.getByText('Brand10 Model10').closest('div[class*="carCard"]');
      fireEvent.click(lastCarCard!);
      
      expect(screen.getByText('Year 2020')).toBeInTheDocument();
    });

    it('should handle car with all undefined optional fields', () => {
      const minimalCar: Car = {
        id: 99,
        brand: 'Brand',
        model: 'Model',
        year: 2020,
        fuelType: 'NAFTA',
        transmission: 'MANUAL',
        color: 'White',
        publicationDate: '2024-01-01',
      };
      
      render(
        <CarCarousel 
          cars={[minimalCar]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText('Brand Model')).toBeInTheDocument();
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should handle numeric car id', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /Add to Offer/i }));
      
      expect(mockOnAddOffer).toHaveBeenCalledWith(1);
    });

    it('should maintain state after re-render with same cars', () => {
      const { rerender } = render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Switch to car2
      const car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      fireEvent.click(car2Card!);
      
      // Re-render
      rerender(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      // Should still show car2 as featured
      expect(screen.getByText('Year 2021')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add to Offer/i })).toBeInTheDocument();
    });

    it('should have descriptive image alt text', () => {
      render(
        <CarCarousel 
          cars={[mockCar1]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const images = screen.getAllByRole('img');
      const carImage = images.find(img => img.getAttribute('alt')?.includes('Toyota Corolla'));
      expect(carImage).toBeDefined();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByRole('heading', { level: 2, name: /Toyota Corolla/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Other Available Cars/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: /Honda Civic/i })).toBeInTheDocument();
    });

    it('should have clickable car cards for keyboard navigation', () => {
      render(
        <CarCarousel 
          cars={[mockCar1, mockCar2]} 
          onAddOffer={mockOnAddOffer} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      const car2Card = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
      expect(car2Card).toBeInTheDocument();
    });
  });
});