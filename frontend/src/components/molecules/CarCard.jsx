import { Image } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/carUtils';
import { Badge, Button } from '../atoms';
import styles from './CarCard.module.css';

export default function CarCard({ car, onViewDetails }) {
  const hasImages = car.images?.length > 0;
  
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        {hasImages && (
          <img
            src={car.images[0]}
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
          <div className={styles.price}>{formatPrice(car.price)}</div>
          <div className={styles.details}>
            Year {car.year} • {car.mileage.toLocaleString()} km
          </div>
        </div>

        <div className={styles.specs}>
          <Badge variant="fuel" text={car.fuelType} />
          <Badge variant="transmission" text={car.transmission} />
          <Badge variant="neutral" text={car.color} />
        </div>

        {car.description && (
          <p className={styles.description}>{car.description}</p>
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