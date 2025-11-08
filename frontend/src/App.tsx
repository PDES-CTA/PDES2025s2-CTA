import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { authService, User } from './services/api';
import { ROUTES } from './constants';

import HomePage from './pages/HomePage';
import DealershipHomePage from './pages/DealershipHomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';

// import FavoritesPage from './pages/FavoritesPage';
// import PurchasesPage from './pages/PurchasesPage';
// import DashboardPage from './pages/DashboardPage';
// import AdminPage from './pages/AdminPage';

import styles from './App.module.css';
import DealershipOffersPage from './pages/DealershipOffersPage';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('authorization_token');
  return token ? children : <Navigate to={ROUTES.LOGIN} />;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <h1 className={styles.logo}>Compra Tu Auto</h1>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

function App() {
  const [_user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authorization_token');
    if (token) {
      try {
        const userData = await authService.getLoggedUser();
        setUser(userData);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('authorization_token');
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.spinner} size={64} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.DEALERSHIP_OFFERS} element={<DealershipOffersPage />} />
        <Route path={ROUTES.DEALERSHIP_HOME} element={<DealershipHomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage onLogin={checkAuth} />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.CARS} element={<CarsPage />} />
        {/* Protected Routes */}
        <Route
          path="/cars/:id"
          element={
            <PrivateRoute>
              <Layout>
                <CarDetailPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* TODO: Pending pages - delete comment when ready*/}
        {/* 
        <Route
          path={ROUTES.FAVORITES}
          element={
            <PrivateRoute>
              <Layout>
                <FavoritesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path={ROUTES.PURCHASES}
          element={
            <PrivateRoute>
              <Layout>
                <PurchasesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path={ROUTES.ADMIN}
          element={
            <PrivateRoute>
              <Layout>
                <AdminPage />
              </Layout>
            </PrivateRoute>
          }
        />
        */}

        <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;