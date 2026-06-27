import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useToast from '../../../hooks/useToast';

/**
 * Ecobin Login Page - All-in-One Component
 * Includes JSX and optimized scoped CSS logic matching the Signup architecture.
 */
const EcobinLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const roleQuery = new URLSearchParams(location.search).get('role');
  const isAdminFlow = roleQuery === 'admin';

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
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
        throw new Error("User role not found. Please contact support.");
      }

      toast.success(`Welcome back, ${user.name}!`);

      const userRole = user.role.toLowerCase();
      
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={styles.authShell}>
      {/* Brand Panel - Visual Match to Signup Page */}
      <section style={styles.brandPanel}>
        <div style={styles.brandContent}>
          
          {/* UPDATED: Brand Header wrapped in a Link for landing page redirection */}
          <Link to="/" style={styles.logoLink}>
            <div style={styles.brandHeader}>
              <div style={styles.logoMark}>
                <img src="assets/logo.png" alt="Ecobin Logo" style={{ width: '32px', height: '32px' }} />
              </div>
              <div style={styles.brandName}>
                <strong style={styles.brandTitle}>Ecobin</strong>
                <small style={styles.brandSlogan}>Clean cities, better habits</small>
              </div>
            </div>
          </Link>

          <p style={styles.eyebrow}>{isAdminFlow ? 'Admin login' : 'New member'}</p>
          <h1 style={styles.heroTitle}>{isAdminFlow ? 'Sign in as admin' : 'Join the Ecosystem.'}</h1>
          <p style={styles.heroSubtitle}>
            {isAdminFlow 
              ? 'Use your administrator credentials to access the Ecobin management dashboard.' 
              : 'Join Ecobin and make waste reporting, pickup requests, and recycling decisions much easier from day one.'
            }
          </p>

          <div style={styles.highlights}>
            {[
              { icon: '⊕', title: 'Schedule pickups', description: 'Request a collection slot that works for your routine.' },
              { icon: '⚑', title: 'Report cleaner streets', description: 'Send issue reports with richer details and faster follow-up.' },
              { icon: '✦', title: 'Learn what to recycle', description: 'Use AI suggestions to sort waste with more confidence.' },
            ].map((item, i) => (
              <div key={i} style={styles.highlight}>
                <span style={styles.highlightIcon}>{item.icon}</span>
                <div>
                  <strong style={styles.highlightTitle}>{item.title}</strong>
                  <p style={styles.highlightDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.stats}>
            {[
              { value: 'Free', label: 'CITIZEN ACCOUNT' },
              { value: '12k+', label: 'ACTIVE USERS' },
              { value: '450+', label: 'INTEGRATIONS' },
            ].map((stat, i) => (
              <div key={i} style={styles.stat}>
                <strong style={styles.statValue}>{stat.value}</strong>
                <span style={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Panel */}
      <section style={styles.formPanel}>
        <div style={styles.formHeaderNav}>
          <span style={styles.loginPrompt}>
            Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link>
          </span>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Log In</h2>
            <p style={styles.formSubtitle}>Use your registered email to open your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div style={styles.formGrid}>
              
              {/* Email Input Field */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email address</label>
                <input
                  style={{
                    ...styles.formInput,
                    ...(errors.email ? styles.formInputError : {})
                  }}
                  type="email"
                  placeholder="aritradasgupta2003@gmail.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
                {errors.email && <span style={styles.formError}>{errors.email}</span>}
              </div>

              {/* Password Input Field with Interactive Action Toggle */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    style={{
                      ...styles.formInput,
                      ...styles.passwordInputPadding,
                      ...(errors.password ? styles.formInputError : {})
                    }}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <span style={styles.formError}>{errors.password}</span>}
              </div>

            </div>

            {/* Custom Interactive Alignment Layer */}
            <div style={styles.metaActionContainer}>
              <div style={styles.checkboxContainer}>
                <input 
                  type="checkbox" 
                  id="keepSignedIn" 
                  defaultChecked
                  style={styles.checkbox} 
                />
                <label htmlFor="keepSignedIn" style={styles.checkboxLabel}>
                  Keep me signed in
                </label>
              </div>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button 
              style={{
                ...styles.btnPrimary,
                ...(loading ? styles.btnDisabled : {})
              }} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <footer style={styles.footer}>
          <span style={styles.copyright}>© 2026 Ecobin. All rights reserved.</span>
          <div style={styles.footerLinks}>
            <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>
            <a href="/terms" style={styles.footerLink}>Terms</a>
            <a href="/security" style={styles.footerLink}>Security</a>
          </div>
        </footer>
      </section>
    </div>
  );
};

// CSS-in-JS Layout Rules (Synchronized and customized for tight laptop vertical scales)
const styles = {
  authShell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: '#0a192f',
    backgroundColor: '#ffffff',
  },
  // Added rules to handle the Link container wrapping the logo elements seamlessly
  logoLink: {
    textDecoration: 'none',
    display: 'inline-block',
    alignSelf: 'flex-start',
    marginBottom: '15px',
  },
  brandPanel: {
    flex: 1,
    background: 'linear-gradient(180deg, rgba(5, 46, 28, 0.95) 0%, rgba(10, 64, 36, 0.96) 35%, rgba(3, 28, 17, 0.98) 100%), radial-gradient(circle at top left, rgba(89, 245, 146, 0.16), transparent 30%), radial-gradient(circle at 80% 10%, rgba(139, 210, 155, 0.18), transparent 25%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '32px 40px',
  },
  brandContent: {
    maxWidth: '520px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoMark: {
    color: '#59f592',
  },
  brandName: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    lineHeight: '1.1',
  },
  brandTitle: {
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#ffffff',
  },
  brandSlogan: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#59f592',
    opacity: 0.85,
    letterSpacing: '0.02em',
    marginTop: '2px',
    display: 'block',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#59f592',
    margin: '0 0 8px 0',
  },
  heroTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    lineHeight: '1.12',
    letterSpacing: '-0.02em',
    color: '#ffffff',
    textShadow: '0 2px 16px rgba(89, 245, 146, 0.18)',
    margin: '0 0 8px 0',
  },
  heroSubtitle: {
    fontSize: '14.5px',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.76)',
    margin: '0 0 20px 0',
  },
  highlights: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '20px',
  },
  highlight: {
    display: 'flex',
    gap: '14px',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
  },
  highlightIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#59f592',
    color: '#062c1b',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  highlightTitle: {
    fontSize: '14px',
    display: 'block',
    marginBottom: '2px',
    color: '#ffffff',
    fontWeight: '600',
  },
  highlightDesc: {
    fontSize: '12px',
    opacity: 0.75,
    lineHeight: '1.4',
    color: 'rgba(255, 255, 255, 0.75)',
    margin: 0,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    paddingTop: '15px',
  },
  stat: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '10px 6px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    display: 'block',
    fontSize: '1.1rem',
    color: '#59f592',
    fontWeight: '700',
    marginBottom: '3px',
  },
  statLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  formPanel: {
    flex: 1,
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  formHeaderNav: {
    display: 'flex',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '24px 36px',
  },
  loginPrompt: {
    fontSize: '13px',
    color: '#475569',
  },
  formContainer: {
    maxWidth: '420px',
    margin: '0 auto',
    width: '100%',
  },
  formHeader: {
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  formSubtitle: {
    fontSize: '13.5px',
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInputPadding: {
    paddingRight: '60px',
  },
  passwordToggle: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#0f766e',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  formInputError: {
    borderColor: '#f87171',
    backgroundColor: '#fff1f2',
  },
  formError: {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '2px',
  },
  metaActionContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-4px',
    marginBottom: '4px',
  },
  checkboxContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    margin: 0,
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#475569',
    userSelect: 'none',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#0f766e',
    fontWeight: '700',
    textDecoration: 'none',
  },
  btnPrimary: {
    backgroundColor: '#0d1527',
    color: '#ffffff',
    padding: '14px 18px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    textAlign: 'center',
    width: '100%',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  link: {
    color: '#0f766e',
    fontWeight: '700',
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 36px',
    fontSize: '11px',
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
  },
  copyright: {
    opacity: 0.8,
  }
};

export default EcobinLogin;