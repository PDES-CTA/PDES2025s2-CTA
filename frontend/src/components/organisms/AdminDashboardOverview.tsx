import { useState, useEffect } from 'react';
import { Users, Building2, ShoppingCart, TrendingUp } from 'lucide-react';
import styles from './AdminDashboardOverview.module.css';
import { StatCard, InfoCard, LoadingState, ErrorMessage } from '../molecules';
import { adminService } from '../../services/api';

interface DashboardData {
  totalBuyers: number;
  totalDealerships: number;
  totalPurchases: number;
  totalRevenue: number;
}

const AdminDashboardOverview = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardOverview();
      setData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchDashboardData} retryLabel="Retry" />;
  }

  return (
    <div className={styles.overview}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      <p className={styles.subtitle}>System statistics and key metrics</p>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Users size={32} />}
          title="Total Buyers"
          value={data?.totalBuyers || 0}
          color="#2196F3"
        />
        <StatCard
          icon={<Building2 size={32} />}
          title="Total Dealerships"
          value={data?.totalDealerships || 0}
          color="#4CAF50"
        />
        <StatCard
          icon={<ShoppingCart size={32} />}
          title="Total Purchases"
          value={data?.totalPurchases || 0}
          color="#FF9800"
        />
        <StatCard
          icon={<TrendingUp size={32} />}
          title="Total Revenue"
          value={`$${(data?.totalRevenue || 0).toLocaleString()}`}
          color="#9C27B0"
        />
      </div>

      <div className={styles.infoSection}>
        <h2>Quick Stats</h2>
        <div className={styles.infoGrid}>
          <InfoCard
            title="Buyers"
            value={data?.totalBuyers || 0}
            description="Total registered users"
          />
          <InfoCard
            title="Dealerships"
            value={data?.totalDealerships || 0}
            description="Total dealership partners"
          />
          <InfoCard
            title="Transactions"
            value={data?.totalPurchases || 0}
            description="Total completed purchases"
          />
          <InfoCard
            title="Revenue"
            value={`$${(data?.totalRevenue || 0).toLocaleString()}`}
            description="Total system revenue"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;