import React from 'react';
import { X, Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '75px',
      right: '24px',
      width: '380px',
      maxHeight: '520px',
      background: '#0f172a',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'modalIn 0.2s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="pulse-dot" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live Milestone Alerts</h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {(!notifications || notifications.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.85rem' }}>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: n.channel === 'sms' ? '#38bdf8' : '#a855f7'
                  }}>
                    {n.channel === 'sms' ? <MessageSquare size={12} /> : <Mail size={12} />}
                    {n.channel} alert
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {n.title}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.message}
                </p>
                {n.booking_code && (
                  <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                    Ref: #{n.booking_code}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
