import React from 'react';
import styles from './StatsBar.module.css';

interface Stat {
  label: string;
  value: string | number;
}

interface StatsBarProps {
  stats: Stat[];
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className={styles.statsBar}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <p className={styles.statLabel}>{stat.label}</p>
          <p className={styles.statValue}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;