import { InputHTMLAttributes, ChangeEvent } from 'react';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  readonly label?: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly className?: string;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${className}`}
        {...props}
      />
    </div>
  );
}