import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import useToast from '../../../hooks/useToast';
import ecobinLogo from '../../../assets/logo.png';
import './ModernSignup.css';

export default function Signup() {
  const location = useLocation();
  const queryRole = new URLSearchParams(location.search).get('role');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: queryRole === 'admin' ? 'admin' : 'user',
  });
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email address is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!termsAccepted) e.terms = 'Please accept the terms of service';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      });

      toast.success(`Account created! Welcome, ${user.name || 'User'}!`);

      const userRole = (user.role || form.role || 'user').toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const setRole = (role) => setForm((p) => ({ ...p, role }));

  return (
    <div className="signup-shell">
      {/* ── Left Side: SaaS Brand & Mission Panel ──────────────── */}
      <motion.section
        className="signup-brand-panel"
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="signup-brand-inner">
          <Link to="/" className="signup-brand-logo-link">
            <div className="signup-logo-mark">
              <img src={ecobinLogo} alt="EcoBin" />
            </div>
            <div className="signup-logo-text">
              <strong>ECOBIN</strong>
              <span>Circular Waste Intelligence</span>
            </div>
          </Link>

          <div className="signup-brand-hero">
            <div className="glass-pill signup-pill">
              <span className="pulse-dot"></span>
              <span>Next-Gen Ecological Infrastructure</span>
            </div>

            <h1>
              Join the Future of <br />
              <span className="text-gradient-emerald">Sustainable Operations.</span>
            </h1>

            <p>
              Create your account to unlock AI-assisted waste sorting, automated collection
              schedules, and municipal fleet intelligence.
            </p>
          </div>

          <div className="signup-benefits-list">
            <div className="signup-benefit-card glass-card">
              <span className="benefit-icon">🌱</span>
              <div>
                <strong>Community Recycling Impact</strong>
                <span>Earn verification credits and view live carbon savings</span>
              </div>
            </div>

            <div className="signup-benefit-card glass-card">
              <span className="benefit-icon">⚡</span>
              <div>
                <strong>Role-Tailored Workflows</strong>
                <span>Optimized UX whether managing city wards or residential sorting</span>
              </div>
            </div>
          </div>

          <div className="signup-brand-footer">
            <span>🔒 Enterprise Grade Data & Privacy Protection</span>
          </div>
        </div>
      </motion.section>

      {/* ── Right Side: Signup Form Panel ─────────────────────── */}
      <motion.section
        className="signup-form-panel"
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="signup-form-header-nav">
          <span>Already registered?</span>
          <Link to={`/login?role=${form.role}`} className="btn-link-pill">
            Sign In →
          </Link>
        </div>

        <div className="signup-form-card glass-panel">
          <div className="signup-card-header">
            <h2>Create Your Account</h2>
            <p>Select your account type to get started with the right portal tools.</p>
          </div>

          {/* Interactive Role Choice Cards */}
          <div className="role-selector-cards">
            <button
              type="button"
              className={`role-card-btn ${form.role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              <div className="role-card-top">
                <span className="role-icon">🌿</span>
                <span className="role-badge">Citizen / Home</span>
              </div>
              <strong>Resident User</strong>
              <p>Waste scanner, pickup bookings & tracking</p>
            </button>

            <button
              type="button"
              className={`role-card-btn ${form.role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <div className="role-card-top">
                <span className="role-icon">⚡</span>
                <span className="role-badge">Admin / Fleet</span>
              </div>
              <strong>Operations Admin</strong>
              <p>Fleet dispatch, users & city analytics</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="signup-form">
            <div className="form-row-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
                {errors.name && <span className="form-error-msg">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="jane@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className="form-error-msg">{errors.password}</span>}
            </div>

            <div className="signup-terms-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span>
                  I agree to the <a href="#terms" className="link-terms">Terms of Service</a> & <a href="#privacy" className="link-terms">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <span className="form-error-msg">{errors.terms}</span>}
            </div>

            <motion.button
              type="submit"
              className="btn-saas-submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span>Provisioning Account...</span>
              ) : (
                <>
                  <span>Create {form.role === 'admin' ? 'Administrator' : 'Citizen'} Account</span>
                  <span>→</span>
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="signup-panel-footer">
          <span>EcoBin Platform • Role-Based Access Control</span>
        </div>
      </motion.section>
    </div>
  );
}