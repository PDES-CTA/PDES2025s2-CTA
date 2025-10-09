import { useState, useEffect } from 'react';
import { Button, Badge, LoadingSpinner } from '../atoms';
import { formatPrice, formatDate, getFuelTypeClass, getTransmissionClass } from '../../utils/carUtils';
import styles from './CarDetail.module.css';

export default function CarDetail({ carId, onBack, getCarById }) {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const carData = await getCarById(carId);
        setCar(carData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, getCarById]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!car) return <div>Car not found</div>;

  return (
    <div className={styles.container}>
      <Button
        onClick={onBack}
        variant="ghost"
        className={styles.backButton}
      >
        ← Volver al catálogo
      </Button>

      <article className={styles.carDetail}>
        <div className={styles.imageSection}>
          {car.images?.length > 0 ? (
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className={styles.mainImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>Sin imagen disponible</span>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>{car.brand} {car.model}</h1>
              <p className={styles.year}>Año {car.year}</p>
            </div>
            <div className={styles.priceSection}>
              <div className={styles.price}>{formatPrice(car.price)}</div>
              <Badge
                variant={car.available ? 'success' : 'danger'}
                text={car.available ? 'Disponible' : 'Vendido'}
              />
            </div>
          </header>

          <div className={styles.specs}>
            <div className={styles.specItem}>
              <h3>Kilometraje</h3>
              <p>{car.mileage.toLocaleString()} km</p>
            </div>
            <div className={styles.specItem}>
              <h3>Combustible</h3>
              <Badge variant="fuel" className={getFuelTypeClass(car.fuelType)} text={car.fuelType} />
            </div>
            <div className={styles.specItem}>
              <h3>Transmisión</h3>
              <Badge variant="transmission" className={getTransmissionClass(car.transmission)} text={car.transmission} />
            </div>
            <div className={styles.specItem}>
              <h3>Color</h3>
              <p>{car.color}</p>
            </div>
          </div>

          {car.description && (
            <div className={styles.description}>
              <h3>Descripción</h3>
              <p>{car.description}</p>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              disabled={!car.available}
              fullWidth
            >
              {car.available ? 'Contactar Concesionaria' : 'No disponible'}
            </Button>
            <Button variant="secondary" size="lg" fullWidth>
              Agregar a Favoritos
            </Button>
          </div>

          <footer className={styles.metadata}>
            <p>Publicado: {formatDate(car.publicationDate)}</p>
            <p>ID: #{car.id}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}