import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarCarousel from './CarCarousel';
import { Car } from '../../types/car';

const mockCars: Car[] = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    fuelType: 'NAFTA',
    transmission: 'AUTOMATICA',
    color: 'Blue',
    publicationDate: '20-12-2025',
    description: 'Reliable sedan with great fuel economy',
    images: ['https://example.com/camry.jpg'],
  },
  {
    id: '2',
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    fuelType: 'HIBRIDO',
    transmission: 'MANUAL',
    color: 'Red',
    publicationDate: '20-12-2025',
    description: 'Sporty and efficient',
    images: ['https://example.com/civic.jpg'],
  },
  {
    id: '3',
    brand: 'Ford',
    model: 'Mustang',
    year: 2021,
    fuelType: 'NAFTA',
    transmission: 'MANUAL',
    publicationDate: '20-12-2025',
    color: 'Black',
    images: [],
  },
];

describe('CarCarousel', () => {
  it('should render nothing when cars array is empty', () => {
    const { container } = render(
      <CarCarousel cars={[]} onAddOffer={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render the first car as featured by default', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Year 2022')).toBeInTheDocument();
  });

  it('should display all car specifications', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Fuel:')).toBeInTheDocument();
    expect(screen.getByText('NAFTA')).toBeInTheDocument();
    expect(screen.getByText('Transmission:')).toBeInTheDocument();
    expect(screen.getByText('AUTOMATICA')).toBeInTheDocument();
    expect(screen.getByText('Color:')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('should display car description when available', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Reliable sedan with great fuel economy')).toBeInTheDocument();
  });

  it('should not display description when missing', () => {
    const carWithoutDescription: Car[] = [{
      id: '1',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      fuelType: 'ELECTRICO',
      transmission: 'AUTOMATICA',
      publicationDate: '20-12-2025',
      color: 'White',
      images: [],
    }];

    render(<CarCarousel cars={carWithoutDescription} onAddOffer={vi.fn()} />);
    
    expect(screen.queryByText(/Reliable sedan/)).not.toBeInTheDocument();
  });

  it('should render "Other Available Cars" section when multiple cars exist', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Other Available Cars')).toBeInTheDocument();
  });

  it('should not render "Other Available Cars" section with only one car', () => {
    render(<CarCarousel cars={[mockCars[0]]} onAddOffer={vi.fn()} />);
    
    expect(screen.queryByText('Other Available Cars')).not.toBeInTheDocument();
  });

  it('should display other cars in grid excluding featured car', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    expect(screen.getByText('Ford Mustang')).toBeInTheDocument();
  });

  it('should render car image when images array has items', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    const img = screen.getByAltText('Toyota Camry');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/camry.jpg');
  });

  it('should not render image when images array is empty', () => {
    const carWithoutImages: Car[] = [{
      ...mockCars[0],
      images: [],
    }];

    render(<CarCarousel cars={carWithoutImages} onAddOffer={vi.fn()} />);
    
    expect(screen.queryByAltText('Toyota Camry')).not.toBeInTheDocument();
  });

  it('should call onAddOffer with correct car ID when Add Offer button is clicked', () => {
    const mockOnAddOffer = vi.fn();
    render(<CarCarousel cars={mockCars} onAddOffer={mockOnAddOffer} />);
    
    const addOfferButton = screen.getByText('Add Offer');
    fireEvent.click(addOfferButton);
    
    expect(mockOnAddOffer).toHaveBeenCalledWith('1');
  });

  it('should change featured car when clicking on a car card', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Year 2022')).toBeInTheDocument();
    
    const civicCard = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
    fireEvent.click(civicCard!);
    
    expect(screen.getByText('Year 2023')).toBeInTheDocument();
    expect(screen.getByText('HIBRIDO')).toBeInTheDocument();
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
  });

  it('should update grid after changing featured car', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    const civicCard = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
    fireEvent.click(civicCard!);
    
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.queryByText('2023')).not.toBeInTheDocument();
  });

  it('should handle car with numeric ID', () => {
    const carWithNumericId: Car[] = [{
      id: 123,
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATICA',
      publicationDate: '2025-01-20',
      color: 'Gray',
      images: [],
    }];

    const mockOnAddOffer = vi.fn();
    render(<CarCarousel cars={carWithNumericId} onAddOffer={mockOnAddOffer} />);
    
    const addOfferButton = screen.getByText('Add Offer');
    fireEvent.click(addOfferButton);
    
    expect(mockOnAddOffer).toHaveBeenCalledWith(123);
  });

  it('should handle cars with undefined images property', () => {
    const carUndefinedImages: Car[] = [{
      id: '1',
      brand: 'Mazda',
      model: 'CX-5',
      year: 2023,
      fuelType: 'NAFTA',
      transmission: 'AUTOMATICA',
      publicationDate: '2025-02-15',
      color: 'Red',
      images: undefined as any,
    }];

    render(<CarCarousel cars={carUndefinedImages} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('Mazda CX-5')).toBeInTheDocument();
  });

  it('should handle multiple images and only display first one', () => {
    const multiImageCar: Car[] = [{
      id: '1',
      brand: 'Porsche',
      model: '911',
      year: 2023,
      fuelType: 'NAFTA',
      transmission: 'SEMI_AUTOMATICA',
      publicationDate: '2025-01-20',
      color: 'Yellow',
      images: [
        'https://example.com/911-front.jpg',
        'https://example.com/911-side.jpg',
        'https://example.com/911-back.jpg',
      ],
    }];

    render(<CarCarousel cars={multiImageCar} onAddOffer={vi.fn()} />);
    
    const img = screen.queryByAltText('Porsche 911') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/911-front.jpg');
  });

  it('should have proper alt text for images', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    const img = screen.queryByAltText('Toyota Camry');
    expect(img).toBeInTheDocument();
  });

  it('should render images for other cars in grid', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    const civicImg = screen.queryByAltText('Honda Civic');
    expect(civicImg).toBeInTheDocument();
    expect(civicImg).toHaveAttribute('src', 'https://example.com/civic.jpg');
  });

  it('should handle rapid clicks on different car cards', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    const civicCard = screen.getByText('Honda Civic').closest('div[class*="carCard"]');
    const mustangCard = screen.getByText('Ford Mustang').closest('div[class*="carCard"]');
    
    fireEvent.click(civicCard!);
    fireEvent.click(mustangCard!);
    fireEvent.click(civicCard!);
    
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('should display year for all cars in grid', () => {
    render(<CarCarousel cars={mockCars} onAddOffer={vi.fn()} />);
    
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
  });
});