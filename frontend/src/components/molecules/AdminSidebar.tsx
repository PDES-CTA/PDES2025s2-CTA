import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Building2, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';
import Button from '../atoms/Button';
import styles from './AdminSidebar.module.css';

type AdminSection = 'overview' | 'users' | 'dealerships' | 'favorites' | 'reviews' | 'purchases' | 'top5';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'top5', label: 'Top 5', icon: <TrendingUp size={20} /> },
    { id: 'users', label: 'Users & Buyers', icon: <Users size={20} /> },
    { id: 'dealerships', label: 'Dealerships', icon: <Building2 size={20} /> },
    { id: 'favorites', label: 'Favorite Cars', icon: <TrendingUp size={20} /> },
    { id: 'reviews', label: 'Reviews & Opinions', icon: <BarChart3 size={20} /> },
    { id: 'purchases', label: 'Purchases', icon: <ShoppingCart size={20} /> },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Admin Panel</h2>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/cars')}
        >
          <LogOut size={18} />
          Exit Admin
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;