import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  readonly text?: string;
}

export default function LoadingSpinner({ text = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>{text}</p>
    </div>
  );
}