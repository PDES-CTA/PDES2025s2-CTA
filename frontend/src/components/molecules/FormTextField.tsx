import React from 'react';
import styles from './FormField.module.css';

interface FormTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email' | 'number';
  error?: string;
  required?: boolean;
}

const FormTextField: React.FC<FormTextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  required,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default FormTextField;