import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { User } from 'lucide-react';
import SmallButton from './SmallButton';

describe('SmallButton', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<SmallButton>Click me</SmallButton>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with default primary variant', () => {
      const { container } = render(<SmallButton>Button</SmallButton>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('primary');
    });

    it('should render with secondary variant', () => {
      const { container } = render(<SmallButton variant="secondary">Button</SmallButton>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('secondary');
    });

    it('should render with ghost variant', () => {
      const { container } = render(<SmallButton variant="ghost">Button</SmallButton>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('ghost');
    });

    it('should render with danger variant', () => {
      const { container } = render(<SmallButton variant="danger">Button</SmallButton>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('danger');
    });

    it('should render with an icon', () => {
      render(
        <SmallButton icon={<User data-testid="user-icon" />}>
          Profile
        </SmallButton>
      );
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render icon before children', () => {
      const { container } = render(
        <SmallButton icon={<span data-testid="icon">Icon</span>}>
          Text
        </SmallButton>
      );
      const button = container.querySelector('button');
      const children = Array.from(button?.childNodes || []);
      
      expect(children[0]).toHaveAttribute('data-testid', 'icon');
      expect(children[1]?.textContent).toBe('Text');
    });

    it('should render with custom className', () => {
      const { container } = render(
        <SmallButton className="custom-class">Button</SmallButton>
      );
      const button = container.querySelector('button');
      expect(button?.className).toContain('custom-class');
      expect(button?.className).toContain('smallButton');
    });

    it('should apply multiple classes correctly', () => {
      const { container } = render(
        <SmallButton variant="danger" className="custom-class">
          Button
        </SmallButton>
      );
      const button = container.querySelector('button');
      expect(button?.className).toContain('smallButton');
      expect(button?.className).toContain('danger');
      expect(button?.className).toContain('custom-class');
    });
  });

  describe('Disabled state', () => {
    it('should render as disabled when disabled prop is true', () => {
      render(<SmallButton disabled>Button</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply disabled class when disabled', () => {
      const { container } = render(<SmallButton disabled>Button</SmallButton>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('disabled');
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<SmallButton disabled onClick={handleClick}>Button</SmallButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be enabled by default', () => {
      render(<SmallButton>Button</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Click handling', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<SmallButton onClick={handleClick}>Button</SmallButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler multiple times', () => {
      const handleClick = vi.fn();
      render(<SmallButton onClick={handleClick}>Button</SmallButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should work without onClick handler', () => {
      expect(() => {
        render(<SmallButton>Button</SmallButton>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
      }).not.toThrow();
    });
  });

  describe('HTML button attributes', () => {
    it('should pass through type attribute', () => {
      render(<SmallButton type="submit">Submit</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should pass through aria-label attribute', () => {
      render(<SmallButton aria-label="Close dialog">X</SmallButton>);
      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should pass through data attributes', () => {
      render(<SmallButton data-testid="custom-button">Button</SmallButton>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('should pass through id attribute', () => {
      render(<SmallButton id="my-button">Button</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'my-button');
    });

    it('should pass through title attribute', () => {
      render(<SmallButton title="Tooltip text">Button</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Tooltip text');
    });

    it('should pass through name attribute', () => {
      render(<SmallButton name="submit-button">Button</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('name', 'submit-button');
    });

    it('should pass through form attribute', () => {
      render(<SmallButton form="my-form">Button</SmallButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'my-form');
    });
  });

  describe('Children variants', () => {
    it('should render with string children', () => {
      render(<SmallButton>Text Button</SmallButton>);
      expect(screen.getByText('Text Button')).toBeInTheDocument();
    });

    it('should render with number children', () => {
      render(<SmallButton>{42}</SmallButton>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with JSX children', () => {
      render(
        <SmallButton>
          <span data-testid="child">Custom Child</span>
        </SmallButton>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should render with multiple children', () => {
      render(
        <SmallButton>
          <span>First</span>
          <span>Second</span>
        </SmallButton>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty className prop', () => {
      const { container } = render(<SmallButton className="">Button</SmallButton>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('smallButton');
      expect(button?.className).not.toContain('undefined');
    });

    it('should filter out falsy values in className', () => {
      const { container } = render(
        <SmallButton disabled={false}>Button</SmallButton>
      );
      const button = container.querySelector('button');
      // Should not contain 'false' in className
      expect(button?.className).not.toContain('false');
    });

    it('should handle button with both icon and variant', () => {
      const { container } = render(
        <SmallButton variant="danger" icon={<span data-testid="icon">!</span>}>
          Delete
        </SmallButton>
      );
      const button = container.querySelector('button');
      expect(button?.className).toContain('danger');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should be accessible with keyboard', () => {
      const handleClick = vi.fn();
      render(<SmallButton onClick={handleClick}>Button</SmallButton>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      // Note: fireEvent.keyDown doesn't trigger click, but the button should be focusable
      expect(button).toHaveFocus();
    });
  });

  describe('Combinations', () => {
    it('should handle all props together', () => {
      const handleClick = vi.fn();
      render(
        <SmallButton
          variant="secondary"
          icon={<User data-testid="icon" />}
          disabled={false}
          onClick={handleClick}
          className="custom"
          type="button"
          aria-label="User profile"
        >
          Profile
        </SmallButton>
      );
      
      const button = screen.getByRole('button', { name: 'User profile' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button?.className).toContain('secondary');
      expect(button?.className).toContain('custom');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});