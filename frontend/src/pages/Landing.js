import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '🩺', title: 'Smart Diagnosis', desc: 'Enter symptoms, get instant disease predictions with confidence scores' },
  { icon: '🐾', title: 'Pet Profiles', desc: 'Manage multiple pets with photos, breeds, and health histories' },
  { icon: '💉', title: 'Vaccine Reminders', desc: 'Never miss a vaccination with smart scheduling and reminders' },
  { icon: '📊', title: 'Health Dashboard', desc: 'Visual charts showing your pet\'s health trends over time' },
  { icon: '📅', title: 'Vet Booking', desc: 'Book appointments with vets at your preferred date and time' },
  { icon: '🚨', title: 'Emergency Help', desc: 'One-tap emergency alerts with nearest vet and first aid tips' },
  { icon: '💬', title: 'Community Forum', desc: 'Connect with other pet owners, share experiences and advice' },
  { icon: '🗂️', title: 'Medical Records', desc: 'Upload and store all prescriptions, reports, and lab results' },
  { icon: '💚', title: 'Care Suggestions', desc: 'Personalized diet, exercise, and care tips based on breed & age' },
];

export default function Landing() {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="paw-float paw-1">🐾</div>
          <div className="paw-float paw-2">🐾</div>
          <div className="paw-float paw-3">🐾</div>
          <div className="paw-float paw-4">🐾</div>
        </div>

        <div className="hero-content">
          <div className="hero-badge animate-on-scroll">
            <span>🌿</span> Your Pet's Health, Our Priority
          </div>

          <div className="brand-logo animate-on-scroll delay-1">
            <div className="logo-paw">🐾</div>
            <h1 className="hero-title">Paw Prints</h1>
          </div>

          <p className="hero-subtitle animate-on-scroll delay-2">
            The complete health monitoring & diagnosis platform<br />
            designed with love for your furry family members
          </p>

          <div className="hero-actions animate-on-scroll delay-3">
            <Link to="/register" className="btn-hero-primary">
              Get Started Free 🐶
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Sign In
            </Link>
          </div>

          <div className="hero-stats animate-on-scroll delay-4">
            <div className="stat"><span className="stat-num">14+</span><span className="stat-label">Features</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">100%</span><span className="stat-label">Free to Use</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">24/7</span><span className="stat-label">Emergency Help</span></div>
          </div>
        </div>

        <div className="hero-visual animate-on-scroll delay-2">
          <div className="hero-card-stack">
            <div className="hero-card card-1">
              <div className="hc-icon">🩺</div>
              <div>
                <div className="hc-title">Diagnosis Result</div>
                <div className="hc-sub">Kennel Cough — 80% confidence</div>
              </div>
              <div className="hc-badge mild">Mild</div>
            </div>
            <div className="hero-card card-2">
              <div className="hc-icon">🐶</div>
              <div>
                <div className="hc-title">Buddy</div>
                <div className="hc-sub">Golden Retriever · 3 yrs</div>
              </div>
              <div className="hc-status">✓ Healthy</div>
            </div>
            <div className="hero-card card-3">
              <div className="hc-icon">💉</div>
              <div>
                <div className="hc-title">Vaccine Due</div>
                <div className="hc-sub">Rabies — in 5 days</div>
              </div>
              <div className="hc-bell">🔔</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-header animate-on-scroll">
          <h2>Everything your pet needs</h2>
          <p>A complete ecosystem for pet healthcare management</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className={`feature-card animate-on-scroll delay-${(i % 3) + 1}`} key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section animate-on-scroll">
        <div className="cta-inner">
          <div className="cta-paws">🐾 🐾 🐾</div>
          <h2>Ready to give your pet the best care?</h2>
          <p>Join thousands of pet owners who trust Paw Prints for their pet's health</p>
          <Link to="/register" className="btn-hero-primary large">
            Create Free Account 🐾
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span>🐾</span>
          <span>Paw Prints</span>
        </div>
        <p>Made with 💚 for pets everywhere</p>
      </footer>
    </div>
  );
}
