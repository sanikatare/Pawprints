import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🐾');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-paw">🐾</span>
          <h1>Paw Prints</h1>
          <p>Your pet's health companion</p>
        </div>
        <div className="auth-illustration">🐶 🐱 🐰 🐹</div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>Welcome Back 👋</h2>
          <p className="auth-sub">Sign in to continue to Paw Prints</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In 🐾'}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
