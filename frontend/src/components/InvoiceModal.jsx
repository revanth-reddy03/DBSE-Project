import React, { useState } from 'react';
import { X, Printer, CheckCircle, CreditCard, ShieldCheck, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function InvoiceModal({ isOpen, onClose, invoice, onPaymentSuccess }) {
  const [paying, setPaying] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePay = async (method = 'UPI') => {
    setPaying(true);
    try {
      const res = await api.payInvoice(invoice.id, method);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onPaymentSuccess) onPaymentSuccess(res);
      }
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  const isPaid = invoice.payment_status === 'paid';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '2rem', background: '#0b1329' }}
      >
        {/* Controls - Hidden on print */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
              <Printer size={16} /> Print / Save PDF
            </button>
            {!isPaid && (
              <button
                onClick={() => handlePay('UPI - GPay/PhonePe')}
                disabled={paying}
                className="btn btn-success btn-sm"
              >
                <CreditCard size={16} /> {paying ? 'Processing...' : 'Pay with UPI (₹' + parseFloat(invoice.grand_total).toFixed(2) + ')'}
              </button>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Invoice Printable Sheet */}
        <div style={{
          background: '#0f172a',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>APEX AUTO HUB</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automobile Engineering & Service Center</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{invoice.service_center_name || 'Hyderabad Service Station'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: 36AAACA1234F1Z9</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${isPaid ? 'badge-completed' : 'badge-inspection'}`} style={{ marginBottom: '8px' }}>
                {isPaid ? '✓ PAID' : 'PENDING PAYMENT'}
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {invoice.invoice_number}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Date: {new Date(invoice.invoice_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', margin: '1.5rem 0', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Billed To:</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{invoice.customer_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{invoice.customer_email}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{invoice.customer_phone || '+91 98765 43210'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Vehicle & Job Details:</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: '#38bdf8' }}>
                {invoice.reg_no}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {invoice.make} {invoice.model} ({invoice.year})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Booking Ref: #{invoice.booking_code}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0' }}>Item Description</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'center' }}>Type</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{item.description}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', textTransform: 'capitalize' }}>
                      {item.item_type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right', color: 'var(--text-secondary)' }}>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>₹{parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ width: '260px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                <span>GST (18%):</span>
                <span>₹{parseFloat(invoice.tax).toFixed(2)}</span>
              </div>
              {parseFloat(invoice.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#34d399' }}>
                  <span>Discount:</span>
                  <span>-₹{parseFloat(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid var(--border-subtle)',
                paddingTop: '8px',
                marginTop: '8px',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#60a5fa'
              }}>
                <span>Grand Total:</span>
                <span>₹{parseFloat(invoice.grand_total).toFixed(2)}</span>
              </div>
              {isPaid && (
                <div style={{ fontSize: '0.75rem', color: '#10b981', textAlign: 'right', marginTop: '6px' }}>
                  Paid via {invoice.payment_method || 'Online'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
