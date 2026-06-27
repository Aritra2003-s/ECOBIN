import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link here
import { useAuth } from '../../../context/AuthContext';
import useToast from '../../../hooks/useToast';

/**
 * Ecobin Signup Page - All-in-One Component
 * Includes JSX and scoped CSS logic.
 */

const EcobinSignup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!termsAccepted) e.terms = 'You must agree to the terms of service';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div style={styles.authShell}>
      {/* Brand Panel */}
      <section style={styles.brandPanel}>
        <div style={styles.brandContent}>
          
          {/* UPDATED: Brand Header wrapped in Link for redirection */}
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

          <p style={styles.eyebrow}>New member</p>
          <h1 style={styles.heroTitle}>Join the Ecosystem.</h1>
          <p style={styles.heroSubtitle}>
            Join Ecobin and make waste reporting, pickup requests, and recycling decisions much easier from day one.
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
            Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
          </span>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create your account</h2>
            <p style={styles.formSubtitle}>We only need a few details to set up your Ecobin profile.</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div style={styles.formGrid}>
              {[
                { field: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Smith' },
                { field: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
                { field: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
                { field: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
              ].map(({ field, label, type, placeholder }) => (
                <div style={styles.formGroup} key={field}>
                  <label style={styles.formLabel}>{label}</label>
                  <input
                    style={{
                      ...styles.formInput,
                      ...(errors[field] ? styles.formInputError : {})
                    }}
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={set(field)}
                    autoComplete={field === 'password' ? 'new-password' : field}
                  />
                  {errors[field] && <span style={styles.formError}>{errors[field]}</span>}
                </div>
              ))}
            </div>

            <p style={styles.formHint}>
              Use a valid email so you can receive pickup updates and account notifications.
            </p>

            <div style={styles.checkboxContainer}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={styles.checkbox} 
              />
              <label htmlFor="terms" style={styles.checkboxLabel}>
                I agree to the <Link to="/terms" style={styles.link}>Terms of Service</Link> and <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
              </label>
            </div>
            {errors.terms && <span style={styles.formError}>{errors.terms}</span>}

            <button 
              style={{
                ...styles.btnPrimary,
                ...(loading ? styles.btnDisabled : {})
              }} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <footer style={styles.footer}>
          <span style={styles.copyright}>© 2026 Ecobin. All rights reserved.</span>
          <div style={styles.footerLinks}>
            <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.footerLink}>Terms</Link>
            <Link to="/security" style={styles.footerLink}>Security</Link>
          </div>
        </footer>
      </section>
    </div>
  );
};

// CSS-in-JS Styles
const styles = {
  authShell: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: '#0a192f',
    backgroundColor: '#ffffff',
  },
  // Added logoLink style to handle the redirection wrapper
  logoLink: {
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '30px',
  },
  brandPanel: {
    flex: 1,
    background: 'linear-gradient(180deg, rgba(5, 46, 28, 0.95) 0%, rgba(10, 64, 36, 0.96) 35%, rgba(3, 28, 17, 0.98) 100%), radial-gradient(circle at top left, rgba(89, 245, 146, 0.16), transparent 30%), radial-gradient(circle at 80% 10%, rgba(139, 210, 155, 0.18), transparent 25%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px 44px',
    position: 'relative',
    overflow: 'visible',
  },
  brandContent: {
    maxWidth: '520px',
    zIndex: 2,
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    // margin removed from here and moved to logoLink wrapper
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
    marginBottom: '12px',
    margin: 0,
  },
  heroTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    lineHeight: '1.12',
    letterSpacing: '-0.02em',
    color: '#ffffff',
    textShadow: '0 2px 16px rgba(89, 245, 146, 0.18)',
    margin: 0,
    marginBottom: '12px',
  },
  heroSubtitle: {
    fontSize: '15px',
    lineHeight: '1.55',
    color: 'rgba(255, 255, 255, 0.76)',
    margin: 0,
    marginBottom: '28px',
  },
  highlights: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '28px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '28px',
    zIndex: 2,
  },
  highlight: {
    display: 'flex',
    gap: '14px',
    padding: '14px',
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
    marginBottom: '3px',
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
    marginTop: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    paddingTop: '24px',
    zIndex: 2,
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
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  formPanel: {
    flex: 1,
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  formHeaderNav: {
    display: 'flex',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '14px 36px',
  },
  loginPrompt: {
    fontSize: '13px',
    color: '#475569',
  },
  formContainer: {
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
    marginTop: '20px',
  },
  formHeader: {
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    marginBottom: '6px',
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
    gap: '14px',
    marginBottom: '16px',
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
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  formInputError: {
    borderColor: '#f87171',
    backgroundColor: '#fff1f2',
  },
  formError: {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '3px',
  },
  formHint: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#64748b',
    lineHeight: '1.5',
    margin: 0,
    marginBottom: '14px',
  },
  checkboxContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.5',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
    color: '#ffffff',
    padding: '14px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.18)',
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
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
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

export default EcobinSignup;