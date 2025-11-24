import Button from '../atoms/Button';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  readonly error: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
}

export default function ErrorMessage({ error, onRetry, retryLabel }: ErrorMessageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.errorBox}>
        <h3 className={styles.title}>Error loading data</h3>
        <p className={styles.message}>{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="danger">
            {retryLabel || 'Retry'}
          </Button>
        )}
      </div>
    </div>
  );
}