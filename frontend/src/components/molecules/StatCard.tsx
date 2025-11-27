import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  return (
    <div className={styles.card} style={{ borderTopColor: color }}>
      <div className={styles.iconContainer} style={{ backgroundColor: `${color}15` }}>
        <div style={{ color: color }}>
          {icon}
        </div>
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;