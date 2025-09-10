import styles from '../styles/Badge.module.css';

export default function Badge({ 
  text, 
  variant = 'neutral', 
  className = '' 
}) {
  const classes = [
    styles.badge,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {text}
    </span>
  );
}