import { useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import styles from './Header.module.css';
import { ROUTES } from '../../constants';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authorization_token');
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole === 'ADMINISTRATOR';
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('authorization_token');
    localStorage.removeItem('user_role');
    navigate(ROUTES.HOME);
  };

  const handleAdminAccess = () => {
    navigate(ROUTES.ADMIN);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Compra Tu Auto</h1>
          <div className={styles.headerActions}>
            {isAdmin && isLoggedIn && (
              <button
                onClick={handleAdminAccess}
                className={styles.adminButton}
                title="Access admin panel"
              >
                <Shield size={18} />
                <span>Admin Access</span>
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;