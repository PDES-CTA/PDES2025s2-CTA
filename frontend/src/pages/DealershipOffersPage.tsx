import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, ShoppingBag } from 'lucide-react';
import { authService, carOfferService, dealershipService } from '../services/api';
import CarOfferList from '../components/organisms/CarOfferList';
import EditOfferModal from '../components/organisms/EditOfferModal';
import { ErrorMessage } from '../components/molecules';
import { LoadingSpinner } from '../components/atoms';
import SmallButton from '../components/atoms/SmallButton';
import { CarOffer } from '../types/carOffer';
import styles from './DealershipOffersPage.module.css';
import { ROUTES } from '../constants';

interface Dealership {
  id: number;
  businessName: string;
  description?: string;
}

export default function DealershipOffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<CarOffer[]>([]);
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<CarOffer | null>(null);

  const fetchDealershipData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.getLoggedUser();
      if (!user?.id) {
        throw new Error('No dealership found for current user');
      }

      const [dealershipData, offersData] = await Promise.all([
        dealershipService.getDealershipById(user.id),
        carOfferService.getAvailableByDealershipId(user.id)
      ]);

      setDealership(dealershipData);
      setOffers(offersData);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load dealership data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetchOffers = async () => {
    if (!dealership?.id) return;
    
    try {
      const offersData = await carOfferService.getAvailableByDealershipId(dealership.id);
      setOffers(offersData);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load car offers';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchDealershipData();
  }, []);

  const handleEdit = (offerId: string | number) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setEditingOffer(offer);
    }
  };

  const handleUpdateOffer = async (offerData: {
    price: number;
    available: boolean;
    dealershipNotes?: string;
  }) => {
    if (!editingOffer) return;

    try {
      await carOfferService.updateCarOffer(editingOffer.id, {
        price: offerData.price,
        dealershipNotes: offerData.dealershipNotes || null,
      });
      
      setEditingOffer(null);
      // Refetch to get updated data
      await refetchOffers();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update offer';
      setError(errorMessage);
    }
  };

  const handleDelete = async (offerId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return;
    }

    try {
      await carOfferService.markAsUnavailable(offerId);
      setOffers(prevOffers => prevOffers.filter(offer => offer.id !== offerId));
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to mark offer as unavailable';
      setError(errorMessage);
      await refetchOffers();
    }
  };

  const handleAddNewOffer = () => {
    navigate('/cars/pool');
  };

  const handleViewPurchases = () => {
    navigate(ROUTES.DEALERSHIP_SALES);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <ErrorMessage error={error} onRetry={fetchDealershipData} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.dealershipInfo}>
            <div className={styles.dealershipText}>
              <h1 className={styles.dealershipName}>{dealership?.businessName || 'Your Dealership'}</h1>
              {dealership?.description && (
                <p className={styles.dealershipDescription}>{dealership.description}</p>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <SmallButton onClick={handleViewPurchases} variant="secondary">
              <ShoppingBag size={18} />
              Sales
            </SmallButton>
            <SmallButton onClick={handleAddNewOffer} variant="primary">
              <Plus size={18} />
              Add New Offer
            </SmallButton>
          </div>
        </div>

        {offers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <Building2 className={styles.emptyStateIcon} size={64} />
              <h2 className={styles.emptyStateTitle}>No Car Offers Yet</h2>
              <p className={styles.emptyStateText}>
                Start building your inventory by creating your first car offer.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.contentHeader}>
              <h2 className={styles.contentTitle}>Your Inventory</h2>
              <p className={styles.contentSubtitle}>
                Managing {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
              </p>
            </div>
            <CarOfferList 
              offers={offers} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {editingOffer && (
          <EditOfferModal
            offer={editingOffer}
            onClose={() => setEditingOffer(null)}
            onSubmit={handleUpdateOffer}
          />
        )}
      </div>
    </div>
  );
}