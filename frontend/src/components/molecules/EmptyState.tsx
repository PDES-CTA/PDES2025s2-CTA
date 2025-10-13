import Button from '../atoms/Button';
import { FileText } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  readonly onClearFilters?: () => void;
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <FileText size={64} strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>No cars found</h3>
      <p className={styles.message}>Try adjusting your search filters.</p>
      {onClearFilters && (
        <Button onClick={onClearFilters} variant="primary">
          View all cars
        </Button>
      )}
    </div>
  );
}