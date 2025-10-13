import { SelectHTMLAttributes, ChangeEvent } from 'react';
import styles from './Select.module.css';

interface SelectOption {
  readonly value: string | number;
  readonly label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  readonly label?: string;
  readonly value?: string | number;
  readonly onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  readonly options?: readonly SelectOption[];
  readonly className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options = [],
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={styles.selectGroup}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`${styles.select} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}