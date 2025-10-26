import { Link } from 'react-router-dom';
import { LogIn, Users } from 'lucide-react';
import { ROUTES } from '../constants';
import styles from './DealershipHomePage.module.css';

export default function DealershipHomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Manage Your Dealership
        </h1>
        <p className={styles.subtitle}>
          Streamline your sales process with our comprehensive platform. List vehicles, track inventory, and connect with buyers across Argentina.
        </p>

        <div className={styles.actions}>
          <Link to={ROUTES.LOGIN}>
            <button className={styles.secondaryButton}>
              <LogIn size={18} />
              Log Into A Dealership
            </button>
          </Link>
        </div>

        <p className={styles.subtitle}>
          Are you looking to buy a car? Visit our customer platform.
        </p>
        <div className={styles.actions}>
          <Link to={ROUTES.HOME}>
            <button className={styles.redirectButton}>
              <Users size={18} />
              Shop For Cars
            </button>
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>Real-time</div>
            <div className={styles.statLabel}>Inventory Updates</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Platform Access</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>Verified</div>
            <div className={styles.statLabel}>Buyer Network</div>
          </div>
        </div>
      </div>
    </div>
  );
}