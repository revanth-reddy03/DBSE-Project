import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, Clock, PlusCircle, AlertCircle, RefreshCw, X, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { api } from '../api';

const STAGES = [
  'booked',
  'checked_in',
  'inspection',
  'repair',
  'quality_check',
  'ready_for_delivery',
  'completed'
];

export default function StaffWorkbench({ user }) {
  const [jobs, setJobs] = useState([]);
  const [filterMode, setFilterMode] = useState('assigned'); // 'assigned' or 'all'
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [statusModalJob, setStatusModalJob] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [comments, setComments] = useState('');
  const [estHours, setEstHours] = useState(2);
  const [updating, setUpdating] = useState(false);

  // Parts modal state
  const [partsModalJob, setPartsModalJob] = useState(null);
  const [partData, setPartData] = useState({
    description: '',
    item_type: 'part',
    quantity: 1,
    unit_price: ''
  });
  const [addingPart, setAddingPart] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = filterMode === 'assigned' ? { assignedOnly: true } : {};
      const res = await api.getBookings(params);
      if (res.success) {
        setJobs(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load staff jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filterMode]);

  const openStatusModal = (job) => {
    setStatusModalJob(job);
    // Suggest next logical stage
    const currentIdx = STAGES.indexOf(job.status);
    const nextStage = currentIdx >= 0 && currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : job.status;
    setTargetStatus(nextStage);
    setComments('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalJob) return;

    setUpdating(true);
    try {
      const res = await api.updateJobStatus(
        statusModalJob.id,
        targetStatus,
        comments,
        estHours
      );
      if (res.success) {
        alert(`Status updated to '${targetStatus.replace(/_/g, ' ')}' and customer notified!`);
        setStatusModalJob(null);
        fetchJobs();
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partsModalJob) return;

    setAddingPart(true);
    try {
      const res = await api.addPartsOrLabor(partsModalJob.id, partData);
      if (res.success) {
        alert('Part / labor added to service invoice successfully!');
        setPartsModalJob(null);
        setPartData({ description: '', item_type: 'part', quantity: 1, unit_price: '' });
        fetchJobs();
      }
    } catch (err) {
      alert('Failed to add part: ' + err.message);
    } finally {
      setAddingPart(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={22} color="#f59e0b" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Technician & Service Bay Workbench</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Logged in as <strong>{user?.name}</strong> • Real-time bay operations & diagnostic records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterMode('assigned')}
            className={`btn btn-sm ${filterMode === 'assigned' ? 'btn-primary' : 'btn-secondary'}`}
          >
            My Assigned Jobs
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Active Bay Vehicles
          </button>
          <button onClick={fetchJobs} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading service bay jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No Jobs In Queue</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {filterMode === 'assigned' ? 'No vehicles currently assigned to your bay. Switch to "All Active Bay Vehicles" to view all.' : 'No active vehicles currently undergoing service.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                      #{job.booking_code}
                    </span>
                    <span className={`badge badge-${job.status}`}>
                      {job.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {job.make} {job.model} ({job.year}) • <span style={{ color: '#38bdf8' }}>{job.reg_no}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Customer: {job.customer_name} ({job.customer_phone || job.customer_email})
                  </div>
                </div>

                {/* Mechanic action controls */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openStatusModal(job)}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle size={14} /> Update Stage / QC
                  </button>

                  <button
                    onClick={() => setPartsModalJob(job)}
                    className="btn btn-secondary btn-sm"
                  >
                    <PlusCircle size={14} /> Log Parts & Labor
                  </button>
                </div>
              </div>

              {/* Station and Notes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <div style={{ fontWeight: 600 }}>{job.service_center_name}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Slot Time:</span>
                  <div style={{ fontWeight: 600 }}>{job.slot_time}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Lead Mechanic:</span>
                  <div style={{ fontWeight: 600, color: job.mechanic_name ? '#34d399' : '#fbbf24' }}>
                    {job.mechanic_name || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Current Bill Total:</span>
                  <div style={{ fontWeight: 700, color: '#60a5fa' }}>₹{parseFloat(job.total_amount).toFixed(2)}</div>
                </div>
              </div>

              {job.notes && (
                <div style={{ fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <strong>Customer Symptoms:</strong> {job.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalJob && (
        <div className="modal-overlay" onClick={() => setStatusModalJob(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Advance Vehicle Stage</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {statusModalJob.make} {statusModalJob.model} ({statusModalJob.reg_no})
                </p>
              </div>
              <button onClick={() => setStatusModalJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Target Milestone Stage:
                </label>
                <select
                  className="glass-input"
                  value={targetStatus}
                  onChange={e => setTargetStatus(e.target.value)}
                >
                  <option value="checked_in" style={{ background: '#0f172a' }}>1. Checked In (Vehicle at bay)</option>
                  <option value="inspection" style={{ background: '#0f172a' }}>2. Inspection (Diagnostic analysis)</option>
                  <option value="repair" style={{ background: '#0f172a' }}>3. Repair & Maintenance (Underway)</option>
                  <option value="quality_check" style={{ background: '#0f172a' }}>4. Quality Check (Safety audit)</option>
                  <option value="ready_for_delivery" style={{ background: '#0f172a' }}>5. Ready For Delivery (Final wash)</option>
                  <option value="completed" style={{ background: '#0f172a' }}>6. Completed (Handover done)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Technician Notes / Inspection Remarks (dispatched to customer SMS/email):
                </label>
                <textarea
                  required
                  rows="3"
                  className="glass-input"
                  placeholder="e.g. Inspection found worn brake pads. Replacing front ceramic set and ongoing fluid check..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
              >
                {updating ? 'Dispatched milestone...' : 'Confirm Stage Progress & Alert Customer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOG PARTS / LABOR MODAL */}
      {partsModalJob && (
        <div className="modal-overlay" onClick={() => setPartsModalJob(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Spare Part or Extra Labor</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Appends to Digital Invoice #{partsModalJob.booking_code}
                </p>
              </div>
              <button onClick={() => setPartsModalJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPart} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch Front Ceramic Brake Pads"
                  className="glass-input"
                  value={partData.description}
                  onChange={e => setPartData({ ...partData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Type
                  </label>
                  <select
                    className="glass-input"
                    value={partData.item_type}
                    onChange={e => setPartData({ ...partData, item_type: e.target.value })}
                  >
                    <option value="part" style={{ background: '#0f172a' }}>Spare Part</option>
                    <option value="labor" style={{ background: '#0f172a' }}>Additional Labor</option>
                    <option value="consumable" style={{ background: '#0f172a' }}>Consumable / Oil</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="glass-input"
                    value={partData.quantity}
                    onChange={e => setPartData({ ...partData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1850"
                  className="glass-input"
                  value={partData.unit_price}
                  onChange={e => setPartData({ ...partData, unit_price: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={addingPart}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
              >
                {addingPart ? 'Adding...' : 'Add Item to Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
