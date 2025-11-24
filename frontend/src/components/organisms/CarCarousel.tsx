import { useState } from 'react';
import { Image, Plus } from 'lucide-react';
import SmallButton from '../atoms/SmallButton';
import { Car } from '../../types/car';
import styles from './CarCarousel.module.css';
import React from 'react';

interface CarCarouselProps {
  readonly cars: Car[];
  readonly onAddOffer: (carId: string | number) => void;
  readonly onViewDetails: (carId: string | number) => void;
}

export default function CarCarousel({ cars, onAddOffer, onViewDetails }: CarCarouselProps) {
  const [featuredIndex, setFeaturedIndex] = useState(0);

  if (cars.length === 0) {
    return null;
  }

  const featuredCar = cars[featuredIndex];
  const hasImages = featuredCar.images && featuredCar.images.length > 0;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const placeholder = target.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  return (
    <div className={styles.carousel}>
      {/* Featured Car */}
      <div className={styles.featured}>
        <div className={styles.featuredImage}>
          {hasImages && featuredCar.images && (
            <img
              src={featuredCar.images[0]}
              alt={`${featuredCar.brand} ${featuredCar.model}`}
              className={styles.image}
              onError={handleImageError}
            />
          )}
          <div className={hasImages ? styles.imagePlaceholderHidden : styles.imagePlaceholder}>
            <Image className={styles.placeholderIcon} size={80} strokeWidth={1.5} />
          </div>
        </div>

        <div className={styles.featuredDetails}>
          <div className={styles.featuredHeader}>
            <div>
              <h2 className={styles.featuredTitle}>
                {featuredCar.brand} {featuredCar.model}
              </h2>
              <p className={styles.featuredYear}>Year {featuredCar.year}</p>
            </div>
          </div>

          <div className={styles.featuredSpecs}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Fuel:</span>
              <span className={styles.specValue}>{featuredCar.fuelType}</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Transmission:</span>
              <span className={styles.specValue}>{featuredCar.transmission}</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Color:</span>
              <span className={styles.specValue}>{featuredCar.color}</span>
            </div>
          </div>

          {featuredCar.description && (
            <p className={styles.featuredDescription}>{featuredCar.description}</p>
          )}

          <div className={styles.featuredActions}>
            <SmallButton 
              onClick={() => onViewDetails(featuredCar.id)} 
              variant="secondary"
            >
              View Details
            </SmallButton>
            <SmallButton 
              onClick={() => onAddOffer(featuredCar.id)} 
              variant="primary"
            >
              <Plus size={18} />
              Add to Offer
            </SmallButton>
          </div>
        </div>
      </div>

      {/* Other Cars */}
      {cars.length > 1 && (
        <div className={styles.otherCars}>
          <h3 className={styles.otherCarsTitle}>Other Available Cars</h3>
          <div className={styles.carGrid}>
            {cars.map((car, index) => {
              if (index === featuredIndex) return null;
              
              const hasOtherImages = car.images && car.images.length > 0;

              return (
                <div 
                  key={car.id} 
                  className={styles.carCard}
                  onClick={() => setFeaturedIndex(index)}
                >
                  <div className={styles.carCardImage}>
                    {hasOtherImages && car.images && (
                      <img
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        className={styles.image}
                        onError={handleImageError}
                      />
                    )}
                    <div className={hasOtherImages ? styles.imagePlaceholderHidden : styles.carCardPlaceholder}>
                      <Image size={32} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className={styles.carCardContent}>
                    <h4 className={styles.carCardTitle}>
                      {car.brand} {car.model}
                    </h4>
                    <p className={styles.carCardYear}>{car.year}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}