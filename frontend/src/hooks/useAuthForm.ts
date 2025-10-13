import { useState, FormEvent } from 'react';

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
      setError(err instanceof Error ? err.message : 'An error occurred');
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