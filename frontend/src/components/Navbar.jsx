import React from 'react';
import { Car, Bell, LogOut, ShieldCheck, Wrench, UserCheck, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  onOpenLogin,
  onQuickSwitchRole,
  onToggleNotifications,
  unreadNotifsCount,
  activeView,
  setActiveView
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 17, 32, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveView('home')}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            <Car size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Apex Auto Hub</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automobile Service & Live Tracking System</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveView('home')}
            className={`btn btn-sm ${activeView === 'home' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Overview
          </button>
          {user && (
            <button
              onClick={() => setActiveView(user.role)}
              className={`btn btn-sm ${activeView === user.role ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {user.role === 'admin' ? 'Admin Console' : user.role === 'staff' ? 'Mechanic Workbench' : 'My Dashboard'}
            </button>
          )}
        </div>

        {/* User profile & actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <button
                onClick={onToggleNotifications}
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="View Milestone Notifications"
              >
                <Bell size={18} />
                {unreadNotifsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                  }}>
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* User badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#7c3aed' : user.role === 'staff' ? '#d97706' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role} Account
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button onClick={onOpenLogin} className="btn btn-primary btn-sm">
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
