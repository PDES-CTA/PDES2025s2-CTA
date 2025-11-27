import { useState } from 'react';
import styles from './AdminPage.module.css';
import AdminSidebar from '../components/molecules/AdminSidebar';
import {
  AdminDashboardOverview,
  AdminUsersSection,
  AdminDealershipsSection,
  AdminFavoriteCarsSection,
  AdminReviewsSection,
  AdminPurchasesSection,
} from '../components/organisms';

type AdminSection = 'overview' | 'users' | 'dealerships' | 'favorites' | 'reviews' | 'purchases';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminDashboardOverview />;
      case 'users':
        return <AdminUsersSection />;
      case 'dealerships':
        return <AdminDealershipsSection />;
      case 'favorites':
        return <AdminFavoriteCarsSection />;
      case 'reviews':
        return <AdminReviewsSection />;
      case 'purchases':
        return <AdminPurchasesSection />;
      default:
        return <AdminDashboardOverview />;
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className={styles.mainContent}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;