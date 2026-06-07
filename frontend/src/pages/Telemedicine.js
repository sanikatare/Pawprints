import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🤖', title: 'VetAI Assistant', desc: 'Get instant AI-powered health guidance for your pet', path: '/ai-assistant' },
  { icon: '📅', title: 'Book Appointment', desc: 'Schedule a virtual or in-person vet consultation', path: '/appointments' },
  { icon: '🩺', title: 'Symptom Checker', desc: 'Run a diagnosis based on reported symptoms', path: '/diagnosis' },
  { icon: '🗂️', title: 'Share Records', desc: 'Upload and share medical records with your vet', path: '/medical-records' },
];

export default function Telemedicine() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📹 Telemedicine</h1>
          <p>Connect with veterinary care from the comfort of your home</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #e8f5e9, #f0fdf4)', border: '1px solid #bbf7d0' }}>
        <h3 style={{ marginBottom: 8 }}>Virtual Pet Care</h3>
        <p style={{ color: '#555', lineHeight: 1.6, margin: 0 }}>
          Paw Prints telemedicine helps you get quick answers, prepare for vet visits, and manage your pet&apos;s health remotely.
          Use VetAI for immediate guidance, book appointments for professional consultations, and keep all records in one place.
        </p>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        {features.map((f) => (
          <Link to={f.path} key={f.path} className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.desc}</div>
          </Link>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, borderLeft: '4px solid #dc2626' }}>
        <h4 style={{ color: '#dc2626', marginBottom: 8 }}>When to seek emergency care</h4>
        <p style={{ fontSize: '0.9rem', color: '#555', margin: 0, lineHeight: 1.6 }}>
          Telemedicine is not suitable for emergencies. If your pet has difficulty breathing, seizures, severe bleeding,
          or sudden collapse, contact an emergency vet immediately.
        </p>
        <Link to="/emergency" className="btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
          Emergency Resources
        </Link>
      </div>
    </div>
  );
}
