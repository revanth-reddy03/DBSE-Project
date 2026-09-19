import React from 'react';
import { Calendar, MapPin, Eye, FileText, Ban, CheckCircle, Clock } from 'lucide-react';
import { api } from '../api';

export default function CustomerHistory({ bookings, onTrackBooking, onOpenInvoice, onBookingCancelled }) {
  const handleCancel = async (id, code) => {
    const reason = window.prompt(`Please enter cancellation reason for booking ${code}:`, 'Schedule conflict');
    if (!reason) return;

    try {
      const res = await api.cancelBooking(id, reason);
      if (res.success) {
        alert('Booking cancelled successfully.');
        if (onBookingCancelled) onBookingCancelled();
      }
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Service History & Digital Invoices</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Detailed record of past appointments, parts replaced, and invoice billing records
        </p>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No Service Bookings Yet</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Reserve your first maintenance or diagnostic slot using the Book Service tab.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                      #{b.booking_code}
                    </span>
                    <span className={`badge badge-${b.status}`}>
                      {b.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {b.make} {b.model} ({b.year}) • <span style={{ color: '#38bdf8' }}>{b.reg_no}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onTrackBooking(b)}
                    className="btn btn-primary btn-sm"
                  >
                    <Eye size={14} /> Live Track
                  </button>

                  {b.invoice_id && (
                    <button
                      onClick={() => onOpenInvoice(b.invoice_id, b.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <FileText size={14} /> Invoice {b.payment_status === 'paid' ? '(Paid)' : '(Due)'}
                    </button>
                  )}

                  {['booked', 'checked_in'].includes(b.status) && (
                    <button
                      onClick={() => handleCancel(b.id, b.booking_code)}
                      className="btn btn-danger btn-sm"
                    >
                      <Ban size={14} /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '0.85rem 0',
                margin: '0.75rem 0',
                fontSize: '0.82rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Station:</span>
                  <div style={{ fontWeight: 600 }}>{b.service_center_name} ({b.service_center_city})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Slot:</span>
                  <div style={{ fontWeight: 600 }}>{new Date(b.booking_date).toLocaleDateString()} • {b.slot_time}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Technician:</span>
                  <div style={{ fontWeight: 600, color: b.mechanic_name ? '#34d399' : 'var(--text-muted)' }}>
                    {b.mechanic_name || 'Not assigned yet'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <div style={{ fontWeight: 800, color: '#60a5fa', fontSize: '0.95rem' }}>
                    ₹{parseFloat(b.total_amount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Service tags */}
              {b.services && b.services.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Services:
                  </span>
                  {b.services.map(s => (
                    <span key={s.id} style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {s.name} (₹{parseFloat(s.price).toFixed(0)})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
