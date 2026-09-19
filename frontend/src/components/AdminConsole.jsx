import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, TrendingUp, Users, Car, CheckCircle, Clock,
  Search, UserCheck, FileText, AlertCircle, Building2, Activity, X
} from 'lucide-react';
import { api } from '../api';

export default function AdminConsole({ onOpenInvoice }) {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [centers, setCenters] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Assign mechanic modal
  const [assignModalBooking, setAssignModalBooking] = useState(null);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, staffRes, centersRes] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings({ status: filterStatus, centerId: filterCenter, search: searchTerm }),
        api.getStaffMembers(),
        api.getServiceCenters()
      ]);

      if (statsRes.success) setStats(statsRes);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (staffRes.success) {
        setStaffList(staffRes.staff);
        if (staffRes.staff.length > 0) setSelectedMechanicId(staffRes.staff[0].id);
      }
      if (centersRes.success) setCenters(centersRes.centers);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [filterStatus, filterCenter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAdminData();
  };

  const handleAssignMechanic = async (e) => {
    e.preventDefault();
    if (!assignModalBooking || !selectedMechanicId) return;

    setAssigning(true);
    try {
      const res = await api.assignMechanic(assignModalBooking.id, selectedMechanicId, assignNotes);
      if (res.success) {
        alert(res.message);
        setAssignModalBooking(null);
        setAssignNotes('');
        loadAdminData();
      }
    } catch (err) {
      alert('Failed to assign mechanic: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
          <ShieldCheck size={26} color="#8b5cf6" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Central Administration Control Console</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Enterprise fleet management, capacity scheduling, mechanic assignments, and financial analytics
        </p>
      </div>

      {/* KPI METRIC CARDS */}
      {stats && stats.metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Bookings</span>
              <Activity size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              {stats.metrics.totalBookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '4px' }}>
              {stats.metrics.activeBookings} active in service bays
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Completed Services</span>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              {stats.metrics.completedBookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Successful handovers
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Paid Revenue</span>
              <TrendingUp size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
              ₹{parseFloat(stats.metrics.paidRevenue).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              ₹{parseFloat(stats.metrics.pendingRevenue).toLocaleString()} pending
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Active Fleet</span>
              <Car size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>
              {stats.metrics.totalVehicles}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.metrics.totalCustomers} customers • {stats.metrics.totalMechanics} mechanics
            </div>
          </div>
        </div>
      )}

      {/* SERVICE CENTER UTILIZATION */}
      {stats && stats.centerStats && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#60a5fa" /> Station Bay Utilization & Distributed Capacity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {stats.centerStats.map(c => {
              const utilPercent = Math.min(100, Math.round((c.active_bookings / (c.capacity_per_slot * 4)) * 100));
              return (
                <div key={c.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.city}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Active Bay Load:</span>
                    <span><strong>{c.active_bookings}</strong> vehicles</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${utilPercent || 15}%`,
                      height: '100%',
                      background: utilPercent > 80 ? '#ef4444' : utilPercent > 50 ? '#f59e0b' : '#10b981'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL BOOKINGS DISPATCH & MANAGEMENT */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Service Orders & Mechanic Dispatch</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assign technicians and monitor bay progress</p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="glass-input"
              style={{ width: 'auto', fontSize: '0.82rem', padding: '0.5rem 0.8rem' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
              <option value="booked" style={{ background: '#0f172a' }}>Booked</option>
              <option value="checked_in" style={{ background: '#0f172a' }}>Checked In</option>
              <option value="inspection" style={{ background: '#0f172a' }}>Inspection</option>
              <option value="repair" style={{ background: '#0f172a' }}>Repair</option>
              <option value="quality_check" style={{ background: '#0f172a' }}>Quality Check</option>
              <option value="ready_for_delivery" style={{ background: '#0f172a' }}>Ready For Delivery</option>
              <option value="completed" style={{ background: '#0f172a' }}>Completed</option>
            </select>

            <select
              className="glass-input"
              style={{ width: 'auto', fontSize: '0.82rem', padding: '0.5rem 0.8rem' }}
              value={filterCenter}
              onChange={e => setFilterCenter(e.target.value)}
            >
              <option value="" style={{ background: '#0f172a' }}>All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Booking Code</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Vehicle</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Service Station</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Assigned Mechanic</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>
                    {b.booking_code}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{b.make} {b.model}</div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{b.reg_no}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{b.customer_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.customer_phone || b.customer_email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {b.service_center_name}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span className={`badge badge-${b.status}`}>
                      {b.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {b.mechanic_name ? (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>{b.mechanic_name}</span>
                    ) : (
                      <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => setAssignModalBooking(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        title="Assign / Reassign Mechanic"
                      >
                        <UserCheck size={14} /> Dispatch
                      </button>
                      {b.invoice_id && (
                        <button
                          onClick={() => onOpenInvoice(b.invoice_id, b.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          title="View Invoice"
                        >
                          <FileText size={14} /> Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN MECHANIC MODAL */}
      {assignModalBooking && (
        <div className="modal-overlay" onClick={() => setAssignModalBooking(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dispatch Lead Mechanic</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Booking #{assignModalBooking.booking_code} • {assignModalBooking.make} {assignModalBooking.model}
                </p>
              </div>
              <button onClick={() => setAssignModalBooking(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignMechanic} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Select Technician:
                </label>
                <select
                  className="glass-input"
                  value={selectedMechanicId}
                  onChange={e => setSelectedMechanicId(e.target.value)}
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>
                      {s.name} ({s.phone || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Assignment Instructions / Work Priority:
                </label>
                <textarea
                  rows="2"
                  className="glass-input"
                  placeholder="e.g. Priority bay check; perform full brake overhaul first..."
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={assigning}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
              >
                {assigning ? 'Dispatching...' : 'Assign Job & Notify Customer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
