import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, CreditCard, FileText, Building } from 'lucide-react';
import { purchaseService } from '../services/api';
import { LoadingSpinner, Button } from '../components/atoms';
import { ErrorMessage } from '../components/molecules';
import { formatPrice } from '../utils/carUtils';
import { PURCHASE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../constants';
import styles from './PurchasesPage.module.css';
import { Purchase } from '../types/purchase';

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!id) {
        setError('Buyer ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await purchaseService.getPurchasesByBuyerId(id);
        setPurchases(data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError('Failed to load purchases. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCancelPurchase = async (purchaseId: string | number) => {
    if (!window.confirm('Are you sure you want to cancel this purchase?')) {
      return;
    }

    try {
      await purchaseService.cancelPurchase(purchaseId);
      // Refresh purchases list
      if (id) {
        const data = await purchaseService.getPurchasesByBuyerId(id);
        setPurchases(data);
      }
      alert('Purchase cancelled successfully');
    } catch (err) {
      console.error('Error cancelling purchase:', err);
      alert('Failed to cancel purchase. Please try again.');
    }
  };

  // Helper to get car data from purchase (handles both carOffer and car)
  const getCarFromPurchase = (purchase: Purchase) => {
    return purchase.carOffer?.car || purchase.carOffer.car;
  };

  // Helper to get dealership from purchase
  const getDealershipFromPurchase = (purchase: Purchase) => {
    return purchase.carOffer?.dealership;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return styles.statusConfirmed;
      case 'PENDING':
        return styles.statusPending;
      case 'DELIVERED':
        return styles.statusDelivered;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <Package size={32} />
              My Purchases
            </h1>
            <p className={styles.subtitle}>
              {purchases.length === 0
                ? 'You haven\'t made any purchases yet'
                : `${purchases.length} purchase${purchases.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No purchases yet</h2>
            <p className={styles.emptyText}>
              When you purchase a car, it will appear here.
            </p>
            <Button variant="primary" onClick={handleGoBack}>
              Browse Available Cars
            </Button>
          </div>
        ) : (
          <div className={styles.purchasesList}>
            {purchases.map((purchase) => {
              const car = getCarFromPurchase(purchase);
              const dealership = getDealershipFromPurchase(purchase);
              
              if (!car) return null;

              return (
                <div key={purchase.id} className={styles.purchaseCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <h3 className={styles.carTitle}>
                        {car.brand} {car.model} ({car.year})
                      </h3>
                      <span className={`${styles.statusBadge} ${getStatusColor(purchase.purchaseStatus)}`}>
                        {PURCHASE_STATUS_LABELS[purchase.purchaseStatus as keyof typeof PURCHASE_STATUS_LABELS] || purchase.purchaseStatus}
                      </span>
                    </div>
                    {purchase.finalPrice && (
                      <div className={styles.price}>
                        {formatPrice(purchase.finalPrice)}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    {car.images && car.images.length > 0 && (
                      <div className={styles.carImage}>
                        <img
                          src={car.images[0]}
                          alt={`${car.brand} ${car.model}`}
                        />
                      </div>
                    )}

                    <div className={styles.purchaseDetails}>
                      {dealership && (
                        <div className={styles.detailItem}>
                          <Building size={16} className={styles.detailIcon} />
                          <span className={styles.detailLabel}>Dealership:</span>
                          <span className={styles.detailValue}>
                            {dealership.businessName}
                          </span>
                        </div>
                      )}

                      <div className={styles.detailItem}>
                        <Calendar size={16} className={styles.detailIcon} />
                        <span className={styles.detailLabel}>Purchase Date:</span>
                        <span className={styles.detailValue}>
                          {formatDate(purchase.purchaseDate)}
                        </span>
                      </div>

                      <div className={styles.detailItem}>
                        <CreditCard size={16} className={styles.detailIcon} />
                        <span className={styles.detailLabel}>Payment Method:</span>
                        <span className={styles.detailValue}>
                          {PAYMENT_METHOD_LABELS[purchase.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || purchase.paymentMethod}
                        </span>
                      </div>

                      {purchase.observations && (
                        <div className={styles.detailItem}>
                          <FileText size={16} className={styles.detailIcon} />
                          <span className={styles.detailLabel}>Observations:</span>
                          <span className={styles.detailValue}>
                            {purchase.observations}
                          </span>
                        </div>
                      )}

                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Color:</span>
                        <span className={styles.detailValue}>{car.color}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    {purchase.purchaseStatus === 'PENDING' || purchase.purchaseStatus === 'CONFIRMED' ? (
                      <Button
                        variant="danger"
                        onClick={() => handleCancelPurchase(purchase.id)}
                      >
                        Cancel Purchase
                      </Button>
                    ) : purchase.purchaseStatus === 'CANCELLED' ? (
                      <span className={styles.cancelledText}>This purchase has been cancelled</span>
                    ) : purchase.purchaseStatus == 'DELIVERED' ? (
                      <span className={styles.cancelledText}>This purchase has been delivered. Enjoy your purchase!</span>
                    ) : null
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}