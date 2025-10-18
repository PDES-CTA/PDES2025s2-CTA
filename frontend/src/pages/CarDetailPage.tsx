import{ useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarSearch, DisplayCar } from '../hooks/useCarSearch';
import { LoadingSpinner, Badge } from '../components/atoms';
import { ErrorMessage } from '../components/molecules';
import DealershipOfferCard from '../components/molecules/DealershipOfferCard';
import { CarImagesCarousel } from '../components/molecules/CarImagesCarousel';
import { formatPrice } from '../utils';
import styles from './CarDetailPage.module.css';
import { ArrowLeft, Gauge, Fuel, Cog, Palette, CalendarDays } from 'lucide-react';

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [carData, setCarData] = useState<DisplayCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getDisplayCarById } = useCarSearch();

  useEffect(() => {
      const fetchCarDetails = async () => {
      const numericId = id ? parseInt(id, 10) : NaN;
      if (isNaN(numericId)) {
        setError('Invalid Car ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getDisplayCarById(numericId);
        if (data) {
          setCarData(data);
        } else {
          setError(`Car with ID ${id} not found.`);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load car details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id, getDisplayCarById]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
     return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !carData) {
      return (
      <div className={styles.errorContainer}>
        <ErrorMessage
          error={error || 'Car data could not be loaded.'}
          onRetry={handleGoBack}
          retryLabel="Go Back"
        />
      </div>
    );
  }

  const { car, offers } = carData;
  const availableOffers = offers.filter(o => o.available);
  const hasAvailableOffer = availableOffers.length > 0;

  let lowestPrice: number | null = null;
  let highestPrice: number | null = null;
  let priceDisplay: string = '-';

  if (hasAvailableOffer) {
    const prices = availableOffers.map(o => o.price);
    lowestPrice = Math.min(...prices);
    highestPrice = Math.max(...prices);

    if (lowestPrice === highestPrice) {
      priceDisplay = `From ${formatPrice(lowestPrice)}`;
    } else {
      priceDisplay = `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice)}`;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <ArrowLeft size={18} /> Back to list
        </button>

        <div className={styles.card}>
          <div className={styles.cardLayout}>
            <div className={styles.imageSection}>
              <CarImagesCarousel images={car.images || []} altText={`${car.brand} ${car.model}`} />
            </div>

            <div className={styles.infoSection}>
              <h1 className={styles.title}>
                {car.brand} {car.model}
              </h1>

              <p className={styles.price}>{priceDisplay}</p>

              <div className={styles.details}>
                  <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <CalendarDays size={16} /> Year:
                  </span>
                  <span className={styles.value}>{car.year}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <Gauge size={16} /> Mileage:
                  </span>
                  <span className={styles.value}>0 km</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <Fuel size={16} /> Fuel:
                  </span>
                  <span className={styles.value}>{car.fuelType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <Cog size={16} /> Transmission:
                  </span>
                  <span className={styles.value}>{car.transmission}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <Palette size={16} /> Color:
                  </span>
                  <span className={styles.value}>{car.color}</span>
                </div>
              </div>

              {car.description && (
                <div className={styles.descriptionSection}>
                  <h3 className={styles.descriptionTitle}>Description</h3>
                  <p className={styles.description}>{car.description}</p>
                </div>
              )}

              {!hasAvailableOffer && offers.length > 0 && (
                <Badge variant="danger" text="Offers no longer available" />
              )}
               {!hasAvailableOffer && offers.length === 0 && (
                <Badge variant="secondary" text="No current offers for this car" />
              )}
            </div>
          </div>
        </div>

        <div className={styles.offerSection}>
          <h2>Dealership Offers</h2>
          {hasAvailableOffer ? (
            <div className={styles.offerList}>
              {availableOffers.map(offer => (
                <DealershipOfferCard
                  key={offer.id}
                  offer={offer}
                  dealership={offer.dealership}
                />
              ))}
            </div>
          ) : (
            <p className={styles.noOfferText}>No dealership is currently offering this car.</p>
          )}
        </div>
      </div>
    </div>
  );
}