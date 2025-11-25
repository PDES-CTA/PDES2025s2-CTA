import { useState } from 'react';
import { X } from 'lucide-react';
import { CarOffer } from '../../types/carOffer';
import { formatPrice } from '../../utils/carUtils';
import Button from '../atoms/Button';
import styles from './PurchaseConfirmationModal.module.css';

interface PurchaseConfirmationModalProps {
  readonly isOpen: boolean;
  readonly offer: CarOffer;
  readonly onConfirm: (paymentMethod: string, observations: string) => Promise<void>;
  readonly onCancel: () => void;
}

export default function PurchaseConfirmationModal({
  isOpen,
  offer,
  onConfirm,
  onCancel
}: PurchaseConfirmationModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm(paymentMethod, observations);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setPaymentMethod('CASH');
    setObservations('');
    onCancel();
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Purchase</h2>
          <button className={styles.closeButton} onClick={handleCancel} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.question}>Are you sure you want to buy this car?</p>
          
          <div className={styles.details}>
            <h3 className={styles.sectionTitle}>Purchase Details</h3>
            
            <div className={styles.detailRow}>
              <span className={styles.label}>Vehicle:</span>
              <span className={styles.value}>
                {offer.car.brand} {offer.car.model} ({offer.car.year})
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Dealership:</span>
              <span className={styles.value}>{offer.dealership.businessName}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Price:</span>
              <span className={`${styles.value} ${styles.price}`}>
                {formatPrice(offer.price)}
              </span>
            </div>
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Payment Method:
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CHECK">Check</option>
              </select>
            </label>

            <label className={styles.formLabel}>
              Observations (optional):
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Add any notes or special requests..."
                className={styles.textarea}
                rows={3}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </div>
      </div>
    </div>
  );
}