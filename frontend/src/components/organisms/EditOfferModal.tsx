import { useState } from 'react';
import { X } from 'lucide-react';
import { CarOffer } from '../../types/carOffer';
import FormField from '../atoms/FormField';
import SmallButton from '../atoms/SmallButton';
import styles from './EditOfferModal.module.css';
import React from 'react';

interface EditOfferModalProps {
  readonly offer: CarOffer;
  readonly onClose: () => void;
  readonly onSubmit: (offerData: {
    price: number;
    available: boolean;
    dealershipNotes?: string;
  }) => void;
}

export default function EditOfferModal({ offer, onClose, onSubmit }: EditOfferModalProps) {
  const { car } = offer;
  const [formData, setFormData] = useState({
    price: offer.price.toString(),
    available: offer.available,
    dealershipNotes: offer.dealershipNotes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      price: parseFloat(formData.price),
      available: formData.available,
      dealershipNotes: formData.dealershipNotes || undefined,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Edit Offer</h2>
            <p className={styles.subtitle}>
              {car.brand} {car.model} ({car.year})
            </p>
          </div>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.carInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Brand:</span>
              <span className={styles.infoValue}>{car.brand}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Model:</span>
              <span className={styles.infoValue}>{car.model}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Year:</span>
              <span className={styles.infoValue}>{car.year}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Color:</span>
              <span className={styles.infoValue}>{car.color}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Transmission:</span>
              <span className={styles.infoValue}>{car.transmission}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Fuel Type:</span>
              <span className={styles.infoValue}>{car.fuelType}</span>
            </div>
          </div>

          <div className={styles.formFields}>
            <FormField
              label="Offer Price"
              id="price"
              name="price"
              type="number"
              placeholder="Enter your offer price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              min="0"
              step="0.01"
              required
            />

            <div className={styles.checkboxField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>Mark as available</span>
              </label>
            </div>

            <div className={styles.textareaField}>
              <label htmlFor="dealershipNotes" className={styles.label}>
                Dealership Notes (Optional)
              </label>
              <textarea
                id="dealershipNotes"
                name="dealershipNotes"
                value={formData.dealershipNotes}
                onChange={(e) => setFormData({ ...formData, dealershipNotes: e.target.value })}
                placeholder="Add any notes about this offer..."
                rows={4}
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <SmallButton type="button" onClick={onClose} variant="secondary">
              Cancel
            </SmallButton>
            <SmallButton type="submit" variant="primary">
              Update Offer
            </SmallButton>
          </div>
        </form>
      </div>
    </div>
  );
}