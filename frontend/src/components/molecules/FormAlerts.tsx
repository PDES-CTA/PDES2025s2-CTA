import React from 'react';
import styles from './FormAlerts.module.css';

interface FormAlertsProps {
  successMessage?: string;
  errorMessage?: string;
}

const FormAlerts: React.FC<FormAlertsProps> = ({ successMessage, errorMessage }) => {
  if (!successMessage && !errorMessage) return null;

  return (
    <>
      {successMessage && (
        <div className={styles.successAlert}>
          <span>✓</span>
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorAlert}>
          <span>✕</span>
          <p>{errorMessage}</p>
        </div>
      )}
    </>
  );
};

export default FormAlerts;