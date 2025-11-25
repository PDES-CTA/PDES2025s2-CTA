import React from 'react';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  title: string;
  value: string | number;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, description }) => {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p className={styles.bigNumber}>{value}</p>
      <span className={styles.label}>{description}</span>
    </div>
  );
};

export default InfoCard;