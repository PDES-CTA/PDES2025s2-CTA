import CarCard from '../molecules/CarCard';
import { EmptyState } from '../molecules';
import { CarOffer } from '../../types/carOffer';
import styles from './CarList.module.css';

interface CarListProps {
  readonly carOffers: CarOffer[];
  readonly onViewDetails: (carId: string | number) => void;
}

export default function CarList({ carOffers, onViewDetails }: CarListProps) {
  if (carOffers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultsCount}>
        {carOffers.length} car{carOffers.length === 1 ? '' : 's'} found
      </div>
      <div className={styles.grid}>
        {carOffers.map((carOffer) => (
          <CarCard
            key={carOffer.id}
            car={carOffer.car}
            carOffer={carOffer}
            onViewDetails={() => onViewDetails(carOffer.car.id)}
          />
        ))}
      </div>
    </div>
  );
}