import './KpiCard.css';

export default function KpiCard({ title, value, subtitle, color = 'var(--color-primary)', icon }) {
  return (
    <div className="card kpi-card" style={{ '--kpi-accent': color }}>
      <div className="kpi-card__header">
        <span className="kpi-card__title">{title}</span>
        {icon && (
          <div className="kpi-card__icon">{icon}</div>
        )}
      </div>
      <div className="kpi-card__value">{value ?? '—'}</div>
      {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
    </div>
  );
}
