import React, { useState, useEffect } from 'react';
import {
  Car, MapPin, Wrench, Calendar, CheckCircle2, ChevronRight,
  ChevronLeft, AlertCircle, Clock, Shield, Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function BookingWizard({ vehicles, onBookingCreated, onGoToVehicles }) {
  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Initial load of centers & services
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, sRes] = await Promise.all([
          api.getServiceCenters(),
          api.getServices()
        ]);
        if (cRes.success && cRes.centers.length > 0) {
          setCenters(cRes.centers);
          setSelectedCenter(cRes.centers[0].id);
        }
        if (sRes.success) {
          setServices(sRes.services);
        }
      } catch (err) {
        console.error('Failed to load centers/services:', err);
      }
    }
    loadData();
  }, []);

  // Update vehicle selection if vehicles array changes
  useEffect(() => {
    if (!selectedVehicle && vehicles.length > 0) {
      setSelectedVehicle(vehicles[0].id);
    }
  }, [vehicles, selectedVehicle]);

  // Fetch real-time slots whenever center or date changes
  useEffect(() => {
    if (selectedCenter && bookingDate) {
      setLoadingSlots(true);
      api.getCenterSlots(selectedCenter, bookingDate)
        .then(res => {
          if (res.success) {
            setSlots(res.slots);
            const firstAvail = res.slots.find(s => s.is_available);
            if (firstAvail) setSelectedSlot(firstAvail.slot_time);
            else setSelectedSlot('');
          }
        })
        .catch(err => console.error('Slot fetch error:', err))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedCenter, bookingDate]);

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(sId => sId !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const calculatedTotal = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + parseFloat(s.base_price), 0);

  const handleConfirmBooking = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        vehicle_id: selectedVehicle,
        service_center_id: selectedCenter,
        booking_date: bookingDate,
        slot_time: selectedSlot,
        service_ids: selectedServices,
        notes
      };

      const res = await api.createBooking(payload);
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        if (onBookingCreated) {
          onBookingCreated(res.booking);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  const chosenVehicleObj = vehicles.find(v => String(v.id) === String(selectedVehicle));
  const chosenCenterObj = centers.find(c => String(c.id) === String(selectedCenter));

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      {/* Wizard Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {[
          { num: 1, title: 'Vehicle' },
          { num: 2, title: 'Center' },
          { num: 3, title: 'Services' },
          { num: 4, title: 'Date & Slot' },
          { num: 5, title: 'Confirm' }
        ].map((s) => (
          <div
            key={s.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: step === s.num ? '#60a5fa' : step > s.num ? '#34d399' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: step === s.num ? '#2563eb' : step > s.num ? '#10b981' : 'rgba(255,255,255,0.06)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem'
            }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span>{s.title}</span>
            {s.num < 5 && <ChevronRight size={16} color="var(--border-subtle)" />}
          </div>
        ))}
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

      {/* STEP 1: VEHICLE SELECTION */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Select Your Vehicle</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Choose which registered car you want to schedule for servicing
          </p>

          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No vehicles found in your garage yet.</p>
              <button onClick={onGoToVehicles} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
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
                const isSelected = String(selectedVehicle) === String(v.id);
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    style={{
                      borderRadius: '14px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={carImg}
                        alt={`${v.make} ${v.model}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#60a5fa',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {v.reg_no}
                      </span>
                    </div>

                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.make} {v.model}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.year} • {v.fuel_type}</div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Odometer: {v.mileage?.toLocaleString()} km
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              disabled={!selectedVehicle}
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Next: Select Service Center <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SERVICE CENTER SELECTION */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Select Service Station</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Pick a convenient Apex Auto Hub center for this appointment
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {centers.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCenter(c.id)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: String(selectedCenter) === String(c.id) ? 'rgba(37, 99, 235, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  border: String(selectedCenter) === String(c.id) ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</span>
                  <span className="badge badge-booked">{c.code}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <MapPin size={14} color="#60a5fa" /> {c.address}, {c.city}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Slot Capacity: {c.capacity_per_slot} concurrent bays
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              disabled={!selectedCenter}
              onClick={() => setStep(3)}
              className="btn btn-primary"
            >
              Next: Select Services <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SERVICE SELECTION */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Choose Services & Packages</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Select one or multiple automotive services for your vehicle
              </p>
            </div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>
                ₹{calculatedTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {services.map(s => {
              const isSelected = selectedServices.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)'
                      }}>
                        {s.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                      {s.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ⏱ ~{s.estimated_hours} hrs
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                      ₹{parseFloat(s.base_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              disabled={selectedServices.length === 0}
              onClick={() => setStep(4)}
              className="btn btn-primary"
            >
              Next: Date & Smart Slot <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DATE & SMART SLOT ALLOCATION */}
      {step === 4 && (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Slot Allocation</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Real-time capacity algorithm ensures guaranteed bay availability without queuing
          </p>

          <div style={{ maxWidth: '300px', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Service Date:
            </label>
            <input
              type="date"
              className="glass-input"
              value={bookingDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setBookingDate(e.target.value)}
            />
          </div>

          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Checking slot capacity...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {slots.map((slot, idx) => {
                const isSelected = selectedSlot === slot.slot_time;
                return (
                  <div
                    key={idx}
                    onClick={() => slot.is_available && setSelectedSlot(slot.slot_time)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      cursor: slot.is_available ? 'pointer' : 'not-allowed',
                      opacity: slot.is_available ? 1 : 0.45,
                      background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Clock size={16} color="#60a5fa" />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{slot.slot_time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Booked: {slot.booked_count}/{slot.max_capacity}
                      </span>
                      <span className={`badge ${slot.is_available ? 'badge-ready_for_delivery' : 'badge-cancelled'}`}>
                        {slot.is_available ? `${slot.available_slots} Left` : 'FULL'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setStep(3)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => setStep(5)}
              className="btn btn-primary"
            >
              Next: Review & Confirm <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & CONFIRM */}
      {step === 5 && (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Review & Confirm Booking</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Please verify your service details before final booking confirmation
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {chosenVehicleObj?.make} {chosenVehicleObj?.model}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  {chosenVehicleObj?.reg_no}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Service Center</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                  {chosenCenterObj?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {chosenCenterObj?.city}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled Slot</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                  {bookingDate}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {selectedSlot}
                </div>
              </div>
            </div>

            {/* Selected Services Tally */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Selected Services:</span>
              <ul style={{ listStyle: 'none', marginTop: '6px', fontSize: '0.85rem' }}>
                {services.filter(s => selectedServices.includes(s.id)).map(s => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                    <span>{s.name}</span>
                    <span style={{ fontWeight: 600 }}>₹{parseFloat(s.base_price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.05rem', fontWeight: 800, color: '#60a5fa' }}>
                <span>Estimated Total:</span>
                <span>₹{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Special Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Special Issues or Symptoms (Optional):
              </label>
              <textarea
                className="glass-input"
                rows="2"
                placeholder="e.g. Brake squeal at low speed, AC cooling slow..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setStep(4)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              disabled={loading}
              onClick={handleConfirmBooking}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              {loading ? 'Confirming Slot...' : 'Confirm & Reserve Slot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
