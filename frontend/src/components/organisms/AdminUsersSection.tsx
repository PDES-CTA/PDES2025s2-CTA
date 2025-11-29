import { useState, useEffect } from 'react';
import styles from './AdminUsersSection.module.css';
import {
  UserTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
  DeleteConfirmationModal,
} from '../molecules';
import { adminService } from '../../services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const AdminUsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBuyers();
      setUsers(response);
      setFilteredUsers(response);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteError(null);
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userId) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await adminService.deleteUser(deleteModal.userId);
      
      setUsers(users.filter(u => u.id !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
      setError(null);
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to delete user';
      setDeleteError(errorMessage);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
    setDeleteError(null);
  };

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  if (error && users.length === 0) {
    return <ErrorMessage error={error} onRetry={fetchUsers} retryLabel="Retry" />;
  }

  return (
    <div className={styles.section}>
      <SectionHeader
        title="Users & Buyers"
        subtitle="Manage registered users in the system"
      />
      <div className={styles.content}>
        <SearchBar
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={setSearchTerm}
          resultCount={filteredUsers.length}
        />
        {error && <div className={styles.errorBanner}>{error}</div>}
        {users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <>
            <UserTable 
              users={filteredUsers}
              onDelete={handleDeleteClick}
            />
            <div className={styles.pagination}>
              <p>Showing {filteredUsers.length} of {users.length} users</p>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        message={deleteError ?
          `Error: ${deleteError}` :
          `Are you sure you want to delete ${deleteModal.userName}? This action cannot be undone.`
        }
        confirmLabel="Delete User"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default AdminUsersSection;