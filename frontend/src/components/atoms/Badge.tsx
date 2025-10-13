import styles from './Badge.module.css';

interface BadgeProps {
  readonly text: string;
  readonly variant?: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'fuel' | 'transmission';
  readonly className?: string;
}

export default function Badge({
  text,
  variant = 'neutral',
  className = ''
}: BadgeProps) {
  const classes = [
    styles.badge,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {text}
    </span>
  );
}