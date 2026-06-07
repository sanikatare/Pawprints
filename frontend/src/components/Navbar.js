import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import GlobalSearch from '../pages/GlobalSearch.jsx';
import './Navbar.css';

// SVG icon components
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  dashboard:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  pets:         "M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5M12 14c-3.5 0-6 2-6 3s1 2 6 2 6-1 6-2-2.5-3-6-3z",
  vetai:        "M12 2a10 10 0 110 20A10 10 0 0112 2z M9 9h.01 M15 9h.01 M9.5 15s1.5 2 2.5 2 2.5-2 2.5-2",
  diagnose:     "M22 12h-4l-3 9L9 3l-3 9H2",
  appointments: "M8 2v3 M16 2v3 M3 8h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  vaccines:     "M7 11l5-5 M6 16l2-2 M8.5 13.5l1.5-1.5 M17 7l-1.5 1.5 M19 5l-2 2 M13 13l1 8-4.5-5.5L4 14l8-9 1 8",
  medications:  "M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v2 M16 19h6 M19 16v6",
  weight:       "M12 2a3 3 0 100 6 3 3 0 000-6z M2 20h20l-3-14H5L2 20z",
  records:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  telemedicine: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  history:      "M3 3v5h5 M3.05 13A9 9 0 106 5.3L3 8",
  careTips:     "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  community:    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  emergency:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  admin:        "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  search:       "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  close:        "M18 6L6 18M6 6l12 12",
  menu:         "M3 12h18M3 6h18M3 18h18",
  logout:       "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  pawprint:     "M11 6.5C11 5.12 9.88 4 8.5 4S6 5.12 6 6.5 7.12 9 8.5 9 11 7.88 11 6.5z M18 6.5C18 5.12 16.88 4 15.5 4S13 5.12 13 6.5 14.12 9 15.5 9 18 7.88 18 6.5z M8 13c0-1.1.4-2.1 1.1-2.8C6.5 10.5 4 12.5 4 15s2 4 5 4.9c.3.1.7.1 1 .1h4c.3 0 .7 0 1-.1 3-.9 5-2.9 5-4.9 0-2.5-2.5-4.5-6.1-4.2C13.6 10.9 14 11.9 14 13",
};

const navItems = [
  { path: '/dashboard',       label: 'Dashboard',    iconKey: 'dashboard' },
  { path: '/pets',            label: 'My Pets',       iconKey: 'pets' },
  { path: '/ai-assistant',   label: 'VetAI',          iconKey: 'vetai' },
  { path: '/diagnosis',       label: 'Diagnose',     iconKey: 'diagnose' },
  { path: '/appointments',   label: 'Appointments',  iconKey: 'appointments' },
  { path: '/vaccinations',   label: 'Vaccines',       iconKey: 'vaccines' },
  { path: '/medications',    label: 'Medications',   iconKey: 'medications' },
  { path: '/weight-tracker', label: 'Weight',         iconKey: 'weight' },
  { path: '/medical-records',label: 'Records',        iconKey: 'records' },
  { path: '/telemedicine',   label: 'Telemedicine',  iconKey: 'telemedicine' },
  { path: '/health-history', label: 'History',        iconKey: 'history' },
  { path: '/care-suggestions',label: 'Care Tips',    iconKey: 'careTips' },
  { path: '/forum',          label: 'Community',      iconKey: 'community' },
  { path: '/emergency',      label: 'Emergency',     iconKey: 'emergency', emergency: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    if (e.key === 'Escape') setSearchOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">
            <span className="brand-icon">
              <Icon d={Icons.pawprint} size={22} />
            </span>
            <span className="brand-name">Paw Prints</span>
          </Link>
        </div>

        <button
          className="search-trigger"
          onClick={() => setSearchOpen(true)}
          title="Search (Ctrl+K)"
        >
          <Icon d={Icons.search} size={14} />
          <span>Search</span>
          <kbd>Ctrl K</kbd>
        </button>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <Icon d={menuOpen ? Icons.close : Icons.menu} size={20} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''} ${item.emergency ? 'emergency-link' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon"><Icon d={Icons[item.iconKey]} size={15} /></span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <span className="nav-icon"><Icon d={Icons.admin} size={15} /></span>
              <span className="nav-label">Admin</span>
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <NotificationBell />
          <span className="user-name">{user?.name?.split(' ')[0]}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <Icon d={Icons.logout} size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
