import { Link } from 'react-router-dom';
import { Search, LogIn } from 'lucide-react';
import { ROUTES } from '../constants';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Comprá tu auto 0km
        </h1>
        
        <p className={styles.subtitle}>
          Encontrá tu auto nuevo en las mejores concesionarias de Argentina. Precios transparentes y stock actualizado.
        </p>
        
        <div className={styles.actions}>
          <Link to={ROUTES.CARS}>
            <button className={styles.primaryButton}>
              <Search size={20} />
              Ver autos disponibles
            </button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <button className={styles.secondaryButton}>
              <LogIn size={18} />
              Ingresar
            </button>
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>0km</div>
            <div className={styles.statLabel}>Autos nuevos</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Verificados</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>Patentados</div>
            <div className={styles.statLabel}>Entrega incluida</div>
          </div>
        </div>
      </div>
    </div>
  );
}