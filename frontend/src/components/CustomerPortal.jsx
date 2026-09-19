import React, { useState, useEffect } from 'react';
import { Car, Calendar, Activity, History, Plus, FileText, CheckCircle2 } from 'lucide-react';
import LiveTracker from './LiveTracker';
import BookingWizard from './BookingWizard';
import CustomerVehicles from './CustomerVehicles';
import CustomerHistory from './CustomerHistory';
import { api } from '../api';

export default function CustomerPortal({ user, onOpenInvoice }) {
  const [activeTab, setActiveTab] = useState('track');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingForTrack, setSelectedBookingForTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [vRes, bRes] = await Promise.all([
        api.getVehicles(),
        api.getBookings()
      ]);

      if (vRes.success) setVehicles(vRes.vehicles);
      if (bRes.success) {
        setBookings(bRes.bookings);
        // Default track first active booking if available
        const active = bRes.bookings.find(b => !['completed', 'cancelled'].includes(b.status));
        if (active) setSelectedBookingForTrack(active);
        else if (bRes.bookings.length > 0) setSelectedBookingForTrack(bRes.bookings[0]);
      }
    } catch (err) {
      console.error('Customer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const handleBookingCreated = (newBooking) => {
    alert(`Success! Booking #${newBooking.booking_code} created.`);
    loadCustomerData();
    setActiveTab('track');
  };

  const handleTrackSpecificBooking = (booking) => {
    setSelectedBookingForTrack(booking);
    setActiveTab('track');
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Welcome back, {user?.name}!</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Customer Portal • Manage your cars, book guaranteed slots, and monitor live bay progress.
          </p>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('book')}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Book New Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <button
          onClick={() => setActiveTab('track')}
          className={`btn btn-sm ${activeTab === 'track' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Activity size={16} /> Live Service Tracker
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`btn btn-sm ${activeTab === 'book' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={16} /> Book Service (Wizard)
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`btn btn-sm ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Car size={16} /> My Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <History size={16} /> History & Invoices ({bookings.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'track' && (
        <LiveTracker
          selectedBooking={selectedBookingForTrack}
          onOpenInvoice={onOpenInvoice}
        />
      )}

      {activeTab === 'book' && (
        <BookingWizard
          vehicles={vehicles}
          onBookingCreated={handleBookingCreated}
          onGoToVehicles={() => setActiveTab('vehicles')}
        />
      )}

      {activeTab === 'vehicles' && (
        <CustomerVehicles
          vehicles={vehicles}
          onVehicleAdded={loadCustomerData}
          onVehicleDeleted={loadCustomerData}
        />
      )}

      {activeTab === 'history' && (
        <CustomerHistory
          bookings={bookings}
          onTrackBooking={handleTrackSpecificBooking}
          onOpenInvoice={onOpenInvoice}
          onBookingCancelled={loadCustomerData}
        />
      )}
    </div>
  );
}
