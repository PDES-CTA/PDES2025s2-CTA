import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthForm from './AuthForm';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AuthForm', () => {
  const mockOnSubmit = vi.fn((e) => e.preventDefault());

  const defaultProps = {
    title: 'Test Form',
    icon: LogIn,
    error: '',
    loading: false,
    onSubmit: mockOnSubmit,
    submitButtonText: 'Submit',
    loadingText: 'Submitting...',
    footerText: 'Footer text',
    footerLinkText: 'Link text',
    footerLinkTo: '/test',
    children: <input name="test" />,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    renderWithRouter(<AuthForm {...defaultProps} />);
    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  it('should render children', () => {
    renderWithRouter(<AuthForm {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderWithRouter(<AuthForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should render footer with link', () => {
    renderWithRouter(<AuthForm {...defaultProps} />);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
    expect(screen.getByText('Link text')).toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    renderWithRouter(<AuthForm {...defaultProps} error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should not display error message when error is empty', () => {
    renderWithRouter(<AuthForm {...defaultProps} error="" />);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderWithRouter(<AuthForm {...defaultProps} loading={true} />);
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('should disable button when loading', () => {
    renderWithRouter(<AuthForm {...defaultProps} loading={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call onSubmit when form is submitted', () => {
    renderWithRouter(<AuthForm {...defaultProps} />);
    const form = screen.getByRole('button').closest('form');
    
    if (form) {
      fireEvent.submit(form);
      expect(mockOnSubmit).toHaveBeenCalled();
    }
  });

  it('should render icon', () => {
    const { container } = renderWithRouter(<AuthForm {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});