import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="notification-bell" ref={panelRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="notification-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '0.4rem',
          color: 'inherit',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#dc2626',
              color: '#fff',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '1px solid #e8f5e9',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2d6a4f',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.read && markRead(n._id)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #f5f5f5',
                  background: n.read ? '#fff' : '#f0fdf4',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>{n.message}</div>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <div style={{ padding: '0.5rem', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
            <Link
              to="/appointments"
              onClick={() => setOpen(false)}
              style={{ fontSize: '0.78rem', color: '#2d6a4f' }}
            >
              View appointments
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
