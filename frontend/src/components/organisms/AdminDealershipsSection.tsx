import React, { useState, useEffect } from 'react';
import styles from './AdminDealershipsSection.module.css';
import {
  DealershipTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
  DeleteConfirmationModal,
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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    dealershipId: number | null;
    dealershipName: string;
  }>({
    isOpen: false,
    dealershipId: null,
    dealershipName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteClick = (dealership: Dealership) => {
    setDeleteError(null);
    setDeleteModal({
      isOpen: true,
      dealershipId: dealership.id,
      dealershipName: dealership.businessName,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.dealershipId) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await adminService.deleteDealership(deleteModal.dealershipId);
      
      setDealerships(dealerships.filter(d => d.id !== deleteModal.dealershipId));
      setDeleteModal({ isOpen: false, dealershipId: null, dealershipName: '' });
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to delete dealership';
      setDeleteError(errorMessage);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, dealershipId: null, dealershipName: '' });
    setDeleteError(null);
  };

  if (loading) {
    return <LoadingState message="Loading dealerships..." />;
  }

  if (error && dealerships.length === 0) {
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
        {error && <div className={styles.errorBanner}>{error}</div>}
        {dealerships.length === 0 ? (
          <EmptyState message="No dealerships found" />
        ) : (
          <>
            <DealershipTable 
              dealerships={filteredDealerships}
              onDelete={handleDeleteClick}
            />
            <div className={styles.pagination}>
              <p>
                Showing {filteredDealerships.length} of {dealerships.length}{' '}
                dealerships
              </p>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Dealership"
        message={deleteError ?
          `Error: ${deleteError}` :
          `Are you sure you want to delete ${deleteModal.dealershipName}? This action cannot be undone.`
        }
        confirmLabel="Delete Dealership"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default AdminDealershipsSection;