import CarCard from '../molecules/CarCard';
import { EmptyState } from '../molecules';
import { DisplayCar } from '../../hooks/useCarSearch';
import styles from './CarList.module.css';

interface CarListProps {
  readonly displayCars: DisplayCar[];
  readonly onViewDetails: (carId: string | number) => void;
}

export default function CarList({ displayCars, onViewDetails }: CarListProps) {
  if (!displayCars || displayCars.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultsCount}>
        {displayCars.length} car{displayCars.length === 1 ? '' : 's'} found
      </div>
      <div className={styles.grid}>
        {displayCars.map(({ car, offers }) => (
          <CarCard
            key={car.id}
            car={car}
            offers={offers ?? []}
            onViewDetails={() => onViewDetails(car.id)}
          />
        ))}
      </div>
    </div>
  );
}