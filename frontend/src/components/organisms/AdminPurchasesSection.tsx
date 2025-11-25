import { useState, useEffect } from 'react';
import styles from './AdminPurchasesSection.module.css';
import {
  PurchaseTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
  StatsBar,
  PaginationInfo,
} from '../molecules';
import { adminService } from '../../services/api';

interface Purchase {
  id: number;
  buyerId: number;
  buyerName: string;
  carId: number;
  carName: string;
  dealershipName: string;
  finalPrice: number;
  purchaseDate: string;
}

const AdminPurchasesSection = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    const filtered = purchases.filter((purchase: Purchase) =>
      purchase.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.dealershipName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [searchTerm, purchases]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPurchases();
      
      const purchasesData = response.map((p: any) => ({
        id: p.id,
        buyerId: p.buyerId,
        buyerName: p.buyerName,
        carId: p.carId,
        carName: p.carName,
        dealershipName: p.dealershipName,
        finalPrice: Number.parseFloat(p.finalPrice),
        purchaseDate: p.purchaseDate,
      }));
      
      setPurchases(purchasesData);
      setFilteredPurchases(purchasesData);
      
      const revenue = purchasesData.reduce((sum: number, p: Purchase) => sum + p.finalPrice, 0);
      setTotalRevenue(revenue);
      setError(null);
    } catch (err) {
      setError('Failed to load purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading purchases..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchPurchases} retryLabel="Retry" />;
  }

  const statsData = purchases.length > 0 ? [
    {
      label: 'Total Purchases',
      value: purchases.length,
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      label: 'Average Sale',
      value: `$${(totalRevenue / purchases.length).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
  ] : [];

  return (
    <div className={styles.section}>
      <SectionHeader
        title="Purchases"
        subtitle="Track all car purchases and transactions"
      />

      <div className={styles.content}>
        {statsData.length > 0 && <StatsBar stats={statsData} />}

        <SearchBar
          placeholder="Search by car name, buyer, or dealership..."
          value={searchTerm}
          onChange={setSearchTerm}
          resultCount={filteredPurchases.length}
        />

        {purchases.length === 0 ? (
          <EmptyState message="No purchases found" />
        ) : (
          <>
            <PurchaseTable purchases={filteredPurchases} />
            <PaginationInfo
              showing={filteredPurchases.length}
              total={purchases.length}
              label="purchases"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPurchasesSection;