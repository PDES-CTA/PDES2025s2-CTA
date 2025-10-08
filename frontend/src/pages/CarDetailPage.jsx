import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { carService } from '../services/api';
import { formatPrice, formatKilometers } from '../utils';
import styles from './CarDetailPage.module.css';

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const data = await carService.getCarById(id);
      setCar(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el auto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/600x400?text=Sin+Imagen';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.spinner} size={64} />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} size={64} />
        <h3 className={styles.errorTitle}>Auto no encontrado</h3>
        <p className={styles.errorMessage}>
          {error || 'El auto que buscas no existe o fue eliminado'}
        </p>
        <button onClick={() => navigate('/cars')} className={styles.errorButton}>
          Ver todos los autos
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className={styles.card}>
          <div className={styles.cardLayout}>
            {/* Image Section */}
            <div className={styles.imageSection}>
              {car.images?.[0] ? (
                <img
                  src={car.images[0]}
                  alt={`${car.brand} ${car.model}`}
                  className={styles.image}
                  onError={handleImageError}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <ImageIcon size={64} strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className={styles.infoSection}>
              <h1 className={styles.title}>
                {car.brand} {car.model}
              </h1>
              <p className={styles.price}>{formatPrice(car.price)}</p>

              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Año:</span>
                  <span className={styles.value}>{car.year}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Kilometraje:</span>
                  <span className={styles.value}>{formatKilometers(car.mileage)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Color:</span>
                  <span className={styles.value}>{car.color}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Combustible:</span>
                  <span className={styles.value}>{car.fuelType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Transmisión:</span>
                  <span className={styles.value}>{car.transmission}</span>
                </div>
              </div>

              {car.description && (
                <div className={styles.descriptionSection}>
                  <h3 className={styles.descriptionTitle}>Descripción:</h3>
                  <p className={styles.description}>{car.description}</p>
                </div>
              )}

              <button className={styles.buyButton}>
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}