import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { authService, carOfferService } from '../services/api';
import CarOfferList from '../components/organisms/CarOfferList';
import { ErrorMessage } from '../components/molecules';
import { LoadingSpinner } from '../components/atoms';
import { CarOffer } from '../types/carOffer';
import styles from './CarsPage.module.css';

export default function DealershipInventoryPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<CarOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealershipOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.getLoggedUser();
      if (!user || !user.id) {
        throw new Error('No dealership found for current user');
      }
      
      const offers = await carOfferService.getByDealershipId(user.id);
      setOffers(offers);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
      ? err.message 
      : 'Failed to load car details.';
      setError(errorMessage || 'Failed to load car offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealershipOffers();
  }, []);

  const handleViewDetails = (offerId: string | number) => {
    navigate(`/dealership/offers/${offerId}`);
  };

  const handleEdit = (offerId: string | number) => {
    navigate(`/dealership/offers/${offerId}/edit`);
  };

  const handleDelete = async (offerId: string | number) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await carOfferService.deleteCarOffer(offerId);
        await fetchDealershipOffers();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load car details.';
        setError(errorMessage || 'Failed to delete offer');
      }
    }
  };

  const handleAddNewOffer = () => {
    navigate('/dealership/offers/new');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/dealership/login');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={fetchDealershipOffers} />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Your Car Offers</h1>
            <p className={styles.subtitle}>Manage your dealership's available car offers</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={handleAddNewOffer} className={styles.addButton}>
              <Plus size={20} />
              Add New Offer
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>

        <CarOfferList 
          offers={offers} 
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}