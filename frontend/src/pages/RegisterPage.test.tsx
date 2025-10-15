import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import RegisterPage from './RegisterPage';
import * as authService from '../services/api';

vi.mock('../services/api', () => ({
  authService: {
    register: vi.fn(),
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

  it('should render registration form', () => {
    renderWithRouter(<RegisterPage />);
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('ID Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('should render login link', () => {
    renderWithRouter(<RegisterPage />);
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    vi.mocked(authService.authService.register).mockResolvedValue({
      id: 1,
      email: 'john@test.com',
      name: 'John Doe',
      role: 'BUYER',
    });

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('ID Number'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.authService.register).toHaveBeenCalledWith({
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

  it('should show error when passwords do not match', async () => {
    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('ID Number'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(authService.authService.register).not.toHaveBeenCalled();
  });

  it('should show error message on registration failure', async () => {
    vi.mocked(authService.authService.register).mockRejectedValue(
      new Error('Email already exists')
    );

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('ID Number'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    vi.mocked(authService.authService.register).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('ID Number'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1123456789' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    renderWithRouter(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(authService.authService.register).not.toHaveBeenCalled();
  });

  it('should validate DNI format', () => {
    renderWithRouter(<RegisterPage />);

    const dniInput = screen.getByLabelText('ID Number');
    expect(dniInput).toHaveAttribute('pattern', '\\d{7,8}');
  });

  it('should validate minimum password length', () => {
    renderWithRouter(<RegisterPage />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    expect(passwordInput).toHaveAttribute('minlength', '8');
    expect(confirmPasswordInput).toHaveAttribute('minlength', '8');
  });

  it('should navigate to login page when clicking login link', () => {
    renderWithRouter(<RegisterPage />);

    const loginLink = screen.getByText('Log in');
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});