import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarSearch, DisplayCar } from '../hooks/useCarSearch';
import { LoadingSpinner, Badge } from '../components/atoms';
import { ErrorMessage } from '../components/molecules';
import DealershipOfferCard from '../components/molecules/DealershipOfferCard';
import { CarImagesCarousel } from '../components/molecules/CarImagesCarousel';
import { formatPrice } from '../utils';
import { authService, favoriteService } from '../services/api';
import styles from './CarDetailPage.module.css';
import { ArrowLeft, Gauge, Fuel, Cog, Palette, CalendarDays, Heart, Star, Edit2 } from 'lucide-react';

interface RecentFavorite {
  id: number | string;
  car: {
    id: number | string;
    brand: string;
    model: string;
    year: number;
    images?: string[];
  };
  buyer: {
    id: number;
    email: string;
  };
  rating: number;
  comment: string | null;
  dateAdded: string;
}

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [carData, setCarData] = useState<DisplayCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Review states
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [currentComment, setCurrentComment] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // Recent reviews from other users
  const [recentReviews, setRecentReviews] = useState<RecentFavorite[]>([]);
  
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
      setIsFavorite(false);
      setFavoriteId(null);
      setCurrentRating(0);
      setCurrentComment('');
      
      try {
        const data = await getDisplayCarById(numericId);
        if (data) {
          setCarData(data);
          await loadUserAndCheckFavorite(numericId);
        } else {
          setError(`Car with ID ${id} not found.`);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load car details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id, getDisplayCarById]);

  const loadUserAndCheckFavorite = async (carId: number) => {
    try {
      const user = await authService.getLoggedUser();
      setCurrentUserId(user.id);
      await checkIfFavorite(user.id, carId);
      await loadRecentReviews(carId, user.id);
    } catch (err) {
      console.log('Could not load user or check favorites:', err);
    }
  };

  const loadRecentReviews = async (carId: number, currentUserId: number) => {
    try {
      const allReviews = await favoriteService.getFavoritesByCarId(carId);
      // Get top 3 most recent reviews from OTHER users (not current user) that have rating or comment
      const recent = allReviews
        .filter(fav => 
          fav.buyer.id !== currentUserId && 
          (fav.rating! > 0 || (fav.comment && fav.comment.trim() !== ''))
        )
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 3);
      setRecentReviews(recent);
    } catch (err) {
      console.log('Could not load recent reviews:', err);
    }
  };

  const checkIfFavorite = async (buyerId: number, carId: number) => {
    try {
      const favorites = await favoriteService.getFavoritesByBuyerId(buyerId);
      const favorite = favorites.find(fav => fav.car.id === carId);
      
      if (favorite) {
        setIsFavorite(true);
        setFavoriteId(favorite.id);
        setCurrentRating(favorite.rating || 0);
        setCurrentComment(favorite.comment || '');
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
        setCurrentRating(0);
        setCurrentComment('');
      }
    } catch (err) {
      console.log('Could not check favorites:', err);
      setIsFavorite(false);
      setFavoriteId(null);
    }
  };

  const handleToggleFavorite = async () => {
    if (!carData || !currentUserId) {
      alert('Please login as a buyer to manage favorites.');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite && favoriteId) {
        await favoriteService.deleteFavoriteCar(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        setCurrentRating(0);
        setCurrentComment('');
        setShowReviewForm(false);
      } else {
        const now = new Date().toISOString().slice(0, 19);
        const favorite = await favoriteService.saveFavorite({
          buyerId: currentUserId,
          carId: carData.car.id,
          dateAdded: now,
          rating: 0,
          comment: '',
          priceNotifications: false
        });
        setIsFavorite(true);
        setFavoriteId(favorite.id);
        setCurrentRating(0);
        setCurrentComment('');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Failed to update favorites');
      } else {
        alert('Failed to update favorites. Please make sure you are logged in as a buyer.');
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddReviewClick = () => {
    setEditRating(currentRating);
    setEditComment(currentComment);
    setShowReviewForm(true);
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditRating(currentRating);
    setEditComment(currentComment);
  };

  const handleSaveReview = async () => {
    if (!favoriteId) return;
    
    if (editRating === 0 && editComment.trim() === '') {
      alert('Please provide at least a rating or a comment.');
      return;
    }

    setReviewLoading(true);
    try {
      const updatedFavorite = await favoriteService.updateReview(favoriteId, {
        rating: editRating,
        comment: editComment.trim()
      });
      
      setCurrentRating(updatedFavorite.rating || 0);
      setCurrentComment(updatedFavorite.comment || '');
      setShowReviewForm(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Failed to save review');
      } else {
        alert('Failed to save review. Please try again.');
      }
    } finally {
      setReviewLoading(false);
    }
  };

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

  const hasReview = currentRating > 0 || currentComment.trim() !== '';

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
              <div className={styles.titleRow}>
                <h1 className={styles.title}>
                  {car.brand} {car.model}
                </h1>
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    size={24}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    className={favoriteLoading ? styles.favoriteLoading : ''}
                  />
                </button>
              </div>

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

        {/* Review Section - Only shown when favorited */}
        {isFavorite && (
          <div className={styles.reviewSection}>
            <div className={styles.reviewHeader}>
              <h2 className={styles.reviewTitle}>
                <Heart size={20} className={styles.reviewIcon} />
                Your Review
              </h2>
            </div>

            {!showReviewForm ? (
              <div className={styles.reviewDisplay}>
                {hasReview ? (
                  <>
                    {currentRating > 0 && (
                      <div className={styles.ratingDisplay}>
                        <Star size={18} fill="#f59e0b" color="#f59e0b" />
                        <span className={styles.ratingValue}>{currentRating} / 10</span>
                      </div>
                    )}
                    {currentComment && (
                      <p className={styles.commentDisplay}>{currentComment}</p>
                    )}
                    <button onClick={handleAddReviewClick} className={styles.editReviewButton}>
                      <Edit2 size={16} />
                      Edit Review
                    </button>
                  </>
                ) : (
                  <>
                    <p className={styles.noReviewText}>
                      You've added this car to your favorites. Share your thoughts!
                    </p>
                    <button onClick={handleAddReviewClick} className={styles.addReviewButton}>
                      <Star size={16} />
                      Add Review
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.reviewForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="rating" className={styles.formLabel}>
                    Rating (1-10) <span className={styles.optional}>Optional</span>
                  </label>
                  <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditRating(star)}
                        className={styles.starButton}
                        aria-label={`Rate ${star} out of 10`}
                      >
                        <Star
                          size={28}
                          fill={star <= editRating ? '#f59e0b' : 'none'}
                          color={star <= editRating ? '#f59e0b' : '#d1d5db'}
                          className={styles.starIcon}
                        />
                      </button>
                    ))}
                  </div>
                  <div className={styles.ratingText}>
                    {editRating > 0 ? `${editRating} / 10` : 'No rating selected'}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="comment" className={styles.formLabel}>
                    Comment <span className={styles.optional}>Optional</span>
                  </label>
                  <textarea
                    id="comment"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Share your thoughts about this car..."
                    rows={4}
                    maxLength={1000}
                    className={styles.commentTextarea}
                  />
                  <span className={styles.charCount}>{editComment.length} / 1000</span>
                </div>

                <div className={styles.formActions}>
                  <button
                    onClick={handleCancelReview}
                    disabled={reviewLoading}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReview}
                    disabled={reviewLoading}
                    className={styles.saveButton}
                  >
                    {reviewLoading ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Reviews Section - Other Users */}
        {recentReviews.length > 0 && (
          <div className={styles.recentReviewsSection}>
            <h2 className={styles.sectionTitle}>Recent Reviews from Other Buyers</h2>
            <div className={styles.reviewsGrid}>
              {recentReviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <div className={styles.reviewerInfo}>
                      <span className={styles.reviewerName}>{review.buyer.email}</span>
                      <span className={styles.reviewDate}>
                        {new Date(review.dateAdded).toLocaleDateString()}
                      </span>
                    </div>
                    {review.rating > 0 && (
                      <div className={styles.reviewRating}>
                        <Star size={16} fill="#3b82f6" color="#3b82f6" />
                        <span className={styles.reviewRatingValue}>{review.rating}/10</span>
                      </div>
                    )}
                  </div>
                  {review.comment && (
                    <p className={styles.reviewComment}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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