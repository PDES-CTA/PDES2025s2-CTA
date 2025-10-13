import CarCard from '../molecules/CarCard';
import { EmptyState } from '../molecules';
import { Car } from '../../types/car';
import styles from './CarList.module.css';

interface CarListProps {
  readonly cars: Car[];
  readonly onViewDetails: (carId: string | number) => void;
}

export default function CarList({ cars, onViewDetails }: CarListProps) {
  if (cars.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultsCount}>
        {cars.length} car{cars.length === 1 ? '' : 's'} found
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