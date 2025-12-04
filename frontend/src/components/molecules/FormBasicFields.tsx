import React from 'react';
import FormTextField from './FormTextField';
import FormSelectField from './FormSelectField';
import styles from './FormSection.module.css';

interface FormErrors {
  [key: string]: string;
}

interface FormBasicFieldsProps {
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: string;
  transmission: string;
  errors: FormErrors;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onFuelTypeChange: (value: string) => void;
  onTransmissionChange: (value: string) => void;
}

const getCurrentYear = () => new Date().getFullYear();
const getYearOptions = () => {
  const years = [];
  for (let i = 0; i < 50; i++) {
    years.push(getCurrentYear() - i);
  }
  return years;
};

const YEAR_OPTIONS = getYearOptions();

const FUEL_TYPE_OPTIONS = [
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'GNC', label: 'GNC' },
];

const TRANSMISSION_OPTIONS = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-automatic' },
];

const FormBasicFields: React.FC<FormBasicFieldsProps> = ({
  brand,
  model,
  year,
  color,
  fuelType,
  transmission,
  errors,
  onBrandChange,
  onModelChange,
  onYearChange,
  onColorChange,
  onFuelTypeChange,
  onTransmissionChange,
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.grid}>
        <FormTextField
          id="brand"
          label="Brand"
          value={brand}
          onChange={onBrandChange}
          placeholder="e.g., Toyota, BMW, Ford"
          error={errors.brand}
          required
        />
        <FormTextField
          id="model"
          label="Model"
          value={model}
          onChange={onModelChange}
          placeholder="e.g., Camry, 3 Series, Mustang"
          error={errors.model}
          required
        />
        <FormSelectField
          id="year"
          label="Year"
          value={year}
          onChange={onYearChange}
          options={YEAR_OPTIONS.map(y => ({ value: y, label: y.toString() }))}
          error={errors.year}
          required
        />
        <FormTextField
          id="color"
          label="Color"
          value={color}
          onChange={onColorChange}
          placeholder="e.g., Red, Blue, Black"
          error={errors.color}
          required
        />
        <FormSelectField
          id="fuelType"
          label="Fuel Type"
          value={fuelType}
          onChange={onFuelTypeChange}
          options={FUEL_TYPE_OPTIONS}
          required
        />
        <FormSelectField
          id="transmission"
          label="Transmission"
          value={transmission}
          onChange={onTransmissionChange}
          options={TRANSMISSION_OPTIONS}
          required
        />
      </div>
    </div>
  );
};

export default FormBasicFields;