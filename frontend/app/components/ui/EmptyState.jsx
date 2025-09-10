import Button from './Button';
import styles from '../styles/EmptyState.module.css';

export default function EmptyState({ onClearFilters }) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className={styles.title}>No se encontraron autos</h3>
      <p className={styles.message}>Intentá ajustar tus filtros de búsqueda.</p>
      {onClearFilters && (
        <Button onClick={onClearFilters} variant="primary">
          Ver todos los autos
        </Button>
      )}
    </div>
  );
}