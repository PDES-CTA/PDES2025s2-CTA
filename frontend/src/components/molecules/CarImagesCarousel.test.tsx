import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarImagesCarousel } from './CarImagesCarousel';

describe('CarImagesCarousel', () => {
  const mockImages = [
    'https://example.com/car1.jpg',
    'https://example.com/car2.jpg',
    'https://example.com/car3.jpg',
  ];
  const altText = 'Toyota Corolla';

  describe('Rendering with no images', () => {
    it('should render placeholder when images array is empty', () => {
      render(<CarImagesCarousel images={[]} altText={altText} />);
      
      expect(screen.getByText('No images available')).toBeInTheDocument();
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render placeholder when images is undefined', () => {
      render(<CarImagesCarousel images={undefined!} altText={altText} />);
      
      expect(screen.getByText('No images available')).toBeInTheDocument();
    });

    it('should render placeholder when images is null', () => {
      render(<CarImagesCarousel images={null!} altText={altText} />);
      
      expect(screen.getByText('No images available')).toBeInTheDocument();
    });

    it('should not render navigation arrows when no images', () => {
      render(<CarImagesCarousel images={[]} altText={altText} />);
      
      expect(screen.queryByLabelText('Show previous image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Show next label')).not.toBeInTheDocument();
    });

    it('should not render dots when no images', () => {
      const { container } = render(<CarImagesCarousel images={[]} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots).toHaveLength(0);
    });
  });

  describe('Rendering with single image', () => {
    const singleImage = ['https://example.com/car1.jpg'];

    it('should render the image', () => {
      render(<CarImagesCarousel images={singleImage} altText={altText} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', singleImage[0]);
      expect(img).toHaveAttribute('alt', `${altText} (1/1)`);
    });

    it('should not render navigation arrows with single image', () => {
      render(<CarImagesCarousel images={singleImage} altText={altText} />);
      
      expect(screen.queryByLabelText('Show previous image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Show next label')).not.toBeInTheDocument();
    });

    it('should not render dots with single image', () => {
      const { container } = render(<CarImagesCarousel images={singleImage} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots).toHaveLength(0);
    });
  });

  describe('Rendering with multiple images', () => {
    it('should render the first image by default', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[0]);
      expect(img).toHaveAttribute('alt', `${altText} (1/3)`);
    });

    it('should render both navigation arrows', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      expect(screen.getByLabelText('Show previous image')).toBeInTheDocument();
      expect(screen.getByLabelText('Show next label')).toBeInTheDocument();
    });

    it('should render correct number of dots', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots).toHaveLength(mockImages.length);
    });

    it('should have first dot active by default', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots[0].className).toContain('activeDot');
      expect(dots[1].className).not.toContain('activeDot');
      expect(dots[2].className).not.toContain('activeDot');
    });

    it('should render navigation buttons with correct type', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const prevButton = screen.getByLabelText('Show previous image');
      const nextButton = screen.getByLabelText('Show next label');
      
      expect(prevButton).toHaveAttribute('type', 'button');
      expect(nextButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Navigation - Next button', () => {
    it('should show next image when clicking next button', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[1]);
      expect(img).toHaveAttribute('alt', `${altText} (2/3)`);
    });

    it('should wrap to first image when clicking next on last image', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      
      // Click next twice to get to last image
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      let img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[2]);
      
      // Click next again to wrap to first
      fireEvent.click(nextButton);
      
      img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[0]);
      expect(img).toHaveAttribute('alt', `${altText} (1/3)`);
    });

    it('should update active dot when navigating forward', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots[0].className).not.toContain('activeDot');
      expect(dots[1].className).toContain('activeDot');
      expect(dots[2].className).not.toContain('activeDot');
    });
  });

  describe('Navigation - Previous button', () => {
    it('should show previous image when clicking previous button', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      // Go to second image first
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      
      // Then go back
      const prevButton = screen.getByLabelText('Show previous image');
      fireEvent.click(prevButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[0]);
      expect(img).toHaveAttribute('alt', `${altText} (1/3)`);
    });

    it('should wrap to last image when clicking previous on first image', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const prevButton = screen.getByLabelText('Show previous image');
      fireEvent.click(prevButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[2]);
      expect(img).toHaveAttribute('alt', `${altText} (3/3)`);
    });

    it('should update active dot when navigating backward', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const prevButton = screen.getByLabelText('Show previous image');
      fireEvent.click(prevButton);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots[0].className).not.toContain('activeDot');
      expect(dots[1].className).not.toContain('activeDot');
      expect(dots[2].className).toContain('activeDot');
    });
  });

  describe('Navigation - Dot buttons', () => {
    it('should navigate to specific image when clicking a dot', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      fireEvent.click(dots[2]);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[2]);
      expect(img).toHaveAttribute('alt', `${altText} (3/3)`);
    });

    it('should update active dot when clicking a dot', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      fireEvent.click(dots[1]);
      
      expect(dots[0].className).not.toContain('activeDot');
      expect(dots[1].className).toContain('activeDot');
      expect(dots[2].className).not.toContain('activeDot');
    });

    it('should have correct aria-labels for dots', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      expect(screen.getByLabelText('Show image 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Show image 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Show image 3')).toBeInTheDocument();
    });

    it('should navigate to first image from last using dot', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      
      // Go to last image
      fireEvent.click(dots[2]);
      
      // Go back to first
      fireEvent.click(dots[0]);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[0]);
      expect(dots[0].className).toContain('activeDot');
    });

    it('should have type button for all dots', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      dots.forEach(dot => {
        expect(dot).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Combined navigation scenarios', () => {
    it('should maintain state through multiple navigation actions', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      const prevButton = screen.getByLabelText('Show previous image');
      
      // Forward, forward, back, forward
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);
      fireEvent.click(nextButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[2]);
    });

    it('should work correctly when mixing arrows and dots', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      
      // Use next arrow
      fireEvent.click(nextButton);
      
      // Use dot
      fireEvent.click(dots[2]);
      
      // Use next arrow (should wrap to first)
      fireEvent.click(nextButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[0]);
      expect(dots[0].className).toContain('activeDot');
    });

    it('should handle rapid clicks on next button', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      
      // Click multiple times rapidly
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      // Should be at second image (wrapped once)
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[1]);
    });

    it('should handle rapid clicks on previous button', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const prevButton = screen.getByLabelText('Show previous image');
      
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[2]);
    });
  });

  describe('Alt text formatting', () => {
    it('should include current index and total in alt text', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', `${altText} (1/3)`);
    });

    it('should update alt text when navigating', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', `${altText} (2/3)`);
    });

    it('should handle alt text with special characters', () => {
      const specialAltText = 'Car & Model "2024"';
      render(<CarImagesCarousel images={mockImages} altText={specialAltText} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', `${specialAltText} (1/3)`);
    });

    it('should handle empty alt text', () => {
      render(<CarImagesCarousel images={mockImages} altText="" />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', ' (1/3)');
    });
  });

  describe('Edge cases', () => {
    it('should handle two images correctly', () => {
      const twoImages = [mockImages[0], mockImages[1]];
      const { container } = render(<CarImagesCarousel images={twoImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots).toHaveLength(2);
      
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', twoImages[1]);
      
      // Wrap to first
      fireEvent.click(nextButton);
      expect(img).toHaveAttribute('src', twoImages[0]);
    });

    it('should handle very long image URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(200) + '.jpg';
      const imagesWithLongUrl = [longUrl];
      
      render(<CarImagesCarousel images={imagesWithLongUrl} altText={altText} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', longUrl);
    });

    it('should handle many images', () => {
      const manyImages = Array.from({ length: 10 }, (_, i) => `https://example.com/car${i}.jpg`);
      const { container } = render(<CarImagesCarousel images={manyImages} altText={altText} />);
      
      const dots = container.querySelectorAll('[aria-label^="Show image"]');
      expect(dots).toHaveLength(10);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', `${altText} (1/10)`);
    });

    it('should maintain state when re-rendered with same images', () => {
      const { rerender } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      
      // Re-render with same props
      rerender(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImages[1]);
    });

    it('should reset to first image when images prop changes', () => {
      const { rerender } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const nextButton = screen.getByLabelText('Show next label');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      const newImages = ['https://example.com/new1.jpg', 'https://example.com/new2.jpg'];
      rerender(<CarImagesCarousel images={newImages} altText={altText} />);
      
      screen.getByRole('img');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      expect(screen.getByLabelText('Show previous image')).toBeInTheDocument();
      expect(screen.getByLabelText('Show next label')).toBeInTheDocument();
    });

    it('should have accessible dot labels with image numbers', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      mockImages.forEach((_, index) => {
        expect(screen.getByLabelText(`Show image ${index + 1}`)).toBeInTheDocument();
      });
    });

    it('should have img role for image element', () => {
      render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should have button type for all interactive elements', () => {
      const { container } = render(<CarImagesCarousel images={mockImages} altText={altText} />);
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});