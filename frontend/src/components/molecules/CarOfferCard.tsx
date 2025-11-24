import { Image, Edit, Trash2 } from 'lucide-react';
import { SyntheticEvent } from 'react';
import { formatPrice, formatDate } from '../../utils/carUtils';
import { Badge, SmallButton } from '../atoms';
import { CarOffer } from '../../types/carOffer';
import styles from './CarOfferCard.module.css';

interface CarOfferCardProps {
  readonly offer: CarOffer;
  readonly onViewDetails: () => void;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
}

export default function CarOfferCard({ 
  offer, 
  onViewDetails, 
  onEdit, 
  onDelete 
}: CarOfferCardProps) {
  const { car } = offer;
  const hasImages = car.images && car.images.length > 0;

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
            variant={offer.available ? 'success' : 'danger'}
            text={offer.available ? 'Available' : 'Unavailable'}
          />
        </header>

        <div className={styles.priceSection}>
          <div className={styles.price}>{formatPrice(offer.price)}</div>
          <div className={styles.details}>
            Year {car.year} • 0 km
          </div>
        </div>

        <div className={styles.specs}>
          <Badge variant="fuel" text={car.fuelType} />
          <Badge variant="transmission" text={car.transmission} />
          <Badge variant="neutral" text={car.color} />
        </div>

        <div className={styles.stockInfo}>
          <span className={styles.stockLabel}>Offered date:</span>
          <span className={styles.stockValue}>{formatDate(offer.offerDate)}</span>
        </div>

        {offer.dealershipNotes && (
          <p className={styles.description}>{offer.dealershipNotes}</p>
        )}

        <footer className={styles.footer}>
          <span className={styles.publishDate}>
            Published: {formatDate(car.publicationDate)}
          </span>
          <div className={styles.actions}>
            <SmallButton
              onClick={onViewDetails}
              variant="primary"
            >
              View Details
            </SmallButton>
            {onEdit && (
              <SmallButton
                onClick={onEdit}
                variant="secondary"
              >
                <Edit size={16} />
                Edit
              </SmallButton>
            )}
            {onDelete && (
              <SmallButton
                onClick={onDelete}
                variant="danger"
              >
                <Trash2 size={16} />
                Delete
              </SmallButton>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}