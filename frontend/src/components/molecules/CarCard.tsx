import { Image } from 'lucide-react';
import { SyntheticEvent } from 'react';
import { formatPrice, formatDate } from '../../utils/carUtils';
import { Badge, Button } from '../atoms';
import { Car } from '../../types/car';
import { CarOffer } from '../../types/carOffer';
import styles from './CarCard.module.css';
import { Dealership } from '../../types/dealership';

interface CarCardProps {
  readonly car: Car;
  readonly offers: (CarOffer & { dealership?: Dealership })[];
  readonly onViewDetails: () => void;
}

export default function CarCard({ car, offers, onViewDetails }: CarCardProps) {
  const hasImages = car.images && car.images.length > 0;

  const availableOffers = (offers ?? []).filter(o => o.available);
  const hasAvailableOffer = availableOffers.length > 0;

  let lowestPrice: number | null = null;
  let highestPrice: number | null = null;

  if (hasAvailableOffer) {
    const prices = availableOffers.map(o => o.price);
    lowestPrice = Math.min(...prices);
    highestPrice = Math.max(...prices);
  }

  const description = availableOffers[0]?.dealershipNotes || car.description;

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
         {hasImages && car.images && (
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
            variant={hasAvailableOffer ? 'success' : 'danger'}
            text={hasAvailableOffer ? 'Offer Available' : 'No Offers'}
          />
        </header>

        <div className={styles.priceSection}>
          {lowestPrice !== null && highestPrice !== null ? (
            <div className={styles.price}>
              {lowestPrice === highestPrice ? (
                `From ${formatPrice(lowestPrice)}`
              ) : (
                `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice)}`
              )}
            </div>
          ) : (
            <div className={styles.pricePlaceholder}>-</div>
          )}
          <div className={styles.details}>
            Year {car.year} • 0 km
          </div>
        </div>

         <div className={styles.specs}>
          <Badge variant="fuel" text={car.fuelType} />
          <Badge variant="transmission" text={car.transmission} />
          <Badge variant="neutral" text={car.color} />
        </div>

        {description && <p className={styles.description}>{description}</p>}

        <footer className={styles.footer}>
          <span className={styles.publishDate}>
            Published: {formatDate(car.publicationDate)}
          </span>
          <Button
            onClick={onViewDetails}
            disabled={!hasAvailableOffer}
            variant="primary"
            size="sm"
          >
            View Details
          </Button>
        </footer>
      </div>
    </article>
  );
}