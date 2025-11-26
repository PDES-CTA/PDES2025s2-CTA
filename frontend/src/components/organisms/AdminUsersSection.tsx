import { useState, useEffect } from 'react';
import styles from './AdminUsersSection.module.css';
import {
  UserTable,
  LoadingState,
  ErrorMessage,
  EmptyState,
  SearchBar,
  SectionHeader,
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

const AdminUsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  if (error) {
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

        {users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <>
            <UserTable users={filteredUsers} />
            <div className={styles.pagination}>
              <p>Showing {filteredUsers.length} of {users.length} users</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersSection;