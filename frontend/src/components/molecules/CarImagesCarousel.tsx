import { useState } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CarImagesCarousel.module.css';

interface CarImagesCarouselProps {
  readonly images: string[];
  readonly altText: string;
}

export function CarImagesCarousel({ images, altText }: CarImagesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasImages = images && images.length > 0;
  const totalImages = hasImages ? images.length : 0;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalImages - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === totalImages - 1 ? 0 : prevIndex + 1));
  };

  if (!hasImages) {
    return (
      <div className={`${styles.carousel} ${styles.placeholder}`}>
        <ImageIcon size={64} strokeWidth={1} />
        <span>No images available</span>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      {totalImages > 1 && (
        <button
          type="button"
          onClick={goToPrevious}
          className={`${styles.arrow} ${styles.left}`}
          aria-label="Show previous image"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <img
        src={images[currentIndex]}
        alt={`${altText} (${currentIndex + 1}/${totalImages})`}
        className={styles.image}
      />

      {totalImages > 1 && (
        <button
          type="button"
          onClick={goToNext}
          className={`${styles.arrow} ${styles.right}`}
          aria-label="Show next label"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {totalImages > 1 && (
        <div className={styles.dots}>
          {images.map((imageUrl, index) => (
            <button
              key={imageUrl}
              type="button"
              className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
