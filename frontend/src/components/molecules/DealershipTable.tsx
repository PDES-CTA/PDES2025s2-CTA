import React from 'react';
import styles from './DealershipTable.module.css';

interface Dealership {
  id: number;
  email: string;
  businessName: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
}

interface DealershipTableProps {
  dealerships: Dealership[];
  onDelete?: (dealership: Dealership) => void;
}

const DealershipTable: React.FC<DealershipTableProps> = ({ 
  dealerships, 
  onDelete 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className={styles.statusActive}>Active</span>
    ) : (
      <span className={styles.statusInactive}>Inactive</span>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Business Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Created</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {dealerships.map((dealership) => (
            <tr key={dealership.id}>
              <td>{dealership.id}</td>
              <td>
                <span className={styles.businessName}>
                  {dealership.businessName}
                </span>
              </td>
              <td>{dealership.email}</td>
              <td>{dealership.phone}</td>
              <td>
                <span className={styles.address}>
                  {dealership.address || 'N/A'}
                </span>
              </td>
              <td>{getStatusBadge(dealership.active)}</td>
              <td>{formatDate(dealership.createdAt)}</td>
              {onDelete && (
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDelete(dealership)}
                    title={`Delete ${dealership.businessName}`}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DealershipTable;