import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader } from 'lucide-react';
import { authService } from '../services/api';
import { ROUTES } from '../constants';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      setLoading(true);
      setError('');
      await authService.login(credentials);
      if (onLogin) await onLogin();
      navigate(ROUTES.CARS);
    } catch (err) {
      setError(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <LogIn className={styles.icon} size={48} />
        </div>

        <h1 className={styles.title}>Log In</h1>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <>
                <Loader className={styles.buttonSpinner} size={20} />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}