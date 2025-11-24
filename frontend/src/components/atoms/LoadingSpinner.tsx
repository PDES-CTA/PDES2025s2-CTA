import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  readonly text?: string;
}

export default function LoadingSpinner({ text = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true"></div>
      <p className={styles.text}>{text}</p>
    </div>
  );
}