import Button from './Button';
import styles from '../styles/ErrorMessage.module.css';

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className={styles.container}>
      <div className={styles.errorBox}>
        <h3 className={styles.title}>Error al cargar datos</h3>
        <p className={styles.message}>{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="danger">
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}