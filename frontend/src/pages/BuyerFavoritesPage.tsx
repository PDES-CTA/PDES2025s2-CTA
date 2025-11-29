import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, Trash2, Edit2, Eye } from 'lucide-react';
import { favoriteService, authService } from '../services/api';
import { LoadingSpinner } from '../components/atoms';
import { ErrorMessage } from '../components/molecules';
import { ROUTES } from '../constants';
import styles from './BuyerFavoritesPage.module.css';
import { Favorite } from '../types/favoriteCar';

export default function BuyerFavoritesPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFavoriteId, setEditingFavoriteId] = useState<number | string | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUser = await authService.getLoggedUser();
      if (currentUser.id !== parseInt(userId)) {
        setError('You can only view your own favorites');
        setLoading(false);
        return;
      }

      const data = await favoriteService.getFavoritesByBuyerId(userId);
      setFavorites(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load favorites');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId, fetchFavorites]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewDetails = (carId: number | string) => {
    navigate(`/cars/${carId}`);
  };

  const handleDeleteFavorite = async (favoriteId: number | string) => {
    if (!confirm('Are you sure you want to remove this car from your favorites?')) {
      return;
    }

    try {
      await favoriteService.deleteFavoriteCar(favoriteId);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Failed to delete favorite');
      } else {
        alert('Failed to delete favorite');
      }
    }
  };

  const handleEditReview = (favorite: Favorite) => {
    setEditingFavoriteId(favorite.id);
    setEditRating(favorite.rating || 0);
    setEditComment(favorite.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingFavoriteId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleSaveReview = async (favoriteId: number | string) => {
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

      setFavorites(favorites.map(fav => 
        fav.id === favoriteId ? { ...fav, rating: updatedFavorite.rating, comment: updatedFavorite.comment } : fav
      ));
      setEditingFavoriteId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Failed to save review');
      } else {
        alert('Failed to save review');
      }
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage error={error} onRetry={fetchFavorites} />
      </div>
    );
  }

  const hasReview = (favorite: Favorite) => {
    return favorite.rating > 0 || (favorite.comment && favorite.comment.trim() !== '');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Heart size={32} className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>My Favorites</h1>
              <p className={styles.subtitle}>
                {favorites.length} {favorites.length === 1 ? 'car' : 'cars'} in your favorites
              </p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <Heart size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No favorites yet</h2>
            <p className={styles.emptyText}>
              Start adding cars to your favorites to keep track of the ones you love!
            </p>
            <button onClick={() => navigate(ROUTES.CARS)} className={styles.browseButton}>
              Browse Cars
            </button>
          </div>
        ) : (
          <div className={styles.favoritesGrid}>
            {favorites.map(favorite => (
              <div key={favorite.id} className={styles.favoriteCard}>
                <div className={styles.cardImage}>
                  <img
                    src={favorite.car.images?.[0] || '/placeholder-car.jpg'}
                    alt={`${favorite.car.brand} ${favorite.car.model}`}
                    className={styles.image}
                  />
                  <button
                    onClick={() => handleDeleteFavorite(favorite.id)}
                    className={styles.deleteButton}
                    aria-label="Remove from favorites"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.carTitle}>
                    {favorite.car.brand} {favorite.car.model}
                  </h3>
                  <p className={styles.carYear}>{favorite.car.year}</p>

                  <div className={styles.carDetails}>
                    <span className={styles.detail}>{favorite.car.fuelType}</span>
                    <span className={styles.detail}>{favorite.car.transmission}</span>
                    <span className={styles.detail}>{favorite.car.color}</span>
                  </div>

                  {editingFavoriteId === favorite.id ? (
                    <div className={styles.reviewForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
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
                                size={24}
                                fill={star <= editRating ? '#3b82f6' : 'none'}
                                color={star <= editRating ? '#3b82f6' : '#cbd5e1'}
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
                        <label className={styles.formLabel}>
                          Comment <span className={styles.optional}>Optional</span>
                        </label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows={3}
                          maxLength={1000}
                          className={styles.commentTextarea}
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button
                          onClick={handleCancelEdit}
                          disabled={reviewLoading}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveReview(favorite.id)}
                          disabled={reviewLoading}
                          className={styles.saveButton}
                        >
                          {reviewLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {hasReview(favorite) ? (
                        <div className={styles.reviewDisplay}>
                          <div className={styles.reviewTopRow}>
                            {favorite.rating > 0 && (
                              <div className={styles.ratingDisplay}>
                                <Star size={16} fill="#3b82f6" color="#3b82f6" />
                                <span className={styles.ratingValue}>{favorite.rating}/10</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleEditReview(favorite)}
                              className={styles.editButton}
                            >
                              <Edit2 size={14} />
                              Edit Review
                            </button>
                          </div>
                          {favorite.comment && (
                            <p className={styles.commentDisplay}>{favorite.comment}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditReview(favorite)}
                          className={styles.addReviewButton}
                        >
                          <Star size={14} />
                          Add Review
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleViewDetails(favorite.car.id)}
                    className={styles.viewDetailsButton}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}