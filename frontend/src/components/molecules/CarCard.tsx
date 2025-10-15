import { Image } from 'lucide-react';
import { SyntheticEvent } from 'react';
import { formatPrice, formatDate } from '../../utils/carUtils';
import { Badge, Button } from '../atoms';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';
import styles from './CarCard.module.css';

interface CarCardProps {
  readonly car: Car;
  readonly carOffer: CarOffer;
  readonly onViewDetails: () => void;
}

export default function CarCard({ car, carOffer, onViewDetails }: CarCardProps) {
  const hasImages = carOffer.images && carOffer.images.length > 0;

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const placeholder = target.nextSibling as HTMLElement;
    
    target.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        {hasImages && carOffer.images && (
          <img
            src={carOffer.images[0]}
            alt={`${car.brand} ${car.model}`}
            className={styles.image}
            onError={handleImageError}
          />
        )}
        <div className={hasImages ? styles.imagePlaceholderHidden : styles.imagePlaceholder}>
          <Image className={styles.placeholderIcon} size={48} strokeWidth={1.5} />
        </div>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <h3 className={styles.title}>
            {car.brand} {car.model}
          </h3>
          <Badge
            variant={car.available ? 'success' : 'danger'}
            text={car.available ? 'Available' : 'Sold'}
          />
        </header>

        <div className={styles.priceSection}>
          <div className={styles.price}>{formatPrice(carOffer.price)}</div>
          
          <div className={styles.details}>
            Year {car.year} • {car.mileage.toLocaleString()} km
          </div>
        </div>

        <div className={styles.specs}>
          <Badge variant="fuel" text={car.fuelType} />
          <Badge variant="transmission" text={car.transmission} />
          <Badge variant="neutral" text={car.color} />
        </div>

        {carOffer.dealershipNotes && (
          <p className={styles.description}>{carOffer.dealershipNotes}</p>
        )}

        <footer className={styles.footer}>
          <span className={styles.publishDate}>
            Published: {formatDate(car.publicationDate)}
          </span>
          <Button
            onClick={onViewDetails}
            disabled={!car.available}
            variant="primary"
            size="sm"
          >
            {car.available ? 'View Details' : 'Not available'}
          </Button>
        </footer>
      </div>
    </article>
  );
}