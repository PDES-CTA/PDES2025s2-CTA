// components/organisms/CarOfferList.tsx
import { CarOffer } from '../../types/carOffer';
import CarOfferCard from '../molecules/CarOfferCard';
import styles from './CarOfferList.module.css';

interface CarOfferListProps {
  offers: CarOffer[];
  onEdit?: (offerId: string | number) => void;
  onDelete?: (offerId: string | number) => void;
}

export default function CarOfferList({ 
  offers,
  onEdit, 
  onDelete 
}: CarOfferListProps) {
  if (offers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No car offers available yet.</p>
        <p>Start by adding your first car offer!</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {offers.map((offer) => (
        <CarOfferCard
          key={offer.id}
          offer={offer}
          onEdit={onEdit ? () => onEdit(offer.id) : undefined}
          onDelete={onDelete ? () => onDelete(offer.id) : undefined}
        />
      ))}
    </div>
  );
}