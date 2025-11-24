import { useState, useEffect } from 'react';
import { Button, Badge, LoadingSpinner } from '../atoms';
import { formatPrice, formatDate, getFuelTypeClass, getTransmissionClass } from '../../utils/carUtils';
import { CarOffer } from '../../types/carOffer';
import styles from './CarDetail.module.css';

interface CarDetailProps {
  readonly carOfferId: string | number;
  readonly onBack: () => void;
  readonly getCarOfferById: (id: string | number) => Promise<CarOffer>;
}

export default function CarDetail({ carOfferId, onBack, getCarOfferById }: CarDetailProps) {
  const [carOffer, setCarOffer] = useState<CarOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarOffer = async () => {
      try {
        setLoading(true);
        const carOfferData = await getCarOfferById(carOfferId);
        setCarOffer(carOfferData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCarOffer();
  }, [carOfferId, getCarOfferById]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!carOffer) return <div>Car offer not found</div>;

  const { car, price, available, dealership, dealershipNotes, offerDate } = carOffer;

  return (
    <div className={styles.container}>
      <Button
        onClick={onBack}
        variant="ghost"
        className={styles.backButton}
      >
        ← Back to catalog
      </Button>

      <article className={styles.carDetail}>
        <div className={styles.imageSection}>
          {car.images && car.images.length > 0 ? (
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className={styles.mainImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>No image available</span>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>{car.brand} {car.model}</h1>
              <p className={styles.year}>Year {car.year}</p>
            </div>
            <div className={styles.priceSection}>
              <div className={styles.price}>{formatPrice(price)}</div>
              <Badge
                variant={available ? 'success' : 'danger'}
                text={available ? 'Available' : 'Sold'}
              />
            </div>
          </header>

          <div className={styles.specs}>
            <div className={styles.specItem}>
              <h3>Fuel</h3>
              <Badge variant="fuel" className={getFuelTypeClass(car.fuelType)} text={car.fuelType} />
            </div>
            <div className={styles.specItem}>
              <h3>Transmission</h3>
              <Badge variant="transmission" className={getTransmissionClass(car.transmission)} text={car.transmission} />
            </div>
            <div className={styles.specItem}>
              <h3>Color</h3>
              <p>{car.color}</p>
            </div>
          </div>

          {car.description && (
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{car.description}</p>
            </div>
          )}

          {dealershipNotes && (
            <div className={styles.dealershipNotes}>
              <h3>Dealership Notes</h3>
              <p>{dealershipNotes}</p>
            </div>
          )}

          <div className={styles.dealershipInfo}>
            <h3>Offered by</h3>
            <p className={styles.dealershipName}>{dealership.businessName}</p>
            {dealership.phone && <p>Phone: {dealership.phone}</p>}
            {dealership.email && <p>Email: {dealership.email}</p>}
            {dealership.address && <p>Address: {dealership.address}, {dealership.city}, {dealership.province}</p>}
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              disabled={!available}
              fullWidth
            >
              {available ? 'Contact Dealer' : 'Not available'}
            </Button>
            <Button variant="secondary" size="lg" fullWidth>
              Add to Favorites
            </Button>
          </div>

          <footer className={styles.metadata}>
            <p>Offer Date: {formatDate(offerDate)}</p>
            <p>ID: #{carOffer.id}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}