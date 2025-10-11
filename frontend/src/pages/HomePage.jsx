import { Link } from 'react-router-dom';
import { Search, LogIn } from 'lucide-react';
import { ROUTES } from '../constants';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Buy your brand new car
        </h1>
        <p className={styles.subtitle}>
          Find your new car at the best dealerships in Argentina. Transparent prices and updated inventory.
        </p>

        <div className={styles.actions}>
          <Link to={ROUTES.CARS}>
            <button className={styles.primaryButton}>
              <Search size={20} />
              View available cars
            </button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <button className={styles.secondaryButton}>
              <LogIn size={18} />
              Log In
            </button>
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>0km</div>
            <div className={styles.statLabel}>Brand new cars</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Verified</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>Registered</div>
            <div className={styles.statLabel}>Delivery included</div>
          </div>
        </div>
      </div>
    </div>
  );
}