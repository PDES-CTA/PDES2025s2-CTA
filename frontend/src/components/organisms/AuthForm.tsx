import { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader, LucideIcon } from 'lucide-react';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  readonly title: string;
  readonly icon: LucideIcon;
  readonly error: string;
  readonly loading: boolean;
  readonly onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  readonly submitButtonText: string;
  readonly loadingText: string;
  readonly footerText: string;
  readonly footerLinkText: string;
  readonly footerLinkTo: string;
  readonly children: ReactNode;
}

export default function AuthForm({
  title,
  icon: Icon,
  error,
  loading,
  onSubmit,
  submitButtonText,
  loadingText,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}: AuthFormProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <Icon className={styles.icon} size={48} />
        </div>

        <h1 className={styles.title}>{title}</h1>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          {children}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <>
                <Loader className={styles.buttonSpinner} size={20} />
                {loadingText}
              </>
            ) : (
              submitButtonText
            )}
          </button>
        </form>

        <p className={styles.footer}>
          {footerText}{' '}
          <Link to={footerLinkTo} className={styles.link}>
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}