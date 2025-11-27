import React from 'react';
import styles from './PaginationInfo.module.css';

interface PaginationInfoProps {
  showing: number;
  total: number;
  label?: string;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  showing,
  total,
  label = 'items',
}) => {
  return (
    <div className={styles.pagination}>
      <p>
        Showing {showing} of {total} {label}
      </p>
    </div>
  );
};

export default PaginationInfo;