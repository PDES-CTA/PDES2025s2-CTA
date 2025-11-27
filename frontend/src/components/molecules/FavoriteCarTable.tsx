import React from 'react';
import styles from './FavoriteCarTable.module.css';

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

interface FavoriteCarTableProps {
  favorites: FavoriteCar[];
}

const FavoriteCarTable: React.FC<FavoriteCarTableProps> = ({ favorites }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number | null) => {
    if (!rating || rating <= 0) return '—';
    const fullStars = Math.min(Math.max(Math.round(rating), 0), 5);
    const emptyStars = Math.max(5 - fullStars, 0);
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Car</th>
            <th>User</th>
            <th>Rating</th>
            <th>Review Status</th>
            <th>Date Added</th>
          </tr>
        </thead>
        <tbody>
          {favorites.map((fav) => (
            <tr key={fav.id}>
              <td>
                <strong>{fav.carName}</strong>
              </td>
              <td>{fav.buyerName}</td>
              <td>
                <span className={styles.rating}>
                  {renderStars(fav.rating)}
                </span>
              </td>
              <td>
                <span className={`${styles.status} ${fav.isReviewed ? styles.reviewed : styles.notreviewed}`}>
                  {fav.isReviewed ? 'Reviewed' : 'No Review'}
                </span>
              </td>
              <td>{formatDate(fav.dateAdded)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FavoriteCarTable;