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
}

const DealershipTable: React.FC<DealershipTableProps> = ({ dealerships }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {dealerships.map((dealership) => (
            <tr key={dealership.id}>
              <td>
                <strong>{dealership.businessName}</strong>
              </td>
              <td>{dealership.email}</td>
              <td>{dealership.phone}</td>
              <td>{dealership.address}</td>
              <td>
                <span className={`${styles.status} ${dealership.active ? styles.active : styles.inactive}`}>
                  {dealership.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{formatDate(dealership.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DealershipTable;