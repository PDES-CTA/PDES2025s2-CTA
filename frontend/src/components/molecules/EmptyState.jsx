import Button from '../atoms/Button';
import { FileText } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState({ onClearFilters }) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <FileText size={64} strokeWidth={1.5} />
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