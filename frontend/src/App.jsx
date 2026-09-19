import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingView from './components/LandingView';
import CustomerPortal from './components/CustomerPortal';
import StaffWorkbench from './components/StaffWorkbench';
import AdminConsole from './components/AdminConsole';
import AuthModal from './components/AuthModal';
import InvoiceModal from './components/InvoiceModal';
import NotificationDrawer from './components/NotificationDrawer';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.role === 'admin') return 'admin';
      if (u.role === 'staff') return 'staff';
      return 'customer';
    }
    return 'home';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications periodically
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Quick switch role for evaluator demonstration
  const handleQuickSwitchRole = async (targetRole) => {
    const creds = {
      customer: { email: 'revanth@vehicleservice.com', password: 'customer123' },
      staff: { email: 'suresh@vehicleservice.com', password: 'staff123' },
      admin: { email: 'admin@vehicleservice.com', password: 'admin123' }
    };

    const target = creds[targetRole];
    if (!target) return;

    try {
      const res = await api.login(target.email, target.password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        setActiveView(targetRole);
      }
    } catch (err) {
      alert('Quick switch failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveView('home');
  };

  const handleOpenInvoice = async (invoiceId, bookingId) => {
    try {
      const res = await api.getInvoiceByBooking(bookingId);
      if (res.success) {
        setInvoiceModalData(res.invoice);
      }
    } catch (err) {
      alert('Failed to load invoice details: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthModalOpen(true)}
        onQuickSwitchRole={handleQuickSwitchRole}
        onToggleNotifications={() => setNotifDrawerOpen(!notifDrawerOpen)}
        unreadNotifsCount={notifications.length}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        notifications={notifications}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem 4rem' }}>
        {activeView === 'home' && (
          <LandingView
            user={user}
            onGoToDashboard={() => {
              if (user) setActiveView(user.role);
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeView === 'customer' && (
          <CustomerPortal
            user={user}
            onOpenInvoice={handleOpenInvoice}
          />
        )}

        {activeView === 'staff' && (
          <StaffWorkbench
            user={user}
          />
        )}

        {activeView === 'admin' && (
          <AdminConsole
            onOpenInvoice={handleOpenInvoice}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem 0',
        background: 'rgba(11, 17, 32, 0.95)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <strong>Apex Auto Hub</strong> • Automobile Service & Live Tracking System
          </div>
          <div>
            © 2026 Apex Auto Hub • Certified Automobile Service & Diagnostic Network
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          setActiveView(loggedUser.role);
        }}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!invoiceModalData}
        onClose={() => setInvoiceModalData(null)}
        invoice={invoiceModalData}
        onPaymentSuccess={(payRes) => {
          setInvoiceModalData(prev => ({ ...prev, payment_status: 'paid', payment_method: payRes.payment_method }));
        }}
      />
    </div>
  );
}
