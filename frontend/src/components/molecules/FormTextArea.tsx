import React from 'react';
import styles from './FormField.module.css';

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  rows = 5,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {maxLength && (
          <span className={styles.characterCount}>
            {value.length}/{maxLength}
          </span>
        )}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default FormTextarea;