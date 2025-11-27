import { useState, useEffect } from 'react';
import styles from './AdminFavoriteCarsSection.module.css';
import {
  FavoriteCarTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
} from '../molecules';
import { adminService } from '../../services/api';

interface FavoriteCar {
  id: number;
  buyerId: number;
  buyerName: string;
  carId: number;
  carName: string;
  rating: number | null;
  comment: string | null;
  dateAdded: string;
  isReviewed: boolean;
}

const AdminFavoriteCarsSection = () => {
  const [favorites, setFavorites] = useState<FavoriteCar[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteCar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReviewed, setFilterReviewed] = useState<'all' | 'reviewed' | 'notreviewed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    let filtered = favorites.filter(
      (fav) =>
        fav.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterReviewed === 'reviewed') {
      filtered = filtered.filter((fav) => fav.isReviewed);
    } else if (filterReviewed === 'notreviewed') {
      filtered = filtered.filter((fav) => !fav.isReviewed);
    }

    setFilteredFavorites(filtered);
  }, [searchTerm, filterReviewed, favorites]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllFavoritesWithReviews();
      setFavorites(response);
      setFilteredFavorites(response);
      setError(null);
    } catch (err) {
      setError('Failed to load favorite cars');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading favorite cars..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchFavorites} retryLabel="Retry" />;
  }

  return (
    <div className={styles.section}>
      <SectionHeader
        title="Favorite Cars"
        subtitle="Track user favorite cars and reviews"
      />

      <div className={styles.content}>
        <SearchBar
          placeholder="Search by car name or user..."
          value={searchTerm}
          onChange={setSearchTerm}
          resultCount={filteredFavorites.length}
        />

        <div className={styles.filterTabs}>
          <button
            className={`${styles.tab} ${filterReviewed === 'all' ? styles.active : ''}`}
            onClick={() => setFilterReviewed('all')}
          >
            All ({favorites.length})
          </button>
          <button
            className={`${styles.tab} ${filterReviewed === 'reviewed' ? styles.active : ''}`}
            onClick={() => setFilterReviewed('reviewed')}
          >
            With Reviews ({favorites.filter((f) => f.isReviewed).length})
          </button>
          <button
            className={`${styles.tab} ${filterReviewed === 'notreviewed' ? styles.active : ''}`}
            onClick={() => setFilterReviewed('notreviewed')}
          >
            No Reviews ({favorites.filter((f) => !f.isReviewed).length})
          </button>
        </div>

        {favorites.length === 0 ? (
          <EmptyState message="No favorite cars found" />
        ) : (
          <>
            <FavoriteCarTable favorites={filteredFavorites} />
            <div className={styles.pagination}>
              <p>Showing {filteredFavorites.length} of {favorites.length} favorites</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFavoriteCarsSection;