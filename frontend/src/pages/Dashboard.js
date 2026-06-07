import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/config';
import './Dashboard.css';

const quickLinks = [
  { path: '/diagnosis', icon: '🩺', label: 'Diagnose Pet', color: '#e8f5e9' },
  { path: '/appointments', icon: '📅', label: 'Book Appointment', color: '#e3f2fd' },
  { path: '/vaccinations', icon: '💉', label: 'Vaccinations', color: '#fce4ec' },
  { path: '/medical-records', icon: '🗂️', label: 'Medical Records', color: '#fff8e1' },
  { path: '/care-suggestions', icon: '💚', label: 'Care Tips', color: '#e8f5e9' },
  { path: '/forum', icon: '💬', label: 'Community', color: '#f3e5f5' },
  { path: '/emergency', icon: '🚨', label: 'Emergency', color: '#ffebee' },
  { path: '/health-history', icon: '📊', label: 'Health History', color: '#e0f7fa' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);

  useEffect(() => {
    axios.get('/api/pets').then(r => setPets(r.data)).catch(() => {});
    axios.get('/api/vaccinations/reminders/upcoming').then(r => setReminders(r.data)).catch(() => {});
    axios.get('/api/appointments').then(r => setAppointments(r.data.slice(0, 3))).catch(() => {});
    axios.get('/api/diagnosis').then(r => setRecentDiagnoses(r.data.slice(0, 3))).catch(() => {});
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's what's happening with your pets today</p>
        </div>
        <Link to="/pets" className="btn-primary">+ Add Pet</Link>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">🐶</div>
          <div><div className="stat-val">{pets.length}</div><div className="stat-lbl">My Pets</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div><div className="stat-val">{reminders.length}</div><div className="stat-lbl">Vaccine Reminders</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div><div className="stat-val">{appointments.length}</div><div className="stat-lbl">Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🩺</div>
          <div><div className="stat-val">{recentDiagnoses.length}</div><div className="stat-lbl">Recent Diagnoses</div></div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="section-title">Quick Actions</div>
      <div className="quick-links">
        {quickLinks.map(q => (
          <Link to={q.path} key={q.path} className="quick-link" style={{ background: q.color }}>
            <span className="ql-icon">{q.icon}</span>
            <span className="ql-label">{q.label}</span>
          </Link>
        ))}
      </div>

      <div className="dash-grid">
        {/* My Pets */}
        <div className="card">
          <div className="card-head">
            <h3>🐶 My Pets</h3>
            <Link to="/pets" className="view-all">View All</Link>
          </div>
          {pets.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🐾</div>
              <h3>No pets yet</h3>
              <p>Add your first pet to get started</p>
              <Link to="/pets" className="btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>Add Pet</Link>
            </div>
          ) : (
            <div className="pet-list">
              {pets.map(pet => (
                <div className="pet-item" key={pet._id}>
                  <div className="pet-avatar">{pet.photo ? <img src={assetUrl(pet.photo)} alt={pet.name} /> : '🐶'}</div>
                  <div>
                    <div className="pet-name">{pet.name}</div>
                    <div className="pet-info">{pet.breed} · {pet.age} yr{pet.age !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vaccine Reminders */}
        <div className="card">
          <div className="card-head">
            <h3>💉 Upcoming Vaccines</h3>
            <Link to="/vaccinations" className="view-all">View All</Link>
          </div>
          {reminders.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">✅</div>
              <h3>All up to date!</h3>
              <p>No upcoming vaccines in next 30 days</p>
            </div>
          ) : (
            reminders.map(r => (
              <div className="reminder-item" key={r._id}>
                <div className="reminder-icon">💉</div>
                <div>
                  <div className="reminder-name">{r.vaccineName}</div>
                  <div className="reminder-pet">{r.pet?.name}</div>
                </div>
                <div className="reminder-date">
                  {new Date(r.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Diagnoses */}
        <div className="card">
          <div className="card-head">
            <h3>🩺 Recent Diagnoses</h3>
            <Link to="/health-history" className="view-all">View All</Link>
          </div>
          {recentDiagnoses.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🌿</div>
              <h3>No diagnoses yet</h3>
              <p>Use the diagnosis tool to check your pet's symptoms</p>
            </div>
          ) : (
            recentDiagnoses.map(d => (
              <div className="diag-item" key={d._id}>
                <div>
                  <div className="diag-pet">{d.pet?.name}</div>
                  <div className="diag-disease">{d.predictedDiseases[0]?.disease || 'No prediction'}</div>
                </div>
                <span className={`badge badge-${d.severity === 'Severe' ? 'red' : d.severity === 'Moderate' ? 'yellow' : 'green'}`}>
                  {d.severity}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-head">
            <h3>📅 Appointments</h3>
            <Link to="/appointments" className="view-all">View All</Link>
          </div>
          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">📅</div>
              <h3>No appointments</h3>
              <p>Book a vet visit for your pet</p>
            </div>
          ) : (
            appointments.map(a => (
              <div className="appt-item" key={a._id}>
                <div className="appt-icon">🏥</div>
                <div>
                  <div className="appt-vet">{a.vetName}</div>
                  <div className="appt-date">{new Date(a.date).toLocaleDateString()} · {a.time}</div>
                </div>
                <span className={`badge badge-${a.status === 'Confirmed' ? 'green' : a.status === 'Cancelled' ? 'red' : 'yellow'}`}>
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
