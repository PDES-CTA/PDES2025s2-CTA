import CarCard from './CarCard';
import EmptyState from './ui/EmptyState';
import styles from './styles/CarList.module.css';

export default function CarList({ cars, onViewDetails }) {
  if (cars.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultsCount}>
        {cars.length} auto{cars.length !== 1 ? 's' : ''} encontrado{cars.length !== 1 ? 's' : ''}
      </div>
      
      <div className={styles.grid}>
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onViewDetails={() => onViewDetails(car.id)}
          />
        ))}
      </div>
    </div>
  );
}