import React, { useState, useEffect } from 'react';
import styles from './AdminDealershipsSection.module.css';
import {
  DealershipTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
} from '../molecules';
import { adminService } from '../../services/api';

interface Dealership {
  id: number;
  email: string;
  businessName: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
}

const AdminDealershipsSection = () => {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [filteredDealerships, setFilteredDealerships] = useState<Dealership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDealerships();
  }, []);

  useEffect(() => {
    const filtered = dealerships.filter(
      (dealership) =>
        dealership.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealership.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealership.phone.includes(searchTerm)
    );
    setFilteredDealerships(filtered);
  }, [searchTerm, dealerships]);

  const fetchDealerships = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllDealerships();
      setDealerships(response);
      setFilteredDealerships(response);
      setError(null);
    } catch (err) {
      setError('Failed to load dealerships');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading dealerships..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchDealerships} retryLabel="Retry" />;
  }

  return (
    <div className={styles.section}>
      <SectionHeader
        title="Dealerships"
        subtitle="Manage registered dealership partners"
      />

      <div className={styles.content}>
        <SearchBar
          placeholder="Search by dealership name, email, or phone..."
          value={searchTerm}
          onChange={setSearchTerm}
          resultCount={filteredDealerships.length}
        />

        {dealerships.length === 0 ? (
          <EmptyState message="No dealerships found" />
        ) : (
          <>
            <DealershipTable dealerships={filteredDealerships} />
            <div className={styles.pagination}>
              <p>
                Showing {filteredDealerships.length} of {dealerships.length}{' '}
                dealerships
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDealershipsSection;