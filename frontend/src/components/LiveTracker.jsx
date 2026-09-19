import React, { useState } from 'react';
import {
  Search, CheckCircle2, Clock, AlertCircle, Wrench, ShieldCheck,
  Truck, CheckCircle, FileText, Calendar, User, MapPin
} from 'lucide-react';
import { api } from '../api';

const STAGES = [
  { key: 'booked', label: 'Booked', desc: 'Slot confirmed' },
  { key: 'checked_in', label: 'Checked In', desc: 'Arrived at bay' },
  { key: 'inspection', label: 'Inspection', desc: 'Diagnostics check' },
  { key: 'repair', label: 'Repair & Service', desc: 'Work in progress' },
  { key: 'quality_check', label: 'Quality Check', desc: 'Safety audit' },
  { key: 'ready_for_delivery', label: 'Ready', desc: 'Prepared for pickup' }
];

export default function LiveTracker({ selectedBooking, onOpenInvoice }) {
  const [searchInput, setSearchInput] = useState('');
  const [activeBooking, setActiveBooking] = useState(selectedBooking || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Synchronize when selectedBooking changes from outside
  React.useEffect(() => {
    if (selectedBooking) {
      setActiveBooking(selectedBooking);
    }
  }, [selectedBooking]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    setError('');
    setLoading(true);
    try {
      const res = await api.getBookingDetails(searchInput.trim());
      if (res.success) {
        setActiveBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || 'Booking not found');
      setActiveBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status) => {
    if (status === 'completed') return 6;
    if (status === 'cancelled') return -1;
    return STAGES.findIndex(s => s.key === status);
  };

  const currentIdx = activeBooking ? getStageIndex(activeBooking.status) : 0;

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      {/* Header & Code Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="pulse-dot" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Live Service & Progress Tracker</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time milestone visibility from check-in to final vehicle handover
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', minWidth: '320px' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Enter Booking # (e.g. VSB-2026-1001)"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
            <Search size={16} /> Track
          </button>
        </form>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1rem', width: '12px', height: '12px' }} />
          Loading telemetry & job progress...
        </div>
      )}

      {!loading && !activeBooking && !error && (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <Wrench size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            No Vehicle Selected for Live Tracking
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto' }}>
            Select an active booking from your dashboard or enter a booking code above to see the real-time stage tracker.
          </p>
        </div>
      )}

      {!loading && activeBooking && (
        <div>
          {/* Booking Overview Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Booking Code</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                {activeBooking.booking_code}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                {activeBooking.make} {activeBooking.model}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Plate: {activeBooking.reg_no}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Service Bay</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {activeBooking.service_center_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeBooking.service_center_city}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Lead Technician</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: activeBooking.mechanic_name ? '#34d399' : 'var(--text-muted)' }}>
                {activeBooking.mechanic_name || 'Pending Assignment'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className={`badge badge-${activeBooking.status}`}>
                {activeBooking.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div style={{ marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '700px', position: 'relative' }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                right: '40px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 1
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #2563eb, #10b981)',
                  width: `${Math.max(0, Math.min(100, (currentIdx / (STAGES.length - 1)) * 100))}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {STAGES.map((stage, idx) => {
                const isPassed = currentIdx > idx || activeBooking.status === 'completed';
                const isCurrent = currentIdx === idx && activeBooking.status !== 'completed';
                return (
                  <div
                    key={stage.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2,
                      width: '120px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isPassed ? '#10b981' : isCurrent ? '#2563eb' : '#1e293b',
                      border: isCurrent ? '3px solid #60a5fa' : '2px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isPassed || isCurrent ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      boxShadow: isCurrent ? '0 0 15px rgba(37, 99, 235, 0.6)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isPassed ? <CheckCircle size={20} /> : idx + 1}
                    </div>
                    <div style={{
                      marginTop: '10px',
                      fontSize: '0.82rem',
                      fontWeight: isCurrent ? 700 : 600,
                      color: isCurrent ? '#60a5fa' : isPassed ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {stage.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {stage.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit History Timeline Logs */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#60a5fa" /> Service Milestones & Technician Notes
            </h3>

            {(!activeBooking.history || activeBooking.history.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No audit logs recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeBooking.history.map((log, i) => (
                  <div
                    key={log.id || i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: '3px solid #2563eb',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '0 10px 10px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                          {log.status_to?.replace(/_/g, ' ')}
                        </span>
                        {log.changed_by_name && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            by {log.changed_by_name} ({log.changed_by_role || 'Staff'})
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{log.comments}</p>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoice action */}
          {activeBooking.invoice_id && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem 1.5rem',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Digital Invoice Generated</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Invoice #{activeBooking.invoice_number} • Total: ₹{parseFloat(activeBooking.invoice_total || 0).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => onOpenInvoice(activeBooking.invoice_id, activeBooking.id)}
                className="btn btn-primary btn-sm"
              >
                <FileText size={16} /> View & Print Invoice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
