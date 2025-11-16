import { useState, FormEvent } from 'react';
import { AxiosError } from 'axios';

export const useAuthForm = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getStringValue = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
  };

  const handleFormSubmit = async (
    e: FormEvent<HTMLFormElement>,
    onSubmit: (formData: FormData) => Promise<void>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setLoading(true);
      setError('');
      await onSubmit(formData);
    } catch (err) {
      if (err instanceof AxiosError) {
        // Try to get the error message from the response data
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error ||
                            err.message ||
                            'An error occurred';
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    setError,
    getStringValue,
    handleFormSubmit,
  };
};