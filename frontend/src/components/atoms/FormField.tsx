import { InputHTMLAttributes } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly id: string;
}

export default function FormField({ label, id, ...props }: FormFieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        className={styles.input}
        {...props}
      />
    </div>
  );
}