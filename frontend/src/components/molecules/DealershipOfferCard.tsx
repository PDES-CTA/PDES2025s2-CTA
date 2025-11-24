import { Phone, Mail, MapPin, Building } from 'lucide-react';
import { CarOffer } from '../../types/carOffer';
import { Dealership } from '../../types/dealership';
import { formatPrice } from '../../utils/carUtils';
import styles from './DealershipOfferCard.module.css';

interface DealershipOfferCardProps {
  readonly offer?: CarOffer;
  readonly dealership?: Dealership;
}

export default function DealershipOfferCard({ offer, dealership }: DealershipOfferCardProps) {

  const displayDealership = dealership || offer?.dealership;
  const displayOffer = offer;

  if (!displayOffer || !displayDealership) {
    return (
      <div className={`${styles.card} ${styles.noOffer}`}>
        <Building size={24} className={styles.icon} />
        <p className={styles.noOfferText}>There are currently no dealership offers for this vehicle.</p>
      </div>
    );
  }

  return (
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
    </div>
  );
}