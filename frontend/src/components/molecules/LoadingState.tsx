import React from 'react';
import { Loader } from 'lucide-react';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className={styles.container}>
      <Loader className={styles.spinner} />
      <p>{message}</p>
    </div>
  );
};

export default LoadingState;