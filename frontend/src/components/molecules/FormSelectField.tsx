import React from 'react';
import styles from './FormField.module.css';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  required?: boolean;
}

const FormSelectField: React.FC<FormSelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default FormSelectField;