import React from 'react';
import styles from './UserTable.module.css';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

interface UserTableProps {
  users: User[];
  onDelete?: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <span className={styles.name}>
                  {user.firstName} {user.lastName}
                </span>
              </td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <span className={styles.role}>{user.role}</span>
              </td>
              {onDelete && (
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDelete(user)}
                    title={`Delete ${user.firstName} ${user.lastName}`}
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

export default UserTable;