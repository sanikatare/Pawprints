import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Paw Prints 🐾');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h2>Create Account 🐾</h2>
          <p className="auth-sub">Join thousands of happy pet owners</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account 🐾'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
