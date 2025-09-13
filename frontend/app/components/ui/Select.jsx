import styles from '../styles/Select.module.css';

export default function Select({ 
  label, 
  value, 
  onChange, 
  options = [], 
  className = '',
  ...props 
}) {
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
