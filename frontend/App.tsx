import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useTheme } from './hooks/useTheme';
import { Role } from './types';
import DashboardLayout from './components/templates/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import Expenses from './pages/Expenses';
import CreateExpense from './pages/CreateExpense';
import Clients from './pages/Clients';
import CreateClient from './pages/CreateClient';
import ClientDetail from './pages/ClientDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Team from './pages/Team';
import AuditLogs from './pages/AuditLogs';
import PlatformAdminPanel from './pages/PlatformAdminPanel';
import Profile from './pages/Profile';
import ToastContainer from './components/molecules/Toast';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
};

// Redirect to appropriate home page based on user role
const HomeRedirect: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role === Role.PLATFORM_ADMIN) {
    return <Navigate to="/admin/system" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-background font-sans antialiased transition-colors duration-300">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomeRedirect />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin/system" element={<PlatformAdminPanel />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
            <Route path="invoices/:id/edit" element={<EditInvoice />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="expenses/new" element={<CreateExpense />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<CreateClient />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="team" element={<Team />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer />
      </div>
    </HashRouter>
  );
};

export default App;
