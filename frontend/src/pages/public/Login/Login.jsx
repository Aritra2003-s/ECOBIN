import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import useToast from '../../../hooks/useToast';
import ecobinLogo from '../../../assets/logo.png';
import './ModernLogin.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialRoleParam = queryParams.get('role');
  const redirectParam = queryParams.get('redirect');

  const [activeRole, setActiveRole] = useState(initialRoleParam === 'admin' ? 'admin' : 'user');

  // Update form placeholders & presets when role changes
  useEffect(() => {
    if (initialRoleParam === 'admin') {
      setActiveRole('admin');
    }
  }, [initialRoleParam]);

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setErrors({});
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setForm({
        email: 'admin@ecobin.com',
        password: 'password123',
      });
      setActiveRole('admin');
      toast.info('Filled demo Administrator credentials');
    } else {
      setForm({
        email: 'user@ecobin.com',
        password: 'password123',
      });
      setActiveRole('user');
      toast.info('Filled demo Citizen credentials');
    }
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email address is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      if (!user || !user.role) {
        throw new Error('User role not found. Please contact support.');
      }

      toast.success(`Welcome back, ${user.name || 'User'}!`);

      const userRole = (user.role || 'user').toLowerCase();

      if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="login-shell">
      {/* ── Left Side: SaaS Brand & Telemetry Panel ─────────────── */}
      <motion.section
        className="login-brand-panel"
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-brand-inner">
          <Link to="/" className="login-brand-logo-link">
            <div className="login-logo-mark">
              <img src={ecobinLogo} alt="EcoBin" />
            </div>
            <div className="login-logo-text">
              <strong>ECOBIN</strong>
              <span>Waste Intelligence Platform</span>
            </div>
          </Link>

          <div className="login-brand-hero">
            <div className="glass-pill login-pill">
              <span className="pulse-dot"></span>
              <span>{activeRole === 'admin' ? 'Operations Console' : 'Citizen Portal'}</span>
            </div>

            <h1>
              {activeRole === 'admin' ? (
                <>
                  Municipal Control & <span className="text-gradient-emerald">Fleet Logistics.</span>
                </>
              ) : (
                <>
                  Smart Recycling & <span className="text-gradient-emerald">On-Demand Pickups.</span>
                </>
              )}
            </h1>

            <p>
              {activeRole === 'admin'
                ? 'Supervise real-time bin sensor grids, dispatch driver routes, and export certified ESG waste analytics.'
                : 'Classify materials with Vision AI, schedule flexible residential pickups, and track city collection progress.'}
            </p>
          </div>

          {/* Quick Role Capability Badges */}
          <div className="login-capabilities">
            {activeRole === 'admin' ? (
              <>
                <div className="capability-card glass-card">
                  <span className="cap-icon">⚡</span>
                  <div>
                    <strong>Predictive Analytics</strong>
                    <span>AI-powered overflow alerts & route graphs</span>
                  </div>
                </div>
                <div className="capability-card glass-card">
                  <span className="cap-icon">🛡️</span>
                  <div>
                    <strong>Fleet & User Governance</strong>
                    <span>Manage municipal staff, wards, and drivers</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="capability-card glass-card">
                  <span className="cap-icon">📸</span>
                  <div>
                    <strong>Neural Waste Classifier</strong>
                    <span>Sub-second disposal guidance with confidence score</span>
                  </div>
                </div>
                <div className="capability-card glass-card">
                  <span className="cap-icon">🚛</span>
                  <div>
                    <strong>Live GPS Pickup Tracking</strong>
                    <span>Real-time truck arrival & photo validation</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="login-brand-footer">
            <span className="status-live-dot"></span>
            <span>Zero-Trust Role-Based Authentication Protected</span>
          </div>
        </div>
      </motion.section>

      {/* ── Right Side: Glassmorphic Auth Form ─────────────────── */}
      <motion.section
        className="login-form-panel"
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-form-header-nav">
          <span>New to EcoBin?</span>
          <Link to={`/signup?role=${activeRole}`} className="btn-link-pill">
            Create Account →
          </Link>
        </div>

        <div className="login-form-card glass-panel">
          {/* Role Switcher Tabs */}
          <div className="login-role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${activeRole === 'user' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('user')}
            >
              <span className="role-tab-icon">🌿</span>
              <span>Citizen User</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('admin')}
            >
              <span className="role-tab-icon">⚡</span>
              <span>Municipal Admin</span>
            </button>
          </div>

          <div className="login-card-header">
            <h2>
              {activeRole === 'admin' ? 'Admin Portal Sign In' : 'Citizen Sign In'}
            </h2>
            <p>
              Enter your credentials to access your {activeRole === 'admin' ? 'administrative' : 'user'} dashboard.
            </p>
          </div>

          {/* 1-Click Fast Demo Credentials Helper */}
          <div className="demo-credentials-helper">
            <span className="demo-label">Quick Testing:</span>
            <button
              type="button"
              className="btn-demo-quick"
              onClick={() => handleDemoFill(activeRole)}
            >
              ⚡ Use Demo {activeRole === 'admin' ? 'Admin' : 'Citizen'} Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder={activeRole === 'admin' ? 'admin@ecobin.com' : 'user@ecobin.com'}
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="label-with-action">
                <label className="form-label">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Please contact support or admin to reset credentials.'); }} className="link-muted">
                  Forgot?
                </a>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
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

            <div className="login-remember-row">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Keep me signed in on this device</span>
              </label>
            </div>

            <motion.button
              type="submit"
              className="btn-saas-submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to {activeRole === 'admin' ? 'Admin Portal' : 'Citizen Dashboard'}</span>
                  <span>→</span>
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="login-panel-footer">
          <span>© 2026 EcoBin Inc. • Secured with RBAC Protocol</span>
        </div>
      </motion.section>
    </div>
  );
}