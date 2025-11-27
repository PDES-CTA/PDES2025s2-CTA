import { useState, useEffect } from 'react';
import { TrendingUp, Car, Users, Building2 } from 'lucide-react';
import styles from './AdminTop5Statistics.module.css';
import { LoadingState, ErrorMessage } from '../molecules';
import { adminService } from '../../services/api';

interface TopSellingCar {
  carId: number;
  carName: string;
  purchaseCount: number;
}

interface TopBuyer {
  buyerId: number;
  buyerName: string;
  purchaseCount: number;
}

interface TopDealership {
  dealershipId: number;
  dealershipName: string;
  salesCount: number;
}

interface TopRatedCar {
  carId: number;
  carName: string;
  averageRating: number;
}

interface Top5Data {
  bestSellingCars: TopSellingCar[];
  topBuyers: TopBuyer[];
  topDealerships: TopDealership[];
  bestRatedCars: TopRatedCar[];
}

const AdminTop5Statistics = () => {
  const [data, setData] = useState<Top5Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTop5Data();
  }, []);

  const fetchTop5Data = async () => {
    try {
      setLoading(true);
      const [bestSellingCars, topBuyers, topDealerships, bestRatedCars] = await Promise.all([
        adminService.getTopSellingCars(),
        adminService.getTopBuyersByPurchases(),
        adminService.getTopDealershipsBySales(),
        adminService.getTopRatedCarsTop5(),
      ]);

      setData({
        bestSellingCars,
        topBuyers,
        topDealerships,
        bestRatedCars,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load top 5 statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading top 5 statistics..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchTop5Data} retryLabel="Retry" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Top 5 Statistics</h1>
        <p className={styles.subtitle}>Key performance indicators</p>
      </div>

      <div className={styles.grid}>
        {/* Best Selling Cars */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Car size={24} className={styles.icon} />
            <h2>Best Selling Cars</h2>
          </div>
          <div className={styles.list}>
            {data?.bestSellingCars && data.bestSellingCars.length > 0 ? (
            data.bestSellingCars.map((item, index) => (
              <div key={index} className={styles.listItem}>
                <div className={styles.rank}>{index + 1}</div>
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.carName || 'Unknown Car'}</p>
                  <p className={styles.itemCount}>{item.purchaseCount} compras</p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noData}>No data available</p>
          )}
          </div>
        </div>

        {/* Top Buyers */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Users size={24} className={styles.icon} />
            <h2>Top Buyers</h2>
          </div>
          <div className={styles.list}>
            {data?.topBuyers && data.topBuyers.length > 0 ? (
              data.topBuyers.map((item, index) => (
                <div key={index} className={styles.listItem}>
                  <div className={styles.rank}>{index + 1}</div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.buyerName || 'Unknown Buyer'}</p>
                    <p className={styles.itemCount}>{item.purchaseCount} compras</p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noData}>No data available</p>
            )}
          </div>
        </div>

        {/* Top Dealerships */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Building2 size={24} className={styles.icon} />
            <h2>Top Dealerships</h2>
          </div>
          <div className={styles.list}>
            {data?.topDealerships && data.topDealerships.length > 0 ? (
              data.topDealerships.map((item, index) => (
                <div key={index} className={styles.listItem}>
                  <div className={styles.rank}>{index + 1}</div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.dealershipName || 'Unknown Dealership'}</p>
                    <p className={styles.itemCount}>{item.salesCount} ventas</p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noData}>No data available</p>
            )}
          </div>
        </div>

        {/* Best Rated Cars */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <TrendingUp size={24} className={styles.icon} />
            <h2>Best Rated Cars</h2>
          </div>
          <div className={styles.list}>
            {data?.bestRatedCars && data.bestRatedCars.length > 0 ? (
              data.bestRatedCars.map((item, index) => (
                <div key={index} className={styles.listItem}>
                  <div className={styles.rank}>{index + 1}</div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.carName || 'Unknown Car'}</p>
                    <p className={styles.itemRating}>
                      ⭐ {Number(item.averageRating).toFixed(1)}/10
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noData}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTop5Statistics;