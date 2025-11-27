import { useState, useEffect } from 'react';
import styles from './AdminReviewsSection.module.css';
import {
  ReviewTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
  RatingFilters,
  PaginationInfo,
} from '../molecules';
import { adminService } from '../../services/api';

interface Review {
  id: number;
  buyerId: number;
  buyerName: string;
  carId: number;
  carName: string;
  rating: number | null;
  comment: string | null;
  dateAdded: string;
}

interface FavoriteWithReview {
  id: number;
  buyerId: number;
  buyerName: string;
  carId: number;
  carName: string;
  rating: number | null;
  comment: string | null;
  dateAdded: string;
}

const AdminReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    let filtered = reviews.filter((review: Review) => {
      const carName = review.carName || '';
      const buyerName = review.buyerName || '';
      return (
        carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (ratingFilter !== 'all') {
      const filterRating = Number.parseInt(ratingFilter);
      filtered = filtered.filter(
        (review: Review) => Math.round(review.rating || 0) === filterRating
      );
    }

    setFilteredReviews(filtered);
  }, [searchTerm, ratingFilter, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const allFavorites = await adminService.getAllFavoritesWithReviews();
      const reviewsData = allFavorites
        .filter((fav: FavoriteWithReview) => fav.rating !== null || fav.comment !== null)
      .map((fav: FavoriteWithReview) => ({
        id: fav.id,
        buyerId: fav.buyerId,
        buyerName: fav.buyerName,
        carId: fav.carId,
        carName: fav.carName,
        rating: fav.rating,
        comment: fav.comment,
        dateAdded: fav.dateAdded,
      }));
      
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReviewCount = (rating: string): number => {
    if (rating === 'all') return reviews.length;
    const ratingNum = Number.parseInt(rating);
    return reviews.filter(
      (r: Review) => Math.round(r.rating || 0) === ratingNum
    ).length;
  };

  if (loading) {
    return <LoadingState message="Loading reviews..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchReviews} retryLabel="Retry" />;
  }

  return (
    <div className={styles.section}>
      <SectionHeader
        title="Reviews & Opinions"
        subtitle="View and manage user reviews and ratings"
      />

      <div className={styles.content}>
        <SearchBar
          placeholder="Search by car name or reviewer..."
          value={searchTerm}
          onChange={setSearchTerm}
          resultCount={filteredReviews.length}
        />

        <RatingFilters
          activeRating={ratingFilter}
          onRatingChange={(rating: 'all' | '5' | '4' | '3' | '2' | '1') => setRatingFilter(rating)}
          getCount={getReviewCount}
        />

        {reviews.length === 0 ? (
          <EmptyState message="No reviews found" />
        ) : (
          <>
            <ReviewTable reviews={filteredReviews} />
            <PaginationInfo
              showing={filteredReviews.length}
              total={reviews.length}
              label="reviews"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsSection;