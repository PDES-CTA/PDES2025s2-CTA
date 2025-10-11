import Button from '../atoms/Button';
import styles from './ErrorMessage.module.css';

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className={styles.container}>
      <div className={styles.errorBox}>
        <h3 className={styles.title}>Error loading data</h3>
        <p className={styles.message}>{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="danger">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}