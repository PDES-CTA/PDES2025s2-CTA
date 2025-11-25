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
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <strong>{user.firstName} {user.lastName}</strong>
              </td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <span className={`${styles.badge} ${styles[user.role.toLowerCase()]}`}>
                  {user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;