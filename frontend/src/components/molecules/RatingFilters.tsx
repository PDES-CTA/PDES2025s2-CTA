import React from 'react';
import styles from './RatingFilters.module.css';

interface RatingFiltersProps {
  activeRating: 'all' | '5' | '4' | '3' | '2' | '1';
  onRatingChange: (rating: 'all' | '5' | '4' | '3' | '2' | '1') => void;
  getCount: (rating: string) => number;
}

const RatingFilters: React.FC<RatingFiltersProps> = ({
  activeRating,
  onRatingChange,
  getCount,
}) => {
  const ratings = ['all', '5', '4', '3', '2', '1'] as const;

  return (
    <div className={styles.ratingFilters}>
      {ratings.map((rating) => (
        <button
          key={rating}
          className={`${styles.ratingBtn} ${activeRating === rating ? styles.active : ''}`}
          onClick={() => onRatingChange(rating)}
        >
          {rating === 'all' ? (
            <>All ({getCount('all')})</>
          ) : (
            <>
              {'★'.repeat(Number.parseInt(rating))} ({getCount(rating)})
            </>
          )}
        </button>
      ))}
    </div>
  );
};

export default RatingFilters;