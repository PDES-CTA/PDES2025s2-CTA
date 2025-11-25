import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Calendar, CreditCard, FileText, User } from 'lucide-react';
import { purchaseService, authService } from '../services/api';
import { LoadingSpinner, Button } from '../components/atoms';
import { ErrorMessage } from '../components/molecules';
import { formatPrice } from '../utils/carUtils';
import { PURCHASE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../constants';
import styles from './DealershipSalesPage.module.css';
import { Purchase } from '../types/purchase';

export default function DealershipSalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current user to extract dealership ID
        const user = await authService.getLoggedUser();
        const data = await purchaseService.getPurchasesByDealershipId(user.id);
        setSales(data);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to load sales. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleConfirmPurchase = async (purchaseId: number) => {
    if (!window.confirm('Are you sure you want to confirm this purchase?')) {
      return;
    }

    try {
      await purchaseService.confirmPurchase(purchaseId);
      // Refresh sales list
      const user = await authService.getLoggedUser();
      const data = await purchaseService.getPurchasesByDealershipId(user.id);
      setSales(data);
      alert('Purchase confirmed successfully!');
    } catch (err) {
      console.error('Error confirming purchase:', err);
      alert('Failed to confirm purchase. Please try again.');
    }
  };

  const handleMarkAsDelivered = async (purchaseId: number) => {
    if (!window.confirm('Are you sure you want to mark this purchase as delivered?')) {
      return;
    }

    try {
      await purchaseService.markPurchaseAsDelivered(purchaseId);
      // Refresh sales list
      const user = await authService.getLoggedUser();
      const data = await purchaseService.getPurchasesByDealershipId(user.id);
      setSales(data);
      alert('Purchase marked as delivered!');
    } catch (err) {
      console.error('Error marking as delivered:', err);
      alert('Failed to mark as delivered. Please try again.');
    }
  };

  const handleCancelPurchase = async (purchaseId: number) => {
    if (!window.confirm('Are you sure you want to cancel this purchase?')) {
      return;
    }

    try {
      await purchaseService.cancelPurchase(purchaseId);
      // Refresh sales list
      const user = await authService.getLoggedUser();
      const data = await purchaseService.getPurchasesByDealershipId(user.id);
      setSales(data);
      alert('Purchase cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling purchase:', err);
      alert('Failed to cancel purchase. Please try again.');
    }
  };

  // Helper to get car data from purchase
  const getCarFromPurchase = (purchase: Purchase) => {
    return purchase.carOffer.car;
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

  // Calculate total revenue
  const totalRevenue = sales
    .filter(sale => sale.purchaseStatus === 'CONFIRMED' || sale.purchaseStatus === 'DELIVERED')
    .reduce((sum, sale) => sum + sale.finalPrice, 0);

  const deliveredSales = sales.filter(
    sale => sale.purchaseStatus === 'DELIVERED'
  ).length;

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
              <ShoppingBag size={32} />
              Sales Overview
            </h1>
            <p className={styles.subtitle}>
              {sales.length === 0
                ? 'No sales to display'
                : `${sales.length} total sale${sales.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {sales.length > 0 && (
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Potential Sales</div>
                <div className={styles.statValue}>{sales.length}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Delivered</div>
                <div className={styles.statValue}>{deliveredSales}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Revenue</div>
                <div className={styles.statValue}>{formatPrice(totalRevenue)}</div>
              </div>
            </div>
          )}
        </div>

        {sales.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No sales yet</h2>
            <p className={styles.emptyText}>
              When customers purchase your car offers, they will appear here.
            </p>
            <Button variant="primary" onClick={handleGoBack}>
              Back to Offers
            </Button>
          </div>
        ) : (
          <div className={styles.salesList}>
            {sales.map((sale) => {
              const car = getCarFromPurchase(sale);

              return (
                <div key={sale.id} className={styles.saleCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <h3 className={styles.carTitle}>
                        {car.brand} {car.model} ({car.year})
                      </h3>
                      <span className={`${styles.statusBadge} ${getStatusColor(sale.purchaseStatus)}`}>
                        {PURCHASE_STATUS_LABELS[sale.purchaseStatus as keyof typeof PURCHASE_STATUS_LABELS] || sale.purchaseStatus}
                      </span>
                    </div>
                    <div className={styles.price}>
                      {formatPrice(sale.finalPrice)}
                    </div>
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

                    <div className={styles.saleDetails}>
                      <div className={styles.detailItem}>
                        <User size={16} className={styles.detailIcon} />
                        <span className={styles.detailLabel}>Buyer:</span>
                        <span className={styles.detailValue}>
                          {sale.buyer.email}
                        </span>
                      </div>

                      {sale.buyer.email && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Email:</span>
                          <span className={styles.detailValue}>
                            <a href={`mailto:${sale.buyer.email}`} className={styles.link}>
                              {sale.buyer.email}
                            </a>
                          </span>
                        </div>
                      )}

                      {sale.buyer.phone && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Phone:</span>
                          <span className={styles.detailValue}>
                            <a href={`tel:${sale.buyer.phone}`} className={styles.link}>
                              {sale.buyer.phone}
                            </a>
                          </span>
                        </div>
                      )}

                      <div className={styles.detailItem}>
                        <Calendar size={16} className={styles.detailIcon} />
                        <span className={styles.detailLabel}>Sale Date:</span>
                        <span className={styles.detailValue}>
                          {formatDate(sale.purchaseDate)}
                        </span>
                      </div>

                      <div className={styles.detailItem}>
                        <CreditCard size={16} className={styles.detailIcon} />
                        <span className={styles.detailLabel}>Payment Method:</span>
                        <span className={styles.detailValue}>
                          {PAYMENT_METHOD_LABELS[sale.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || sale.paymentMethod}
                        </span>
                      </div>

                      {sale.observations && (
                        <div className={styles.detailItem}>
                          <FileText size={16} className={styles.detailIcon} />
                          <span className={styles.detailLabel}>Notes:</span>
                          <span className={styles.detailValue}>
                            {sale.observations}
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
                    <div className={styles.footerActions}>
                      {sale.purchaseStatus === 'PENDING' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmPurchase(sale.id)}
                            className={styles.actionButton}
                          >
                            Confirm Purchase
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelPurchase(sale.id)}
                            className={styles.actionButton}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {sale.purchaseStatus === 'CONFIRMED' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkAsDelivered(sale.id)}
                            className={styles.actionButton}
                          >
                            Mark as Delivered
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelPurchase(sale.id)}
                            className={styles.actionButton}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
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