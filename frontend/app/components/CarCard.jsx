import { formatPrice, formatDate, getFuelTypeClass, getTransmissionClass } from './utils/carUtils';
import Badge from './ui/Badge';
import Button from './ui/Button';
import styles from './styles/CarCard.module.css';

export default function CarCard({ car, onViewDetails }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        {car.images?.length > 0 ? (
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            className={styles.image}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`${styles.imagePlaceholder} ${car.images?.length > 0 ? styles.hidden : ''}`}>
          <svg className={styles.placeholderIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className={styles.content}>
        <header className={styles.cardHeader}>
          <h3 className={styles.carTitle}>
            {car.brand} {car.model}
          </h3>
          <Badge 
            variant={car.available ? 'success' : 'danger'}
            text={car.available ? 'Disponible' : 'Vendido'}
          />
        </header>

        <div className={styles.priceSection}>
          <div className={styles.price}>{formatPrice(car.price)}</div>
          <div className={styles.details}>
            Año {car.year} • {car.mileage.toLocaleString()} km
          </div>
        </div>

        <div className={styles.specs}>
          <Badge variant="fuel" className={getFuelTypeClass(car.fuelType)} text={car.fuelType} />
          <Badge variant="transmission" className={getTransmissionClass(car.transmission)} text={car.transmission} />
          <Badge variant="neutral" text={car.color} />
        </div>

        {car.description && (
          <p className={styles.description}>{car.description}</p>
        )}

        <footer className={styles.cardFooter}>
          <span className={styles.publishDate}>
            Publicado: {formatDate(car.publicationDate)}
          </span>
          <Button
            onClick={onViewDetails}
            disabled={!car.available}
            variant="primary"
            size="sm"
          >
            {car.available ? 'Ver Detalles' : 'No disponible'}
          </Button>
        </footer>
      </div>
    </article>
  );
}