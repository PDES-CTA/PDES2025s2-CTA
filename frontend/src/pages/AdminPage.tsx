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
  AdminTop5Statistics,
} from '../components/organisms';

type AdminSection = 'overview' | 'users' | 'dealerships' | 'favorites' | 'reviews' | 'purchases' | 'top5';

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
      case 'top5':
        return <AdminTop5Statistics />;
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