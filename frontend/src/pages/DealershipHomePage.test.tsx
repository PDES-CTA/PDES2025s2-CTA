import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import DealershipHomePage from './DealershipHomePage';
import { ROUTES } from '../constants';

const renderWithRouter = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DealershipHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render main title', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText('Manage Your Dealership')).toBeInTheDocument();
    });

    it('should render main subtitle', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(
        screen.getByText(/Streamline your sales process with our comprehensive platform/i)
      ).toBeInTheDocument();
    });

    it('should render complete main description', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(
        screen.getByText(
          'Streamline your sales process with our comprehensive platform. List vehicles, track inventory, and connect with buyers across Argentina.'
        )
      ).toBeInTheDocument();
    });

    it('should render buyer redirect text', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(
        screen.getByText('Are you looking to buy a car? Visit our customer platform.')
      ).toBeInTheDocument();
    });
  });

  describe('Login Button', () => {
    it('should render login button', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByRole('button', { name: /log into a dealership/i })).toBeInTheDocument();
    });

    it('should have correct link to login page', () => {
      renderWithRouter(<DealershipHomePage />);

      const loginLink = screen.getByRole('link', { name: /log into a dealership/i });
      expect(loginLink).toHaveAttribute('href', ROUTES.LOGIN);
    });

    it('should render login icon', () => {
      renderWithRouter(<DealershipHomePage />);

      const loginButton = screen.getByRole('button', { name: /log into a dealership/i });
      const icon = loginButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Shop For Cars Button', () => {
    it('should render shop for cars button', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByRole('button', { name: /shop for cars/i })).toBeInTheDocument();
    });

    it('should have correct link to home page', () => {
      renderWithRouter(<DealershipHomePage />);

      const shopLink = screen.getByRole('link', { name: /shop for cars/i });
      expect(shopLink).toHaveAttribute('href', ROUTES.HOME);
    });

    it('should render users icon', () => {
      renderWithRouter(<DealershipHomePage />);

      const shopButton = screen.getByRole('button', { name: /shop for cars/i });
      const icon = shopButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    it('should render all three stats', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText('Real-time')).toBeInTheDocument();
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('should render all stat labels', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText('Inventory Updates')).toBeInTheDocument();
      expect(screen.getByText('Platform Access')).toBeInTheDocument();
      expect(screen.getByText('Buyer Network')).toBeInTheDocument();
    });

    it('should render real-time inventory stat with label', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText('Real-time')).toBeInTheDocument();
      expect(screen.getByText('Inventory Updates')).toBeInTheDocument();
    });

    it('should render 24/7 platform access stat with label', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('Platform Access')).toBeInTheDocument();
    });

    it('should render verified buyer network stat with label', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Buyer Network')).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should render main container', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const mainContainer = container.querySelector('[class*="container"]');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should render content section', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const contentSection = container.querySelector('[class*="content"]');
      expect(contentSection).toBeInTheDocument();
    });

    it('should render actions sections', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const actionsSections = container.querySelectorAll('[class*="actions"]');
      expect(actionsSections.length).toBeGreaterThanOrEqual(2);
    });

    it('should render stats section', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const statsSection = container.querySelector('[class*="stats"]');
      expect(statsSection).toBeInTheDocument();
    });

    it('should have three stat items', () => {
      renderWithRouter(<DealershipHomePage />);

      // Check for stat numbers
      expect(screen.getByText('Real-time')).toBeInTheDocument();
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have exactly two navigation links', () => {
      renderWithRouter(<DealershipHomePage />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
    });

    it('should render login link first', () => {
      renderWithRouter(<DealershipHomePage />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', ROUTES.LOGIN);
    });

    it('should render home link second', () => {
      renderWithRouter(<DealershipHomePage />);

      const links = screen.getAllByRole('link');
      expect(links[1]).toHaveAttribute('href', ROUTES.HOME);
    });
  });

  describe('Button Accessibility', () => {
    it('should have accessible login button text', () => {
      renderWithRouter(<DealershipHomePage />);

      const button = screen.getByRole('button', { name: /log into a dealership/i });
      expect(button).toHaveAccessibleName();
    });

    it('should have accessible shop button text', () => {
      renderWithRouter(<DealershipHomePage />);

      const button = screen.getByRole('button', { name: /shop for cars/i });
      expect(button).toHaveAccessibleName();
    });
  });

  describe('Content Hierarchy', () => {
    it('should render title as h1', () => {
      renderWithRouter(<DealershipHomePage />);

      const title = screen.getByRole('heading', { level: 1, name: /manage your dealership/i });
      expect(title).toBeInTheDocument();
    });

    it('should have only one h1 element', () => {
      renderWithRouter(<DealershipHomePage />);

      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
    });
  });

  describe('Text Content', () => {
    it('should mention Argentina in description', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText(/Argentina/i)).toBeInTheDocument();
    });

    it('should mention listing vehicles', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText(/List vehicles/i)).toBeInTheDocument();
    });

    it('should mention tracking inventory', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText(/track inventory/i)).toBeInTheDocument();
    });

    it('should mention connecting with buyers', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.getByText(/connect with buyers/i)).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render LogIn icon in login button', () => {
      renderWithRouter(<DealershipHomePage />);

      const loginButton = screen.getByRole('button', { name: /log into a dealership/i });
      const svg = loginButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('lucide', 'lucide-log-in');
    });

    it('should render Users icon in shop button', () => {
      renderWithRouter(<DealershipHomePage />);

      const shopButton = screen.getByRole('button', { name: /shop for cars/i });
      const svg = shopButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('lucide', 'lucide-users');
    });

    it('should have correct icon sizes', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const icons = container.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('width', '18');
        expect(icon).toHaveAttribute('height', '18');
      });
    });
  });

  describe('Static Content', () => {
    it('should not have any dynamic content', () => {
      renderWithRouter(<DealershipHomePage />);

      // All content should be static, no loading states or dynamic data
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('should not have any error messages', () => {
      renderWithRouter(<DealershipHomePage />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply container class', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain('container');
    });

    it('should apply title class to h1', () => {
      renderWithRouter(<DealershipHomePage />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('title');
    });

    it('should apply subtitle class to paragraphs', () => {
      const { container } = renderWithRouter(<DealershipHomePage />);

      const subtitles = container.querySelectorAll('[class*="subtitle"]');
      expect(subtitles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Button Styling Classes', () => {
    it('should apply secondary button class to login button', () => {
      renderWithRouter(<DealershipHomePage />);

      const button = screen.getByRole('button', { name: /log into a dealership/i });
      expect(button.className).toContain('secondaryButton');
    });

    it('should apply redirect button class to shop button', () => {
      renderWithRouter(<DealershipHomePage />);

      const button = screen.getByRole('button', { name: /shop for cars/i });
      expect(button.className).toContain('redirectButton');
    });
  });

  describe('Complete Page Snapshot', () => {
    it('should render complete page structure', () => {
      renderWithRouter(<DealershipHomePage />);

      // Title
      expect(screen.getByText('Manage Your Dealership')).toBeInTheDocument();
      
      // Main description
      expect(screen.getByText(/Streamline your sales process/i)).toBeInTheDocument();
      
      // Login button
      expect(screen.getByRole('button', { name: /log into a dealership/i })).toBeInTheDocument();
      
      // Buyer redirect text
      expect(screen.getByText(/Are you looking to buy a car/i)).toBeInTheDocument();
      
      // Shop button
      expect(screen.getByRole('button', { name: /shop for cars/i })).toBeInTheDocument();
      
      // All stats
      expect(screen.getByText('Real-time')).toBeInTheDocument();
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });
});