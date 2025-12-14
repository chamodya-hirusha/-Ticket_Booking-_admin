import { useState } from 'react';
import AdminSignIn from './components/admin/AdminSignIn';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Events } from './pages/admin/Events';
import { Tickets } from './pages/admin/Tickets';
import { Users } from './pages/admin/Users';
import { Vendors } from './pages/admin/Vendors';
import { Payments } from './pages/admin/Payments';
import { Settings } from './pages/admin/Settings';
import { useAdminAuth } from './hooks/useAdminAuth';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { admin, isLoading, logout } = useAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!admin) {
    return <AdminSignIn />;
  }

  // Render the appropriate page based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <Events />;
      case 'tickets':
        return <Tickets />;
      case 'users':
        return <Users />;
      case 'vendors':
        return <Vendors />;
      case 'payments':
        return <Payments />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <AdminLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        adminName={admin.name}
        adminEmail={admin.email}
        onLogout={logout}
      >
        {renderPage()}
      </AdminLayout>
      <Toaster position="top-right" />
    </>
  );
}