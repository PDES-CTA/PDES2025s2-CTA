import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './SmallButton.module.css';

interface SmallButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly icon?: ReactNode;
  readonly className?: string;
}

export default function SmallButton({
  children,
  variant = 'primary',
  icon,
  disabled = false,
  onClick,
  className = '',
  ...props
}: SmallButtonProps) {
  const classes = [
    styles.smallButton,
    styles[variant],
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}