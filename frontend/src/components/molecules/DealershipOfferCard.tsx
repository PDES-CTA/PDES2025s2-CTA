import { useState } from 'react';
import { Phone, Mail, MapPin, Building, ShoppingCart } from 'lucide-react';
import { CarOffer } from '../../types/carOffer';
import { Dealership } from '../../types/dealership';
import { formatPrice } from '../../utils/carUtils';
import { purchaseService, authService } from '../../services/api';
import Button from '../atoms/Button';
import PurchaseConfirmationModal from '../organisms/PurchaseConfirmationModal';
import styles from './DealershipOfferCard.module.css';

interface DealershipOfferCardProps {
  readonly offer?: CarOffer;
  readonly dealership?: Dealership;
  readonly onPurchaseSuccess?: () => void;
}

export default function DealershipOfferCard({ 
  offer, 
  dealership,
  onPurchaseSuccess 
}: DealershipOfferCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayDealership = dealership || offer?.dealership;
  const displayOffer = offer;

  const handlePurchaseClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async (paymentMethod: string, observations: string) => {
    if (!displayOffer) return;

    try {
      // Get current user to extract buyerId
      const currentUser = await authService.getLoggedUser();
      
      await purchaseService.createPurchase({
        buyerId: currentUser.id,
        carOfferId: displayOffer.id,
        finalPrice: displayOffer.price,
        // Don't send purchaseDate - let backend set it automatically
        purchaseStatus: 'PENDING',
        paymentMethod: paymentMethod as 'CASH' | 'CREDIT_CARD' | 'CHECK',
        observations: observations || undefined
      });
      
      setIsModalOpen(false);
      alert('Purchase completed successfully!');
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to complete purchase. Please try again.');
      throw error;
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (!displayOffer || !displayDealership) {
    return (
      <div className={`${styles.card} ${styles.noOffer}`}>
        <Building size={24} className={styles.icon} />
        <p className={styles.noOfferText}>There are currently no dealership offers for this vehicle.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.dealershipName}>
          <Building size={18} className={styles.icon} />
          {displayDealership.businessName}
        </h3>
        <p className={styles.price}>{formatPrice(displayOffer.price)}</p>

        {displayDealership.address && (
          <p className={styles.detail}>
            <MapPin size={16} className={styles.icon} />
            {displayDealership.address}
            {displayDealership.city && `, ${displayDealership.city}`}
            {displayDealership.province && `, ${displayDealership.province}`}
          </p>
        )}

        {displayDealership.phone && (
          <p className={styles.detail}>
            <Phone size={16} className={styles.icon} />
            <a href={`tel:${displayDealership.phone}`} className={styles.link}>
              {displayDealership.phone}
            </a>
          </p>
        )}

        {displayDealership.email && (
          <p className={styles.detail}>
            <Mail size={16} className={styles.icon} />
            <a href={`mailto:${displayDealership.email}`} className={styles.link}>
              {displayDealership.email}
            </a>
          </p>
        )}

        {displayOffer.dealershipNotes && (
          <p className={styles.notes}>{displayOffer.dealershipNotes}</p>
        )}

        <Button 
          variant="primary" 
          fullWidth 
          onClick={handlePurchaseClick}
          className={styles.purchaseButton}
        >
          <ShoppingCart size={18} />
          Purchase
        </Button>
      </div>

      {displayOffer && (
        <PurchaseConfirmationModal
          isOpen={isModalOpen}
          offer={displayOffer}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}