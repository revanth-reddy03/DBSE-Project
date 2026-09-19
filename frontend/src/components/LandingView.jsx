import React, { useState, useEffect } from 'react';
import {
  Car, ShieldCheck, Wrench, Clock, CheckCircle, ArrowRight,
  Sparkles, Bell, FileText, Database, Layers, Award
} from 'lucide-react';
import { api } from '../api';

export default function LandingView({ user, onGoToDashboard, onOpenAuth }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.getServices()
      .then(res => {
        if (res.success) setServices(res.services);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 1rem 3rem',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(37, 99, 235, 0.12)',
          borderRadius: '999px',
          border: '1px solid rgba(37, 99, 235, 0.3)',
          color: '#60a5fa',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> Certified Automotive Engineering & Multi-Bay Diagnostic Network
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Vehicle Service Booking & <br />
          <span style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Real-Time Tracking System
          </span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Automated slot reservations, precision diagnostics, and real-time 6-stage telemetry tracking for your vehicle from check-in to delivery.
        </p>

        {/* Customer CTA Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem'
        }}>
          {user ? (
            <button
              onClick={onGoToDashboard}
              className="btn btn-primary"
              style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
            >
              <Car size={20} /> Go to My Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="btn btn-primary"
                style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
              >
                <Car size={20} /> Book a Service Now
              </button>
              <button
                onClick={onOpenAuth}
                className="btn btn-secondary"
                style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
              >
                <Clock size={20} /> Track Your Vehicle
              </button>
            </>
          )}
        </div>

        {/* Hero Workshop Image Showcase */}
        <div style={{
          position: 'relative',
          maxWidth: '1080px',
          margin: '0 auto 3rem',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)'
        }}>
          <img
            src="/images/workshop_hero.jpg"
            alt="Apex Auto Hub Workshop"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '480px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.5rem 2rem',
            background: 'linear-gradient(to top, rgba(11, 17, 32, 0.95), transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span className="badge badge-ready_for_delivery" style={{ marginBottom: '6px' }}>
                HYDRAULIC BAYS & HIGH-PRECISION LIFTS
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Apex Central Automobile Technology Center</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Equipped with multi-center distributed scheduling & live bay telemetry
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#60a5fa' }}>
              <span>✓ 24 Concurrent Bays</span>
              <span>✓ OEM Certified Tools</span>
            </div>
          </div>
        </div>

        {/* Architecture Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={16} color="#38bdf8" /> MySQL 8.0 Relational Engine
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="#10b981" /> Node.js & Express REST API
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#60a5fa" /> React 18 Dynamic Frontend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={16} color="#f59e0b" /> SMS & Nodemailer Alerts
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights with Photos */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Core System Modules</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Engineered to overcome phone-call delays, scheduling conflicts, and lack of visibility
          </p>
        </div>

        {/* 2-Column Visual Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img
              src="/images/diagnostics.jpg"
              alt="Computerized Engine Diagnostics"
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-inspection" style={{ marginBottom: '8px' }}>
                  DIAGNOSTIC TELEMETRY
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Computerized Diagnostics & Live Logs</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  OBD-II telemetry scan reports, ECU parameter evaluation, and live stage progression transparently updated in MySQL audit logs.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img
              src="/images/delivery_ready.jpg"
              alt="Quality Check & Detailing Suite"
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-ready_for_delivery" style={{ marginBottom: '8px' }}>
                  DELIVERY SUITE
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quality Assurance & Digital Handover</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Rigorous multi-point quality check, detailing finish, instant GST invoice generation, and customer pickup notification dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1rem' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Automated Slot Scheduling</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Dynamic capacity algorithm prevents double-booking across multiple service stations in Hyderabad with atomic MySQL transactions.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1rem' }}>
              <Car size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Real-Time 6-Stage Tracking</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Customers observe their vehicle transition through Check-in $\to$ Diagnostics $\to$ Repair $\to$ Quality Check $\to$ Ready for Delivery.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1rem' }}>
              <Bell size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Automated SMS & Email Alerts</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Instant notifications dispatched at every critical milestone, keeping vehicle owners informed with live progress notes.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '1rem' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Digital Invoices & History</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Automated itemized invoices with GST breakdown, part numbers, labor charges, and complete printable PDF export.
            </p>
          </div>
        </div>
      </section>

      {/* Services Catalog Preview */}
      {services.length > 0 && (
        <section style={{ padding: '2rem 0 5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Available Automotive Services</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Transparent pricing and estimated completion times
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {services.slice(0, 6).map(s => (
              <div key={s.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</span>
                  <span style={{ fontSize: '0.72rem', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {s.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {s.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱ ~{s.estimated_hours}h</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>₹{parseFloat(s.base_price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
