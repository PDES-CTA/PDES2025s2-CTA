import React from 'react';
import styles from './ReviewTable.module.css';

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

interface ReviewTableProps {
  reviews: Review[];
}

const ReviewTable: React.FC<ReviewTableProps> = ({ reviews }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number | null) => {
    if (!rating || rating <= 0) return '—';
    const fullStars = Math.min(Math.max(Math.round(rating), 0), 5);
    const emptyStars = Math.max(5 - fullStars, 0);
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  const truncateComment = (comment: string | null, maxLength: number = 80) => {
    if (!comment) return '—';
    return comment.length > maxLength ? comment.substring(0, maxLength) + '...' : comment;
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Car</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} title={review.comment || ''}>
              <td>
                <strong>{review.carName}</strong>
              </td>
              <td>{review.buyerName}</td>
              <td>
                <span className={styles.rating}>
                  {renderStars(review.rating)}
                </span>
              </td>
              <td className={styles.comment}>
                {truncateComment(review.comment)}
              </td>
              <td>{formatDate(review.dateAdded)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewTable;