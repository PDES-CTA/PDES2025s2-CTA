import { useState } from 'react';
import { carService } from '../../services/api';
import { Car } from '../../types/car';
import { FormBasicFields, FormTextArea, ImageInput, FormAlerts } from '../molecules';
import styles from './AdminCreateCarSection.module.css';

interface FormErrors {
  [key: string]: string;
}

const INITIAL_CAR_FORM: Partial<Car> = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  fuelType: 'GASOLINE' as any,
  transmission: 'MANUAL',
  description: '',
  images: [],
};

const AdminCreateCarSection = () => {
  const [formData, setFormData] = useState<Partial<Car>>(INITIAL_CAR_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.brand?.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.year || formData.year < 1900) {
      newErrors.year = 'Year must be 1900 or later';
    }
    if (formData.year && formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Year cannot be more than 1 year in the future';
    }
    if (!formData.color?.trim()) {
      newErrors.color = 'Color is required';
    }
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof Partial<Car>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field as string]: '',
      }));
    }
  };

  const handleAddImage = (url: string) => {
    const updatedImages = [...(formData.images || []), url];
    setFormData(prev => ({
      ...prev,
      images: updatedImages,
    }));

    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: '',
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.images?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({
      ...prev,
      images: updatedImages,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await carService.createCar(formData);
      setSuccessMessage('Car created successfully!');

      // Reset form
      setFormData(INITIAL_CAR_FORM);
      setErrors({});

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error creating car:', error);
      setErrorMessage('Failed to create car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Car</h1>
        <p className={styles.subtitle}>Add a new vehicle to the inventory</p>
      </div>

      <FormAlerts successMessage={successMessage} errorMessage={errorMessage} />

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <FormBasicFields
          brand={formData.brand || ''}
          model={formData.model || ''}
          year={formData.year || new Date().getFullYear()}
          color={formData.color || ''}
          fuelType={formData.fuelType || 'GASOLINE'}
          transmission={formData.transmission || 'MANUAL'}
          errors={errors}
          onBrandChange={value => handleFieldChange('brand', value)}
          onModelChange={value => handleFieldChange('model', value)}
          onYearChange={value => handleFieldChange('year', parseInt(value))}
          onColorChange={value => handleFieldChange('color', value)}
          onFuelTypeChange={value => handleFieldChange('fuelType', value)}
          onTransmissionChange={value => handleFieldChange('transmission', value)}
        />

        {/* Description */}
        <FormTextArea
          id="description"
          label="Description"
          value={formData.description || ''}
          onChange={value => handleFieldChange('description', value)}
          placeholder="Add details about the vehicle condition, features, etc."
          error={errors.description}
          maxLength={1000}
        />

        {/* Images */}
        <ImageInput
          images={formData.images || []}
          onAddImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
          error={errors.images}
        />

        {/* Submit Button */}
        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Creating...
              </>
            ) : (
              'Create Car'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCarSection;