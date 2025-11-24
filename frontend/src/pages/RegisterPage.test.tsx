import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import RegisterPage from './RegisterPage';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  buyerService: {
    createBuyer: vi.fn(),
  },
  dealershipService: {
    createDealership: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render registration form', () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('DNI')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('should render user type toggle buttons', () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByRole('button', { name: /buyer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dealership/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
      expect(screen.getByText('Log in')).toBeInTheDocument();
    });

    it('should have buyer mode selected by default', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByLabelText('DNI')).toBeInTheDocument();

      expect(screen.queryByLabelText('Business Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('CUIT')).not.toBeInTheDocument();
    });

    it('should render Sign Up button', () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('User Type Toggle', () => {
    it('should switch to dealership mode when clicking dealership button', () => {
      renderWithRouter(<RegisterPage />);
      
      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      expect(screen.getByLabelText('Business Name')).toBeInTheDocument();
      expect(screen.getByLabelText('CUIT')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
      expect(screen.getByLabelText('Province')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should not show buyer-specific fields in dealership mode', () => {
      renderWithRouter(<RegisterPage />);
      
      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      expect(screen.queryByLabelText('DNI')).not.toBeInTheDocument();
    });

    it('should switch back to buyer mode from dealership mode', () => {
      renderWithRouter(<RegisterPage />);
      
      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);
      
      const buyerButton = screen.getByRole('button', { name: /buyer/i });
      fireEvent.click(buyerButton);

      expect(screen.getByLabelText('DNI')).toBeInTheDocument();
      expect(screen.queryByLabelText('Business Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('CUIT')).not.toBeInTheDocument();
    });

    it('should update dealership button style when selected', () => {
      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      expect(screen.getByLabelText('Business Name')).toBeInTheDocument();
      expect(screen.getByLabelText('CUIT')).toBeInTheDocument();

      expect(screen.queryByLabelText('DNI')).not.toBeInTheDocument();
    });
  });

  describe('Buyer Registration Flow', () => {
    it('should submit form with valid data', async () => {
      vi.mocked(api.buyerService.createBuyer).mockResolvedValue({
        id: 1,
        email: 'john@test.com',
        name: 'John Doe',
        role: 'BUYER',
      });

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.buyerService.createBuyer).toHaveBeenCalledWith({
          email: 'john@test.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1123456789',
          address: 'Test Street 123',
          dni: '12345678',
          role: 'BUYER',
        });
      });
    });

    it('should navigate to login after successful buyer registration', async () => {
      vi.mocked(api.buyerService.createBuyer).mockResolvedValue({
        id: 1,
        email: 'john@test.com',
        name: 'John Doe',
        role: 'BUYER',
      });

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should strip formatting from DNI before submission', async () => {
      vi.mocked(api.buyerService.createBuyer).mockResolvedValue({
        id: 1,
        email: 'john@test.com',
        name: 'John Doe',
        role: 'BUYER',
      });

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12.345.678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.buyerService.createBuyer).toHaveBeenCalledWith(
          expect.objectContaining({
            dni: '12345678',
          })
        );
      });
    });
  });

  describe('Dealership Registration Flow', () => {
    it('should submit dealership form with all fields', async () => {
      vi.mocked(api.dealershipService.createDealership).mockResolvedValue([{
        id: 1,
        email: 'dealer@test.com',
        name: 'Test Dealership',
        role: 'DEALERSHIP',
      }]);

      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dealer@test.com' } });
      fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Test Dealership' } });
      fireEvent.change(screen.getByLabelText('CUIT'), { target: { value: '20-12345678-9' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Business St 456' } });
      fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Buenos Aires' } });
      fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'Buenos Aires' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Premium dealership' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.dealershipService.createDealership).toHaveBeenCalledWith({
          email: 'dealer@test.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1123456789',
          address: 'Business St 456',
          businessName: 'Test Dealership',
          cuit: '20123456789',
          city: 'Buenos Aires',
          province: 'Buenos Aires',
          description: 'Premium dealership',
          role: 'DEALERSHIP',
        });
      });
    });

    it('should submit dealership form without optional fields', async () => {
      vi.mocked(api.dealershipService.createDealership).mockResolvedValue([{
        id: 1,
        email: 'dealer@test.com',
        name: 'Test Dealership',
        role: 'DEALERSHIP',
      }]);

      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dealer@test.com' } });
      fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Test Dealership' } });
      fireEvent.change(screen.getByLabelText('CUIT'), { target: { value: '20-12345678-9' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Business St 456' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.dealershipService.createDealership).toHaveBeenCalledWith(
          expect.objectContaining({
            city: undefined,
            province: undefined,
            description: undefined,
          })
        );
      });
    });

    it('should strip formatting from CUIT before submission', async () => {
      vi.mocked(api.dealershipService.createDealership).mockResolvedValue([{
        id: 1,
        email: 'dealer@test.com',
        name: 'Test Dealership',
        role: 'DEALERSHIP',
      }]);

      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dealer@test.com' } });
      fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Test Dealership' } });
      fireEvent.change(screen.getByLabelText('CUIT'), { target: { value: '20-12345678-9' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Business St 456' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.dealershipService.createDealership).toHaveBeenCalledWith(
          expect.objectContaining({
            cuit: '20123456789',
          })
        );
      });
    });
  });

  describe('Password Validation', () => {
    it('should show error when passwords do not match', async () => {
      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(api.buyerService.createBuyer).not.toHaveBeenCalled();
    });

    it('should validate minimum password length', () => {
      renderWithRouter(<RegisterPage />);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      
      expect(passwordInput).toHaveAttribute('minlength', '8');
      expect(confirmPasswordInput).toHaveAttribute('minlength', '8');
    });

    it('should have password fields with correct type', () => {
      renderWithRouter(<RegisterPage />);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('DNI Formatting', () => {
    it('should format DNI with dots', () => {
      renderWithRouter(<RegisterPage />);

      const dniInput = screen.getByLabelText('DNI') as HTMLInputElement;
      
      fireEvent.change(dniInput, { target: { value: '12345678' } });
      
      expect(dniInput.value).toBe('12.345.678');
    });

    it('should handle partial DNI input', () => {
      renderWithRouter(<RegisterPage />);

      const dniInput = screen.getByLabelText('DNI') as HTMLInputElement;
      
      fireEvent.change(dniInput, { target: { value: '123' } });
      
      expect(dniInput.value).toBe('12.3');
    });

    it('should remove non-numeric characters from DNI', () => {
      renderWithRouter(<RegisterPage />);

      const dniInput = screen.getByLabelText('DNI') as HTMLInputElement;
      
      fireEvent.change(dniInput, { target: { value: 'abc123def456' } });
      
      expect(dniInput.value).toBe('12.345.6');
    });
  });

  describe('CUIT Formatting', () => {
    it('should format CUIT with dashes', () => {
      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      const cuitInput = screen.getByLabelText('CUIT') as HTMLInputElement;
      
      fireEvent.change(cuitInput, { target: { value: '20123456789' } });
      
      expect(cuitInput.value).toBe('20-12345678-9');
    });

    it('should handle partial CUIT input', () => {
      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      const cuitInput = screen.getByLabelText('CUIT') as HTMLInputElement;
      
      fireEvent.change(cuitInput, { target: { value: '201234' } });
      
      expect(cuitInput.value).toBe('20-1234');
    });

    it('should remove non-numeric characters from CUIT', () => {
      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      const cuitInput = screen.getByLabelText('CUIT') as HTMLInputElement;
      
      fireEvent.change(cuitInput, { target: { value: 'abc20def123xyz456789' } });
      
      expect(cuitInput.value).toBe('20-12345678-9');
    });
  });

  describe('Error Handling', () => {
    it('should show error message on registration failure', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'duplicate key: this email is already registered'
          }
        }
      };

      vi.mocked(api.buyerService.createBuyer).mockRejectedValue(errorResponse);

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This email is already registered. Please use a different email or try logging in.')).toBeInTheDocument();
      });
    });

    it('should show specific error for duplicate DNI', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'duplicate key: this dni is already registered'
          }
        }
      };

      vi.mocked(api.buyerService.createBuyer).mockRejectedValue(errorResponse);

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This DNI is already registered.')).toBeInTheDocument();
      });
    });

    it('should show specific error for duplicate CUIT', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'duplicate key: this cuit is already registered'
          }
        }
      };

      vi.mocked(api.dealershipService.createDealership).mockRejectedValue(errorResponse);

      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dealer@test.com' } });
      fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Test Dealership' } });
      fireEvent.change(screen.getByLabelText('CUIT'), { target: { value: '20-12345678-9' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Business St 456' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This CUIT is already registered.')).toBeInTheDocument();
      });
    });

    it('should show generic error message for other errors', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Some server error'
          }
        }
      };

      vi.mocked(api.buyerService.createBuyer).mockRejectedValue(errorResponse);

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Some server error')).toBeInTheDocument();
      });
    });

    it('should show fallback error when no message provided', async () => {
      vi.mocked(api.buyerService.createBuyer).mockRejectedValue(new Error());

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred during registration. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during submission', async () => {
      vi.mocked(api.buyerService.createBuyer).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
      fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });

    it('should show loading state for dealership submission', async () => {
      vi.mocked(api.dealershipService.createDealership).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dealer@test.com' } });
      fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Test Dealership' } });
      fireEvent.change(screen.getByLabelText('CUIT'), { target: { value: '20-12345678-9' } });
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
      fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Business St 456' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', async () => {
      renderWithRouter(<RegisterPage />);

      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.click(submitButton);

      expect(api.buyerService.createBuyer).not.toHaveBeenCalled();
    });

    it('should validate DNI format', () => {
      renderWithRouter(<RegisterPage />);

      const dniInput = screen.getByLabelText('DNI');
      
      expect(dniInput).toHaveAttribute('maxLength', '10');
      expect(dniInput).toHaveAttribute('type', 'text');
      expect(dniInput).toBeRequired();
    });

    it('should validate CUIT format in dealership mode', () => {
      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      const cuitInput = screen.getByLabelText('CUIT');
      
      expect(cuitInput).toHaveAttribute('pattern', '\\d{2}-\\d{8}-\\d{1}');
      expect(cuitInput).toHaveAttribute('minLength', '13');
      expect(cuitInput).toHaveAttribute('maxLength', '13');
      expect(cuitInput).toBeRequired();
    });

    it('should validate email field type', () => {
      renderWithRouter(<RegisterPage />);

      const emailInput = screen.getByLabelText('Email');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toBeRequired();
    });

    it('should have correct placeholders in buyer mode', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'buyer-user@gmail.com');
      expect(screen.getByLabelText('DNI')).toHaveAttribute('placeholder', '12.345.678');
      expect(screen.getByLabelText('Phone')).toHaveAttribute('placeholder', '1112341234');
      expect(screen.getByLabelText('Address')).toHaveAttribute('placeholder', '24 Main Street, BA');
    });

    it('should have correct placeholders in dealership mode', () => {
      renderWithRouter(<RegisterPage />);

      const dealershipButton = screen.getByRole('button', { name: /dealership/i });
      fireEvent.click(dealershipButton);

      expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'my-dealership@gmail.com');
      expect(screen.getByLabelText('Business Name')).toHaveAttribute('placeholder', 'CTA Cars');
      expect(screen.getByLabelText('CUIT')).toHaveAttribute('placeholder', '12-12345678-1');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when clicking login link', () => {
      renderWithRouter(<RegisterPage />);

      const loginLink = screen.getByText('Log in');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});