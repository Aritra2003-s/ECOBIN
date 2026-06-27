import { Link } from 'react-router-dom';
import './AuthShell.css';

export default function AuthShell({
  title,
  subtitle,
  eyebrow,
  highlights = [],
  stats = [],
  footerText,
  footerLinkLabel,
  footerLinkTo,
  showFooter = true,
  topbarSlot,
  children,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__backdrop" />

      <div className="auth-shell__content">
        <section className="auth-shell__panel auth-shell__panel--brand">
          <Link to="/" className="auth-shell__brand">
            <span className="auth-shell__brand-mark">
              <img src="assets/logo.png" alt="Ecobin Logo" />
            </span>
            <span className="auth-shell__brand-copy">
              <strong>Ecobin</strong>
              <small>Clean cities, better habits</small>
            </span>
          </Link>

          {eyebrow && <p className="auth-shell__eyebrow">{eyebrow}</p>}
          <h1 className="auth-shell__title">{title}</h1>
          <p className="auth-shell__subtitle">{subtitle}</p>

          {highlights.length > 0 && (
            <div className="auth-shell__highlights">
              {highlights.map((item) => (
                <div key={item.title} className="auth-shell__highlight">
                  <span className="auth-shell__highlight-icon">{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="auth-shell__stats">
              {stats.map((item) => (
                <div key={item.label} className="auth-shell__stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="auth-shell__panel auth-shell__panel--form">
          {topbarSlot && <div className="auth-shell__topbar">{topbarSlot}</div>}
          <div className="auth-shell__form-card">{children}</div>

          
        </section>
      </div>
    </div>
  );
}
