import React, { useState } from 'react';
import { Car, Plus, Trash2, Fuel, Gauge, Calendar, ShieldCheck, X } from 'lucide-react';
import { api } from '../api';

export default function CustomerVehicles({ vehicles, onVehicleAdded, onVehicleDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reg_no: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'Petrol',
    mileage: 15000,
    color: 'Standard'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.createVehicle(formData);
      if (res.success) {
        setShowModal(false);
        setFormData({
          reg_no: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          fuel_type: 'Petrol',
          mileage: 15000,
          color: 'Standard'
        });
        if (onVehicleAdded) onVehicleAdded();
      }
    } catch (err) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, regNo) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${regNo}?`)) return;
    try {
      const res = await api.deleteVehicle(id);
      if (res.success && onVehicleDeleted) {
        onVehicleDeleted(id);
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Vehicle Garage</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage registered cars, specs, and scheduled maintenance records
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Register New Car
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Car size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Vehicles Registered</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Add your car to easily schedule service visits and track work in real-time.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Vehicle Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {vehicles.map(v => {
            const query = (v.make + ' ' + v.model).toLowerCase();
            let carImg = '/images/car_suv.jpg';
            if (query.includes('creta')) {
              carImg = '/images/hyundai_creta.jpg';
            } else if (query.includes('city') || query.includes('honda')) {
              carImg = '/images/honda_city.jpg';
            } else if (query.includes('sedan')) {
              carImg = '/images/car_sedan.jpg';
            }
            return (
              <div key={v.id} className="glass-card" style={{ overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '150px', position: 'relative', overflow: 'hidden', background: '#070b14' }}>
                  <img
                    src={carImg}
                    alt={`${v.make} ${v.model}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)'
                  }} />
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#60a5fa',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {v.reg_no}
                  </span>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{v.make} {v.model}</h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.color || 'Standard Color'}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(v.id, v.reg_no)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Remove vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: '0.85rem 0',
                    margin: '0.75rem 0',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} color="#60a5fa" />
                      <span>Year: <strong>{v.year}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Fuel size={14} color="#f59e0b" />
                      <span>Fuel: <strong>{v.fuel_type}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Gauge size={14} color="#10b981" />
                      <span>Odo: <strong>{v.mileage?.toLocaleString()} km</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <ShieldCheck size={14} color="#a855f7" />
                      <span>Services: <strong>{v.service_count || 0}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register Vehicle</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: '1.5rem' }}>
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  License Plate / Reg No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS 09 EA 1234"
                  className="glass-input"
                  style={{ textTransform: 'uppercase' }}
                  value={formData.reg_no}
                  onChange={e => setFormData({ ...formData, reg_no: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Make / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyundai, Tata, Honda"
                    className="glass-input"
                    value={formData.make}
                    onChange={e => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creta SX, Nexon EV"
                    className="glass-input"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    className="glass-input"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Fuel Type
                  </label>
                  <select
                    className="glass-input"
                    value={formData.fuel_type}
                    onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                  >
                    <option value="Petrol" style={{ background: '#0f172a' }}>Petrol</option>
                    <option value="Diesel" style={{ background: '#0f172a' }}>Diesel</option>
                    <option value="Electric" style={{ background: '#0f172a' }}>Electric (EV)</option>
                    <option value="Hybrid" style={{ background: '#0f172a' }}>Hybrid</option>
                    <option value="CNG" style={{ background: '#0f172a' }}>CNG</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Current Odometer (km)
                  </label>
                  <input
                    type="number"
                    className="glass-input"
                    value={formData.mileage}
                    onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Phantom Black"
                    className="glass-input"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
              >
                {loading ? 'Saving Vehicle...' : 'Register to Garage'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
