import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader } from 'lucide-react';
import { authService } from '../services/api';
import { ROUTES } from '../constants';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Match the API field names
    const userData = {
      email: formData.get('email'),
      password: password,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      dni: formData.get('dni'),
      address: formData.get('address'),
    };

    try {
      setLoading(true);
      setError('');
      await authService.register(userData);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <UserPlus className={styles.icon} size={48} />
        </div>

        <h1 className={styles.title}>Create Account</h1>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name</label>
              <input
                name="firstName"
                type="text"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                name="lastName"
                type="text"
                className={styles.input}
                required
              />
            </div>
          </div>

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

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>ID Number</label>
              <input
                name="dni"
                type="text"
                pattern="\d{7,8}"
                placeholder="12345678"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input
                name="phone"
                type="tel"
                placeholder="1123456789"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Address</label>
            <input
              name="address"
              type="text"
              placeholder="Street 123"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                minLength="8"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                minLength="8"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <>
                <Loader className={styles.buttonSpinner} size={20} />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}