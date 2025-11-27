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
import PurchasesPage from './pages/PurchasesPage';
import DealershipSalesPage from './pages/DealershipSalesPage';

// import FavoritesPage from './pages/FavoritesPage';
// import DashboardPage from './pages/DashboardPage';
// import AdminPage from './pages/AdminPage';
import AdminPage from './pages/AdminPage';

import styles from './App.module.css';
import DealershipOffersPage from './pages/DealershipOffersPage';
import CarPoolPage from './pages/CarPoolPage';
import Header from './components/organisms/Header';
import BuyerFavoritesPage from './pages/BuyerFavoritesPage';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('authorization_token');
  return token ? children : <Navigate to={ROUTES.LOGIN} />;
};

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const token = localStorage.getItem('authorization_token');
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole === 'ADMINISTRATOR';
  
  return token && isAdmin ? children : <Navigate to={ROUTES.LOGIN} />;
};

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      {showHeader && <Header />}
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
        localStorage.setItem('user_role', userData.role);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('authorization_token');
        localStorage.removeItem('user_role');
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
        <Route path={ROUTES.HOME} element={<Layout><HomePage/></Layout>} />
        <Route path={ROUTES.CAR_POOL} element={<Layout><CarPoolPage /></Layout>} />
        <Route path={ROUTES.DEALERSHIP_OFFERS} element={<Layout><DealershipOffersPage /></Layout>} />
        <Route path={ROUTES.DEALERSHIP_HOME} element={<Layout><DealershipHomePage /></Layout> } />
        <Route path={ROUTES.LOGIN} element={<LoginPage onLogin={checkAuth} />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.CARS} element={<Layout><CarsPage /></Layout>} />
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
        <Route
          path="/purchases/:id"
          element={
            <PrivateRoute>
              <Layout>
                <PurchasesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales/dealership"
          element={
            <PrivateRoute>
              <Layout>
                <DealershipSalesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites/:userId"
          element={
            <PrivateRoute>
              <Layout>
                <BuyerFavoritesPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN}
          element={
            <AdminRoute>
                <AdminPage />
            </AdminRoute>
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
        */}

        <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;