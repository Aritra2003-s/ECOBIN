import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { pickupApi } from '../../../api/pickupApi';
import { reportApi } from '../../../api/reportApi';
import StatusBadge from '../../../components/common/StatusBadge';
import Loader from '../../../components/common/Loader/Loader';
import { formatDate } from '../../../utils/formatDate';
import './UserDashboard.css';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    Promise.all([
      pickupApi.getAll({ limit: 5 }),
      reportApi.getAll({ limit: 5 }),
    ]).then(([p, r]) => {
      setPickups(p.data.data.pickups || []);
      setReports(r.data.data.reports || []);
    }).catch(err => console.error("Dashboard Load Error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  // Logic Calculations
  const totalPickups = pickups.length;
  const completed = pickups.filter((p) => p.status === 'completed').length;
  const pending = pickups.filter((p) => p.status === 'pending').length;
  const totalReports = reports.length;
  const completionRate = totalPickups ? Math.round((completed / totalPickups) * 100) : 0;
  const pendingItems = pending + totalReports;

  const getItemDate = (item) => new Date(item.createdAt || item.preferredDate || Date.now());
  const getPickupQuantity = (pickup) => Number(pickup.quantity?.value || 0);

  const statsTimeline = Array.from({ length: 7 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (6 - index));
    month.setDate(1);

    return {
      name: month.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: pickups
        .filter((pickup) => {
          const pickupDate = getItemDate(pickup);
          return (
            pickupDate.getMonth() === month.getMonth() &&
            pickupDate.getFullYear() === month.getFullYear()
          );
        })
        .reduce((sum, pickup) => sum + getPickupQuantity(pickup), 0),
    };
  });

  const chartMax = Math.max(50, ...statsTimeline.map((item) => item.count));

  const nextPickup = pickups
    .filter((p) => new Date(p.preferredDate) >= new Date())
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))[0] || pickups[0];

  const actionCards = [
    { label: 'Report Waste', detail: 'Send a new report with photos.', path: '/report-waste', icon: '⚑', color: '#6366f1' },
    { label: 'Request Pickup', detail: 'Book the next collection slot.', path: '/pickup-request', icon: '⊕', color: '#e9c483' },
    { label: 'AI Scanner', detail: 'Check how to sort items correctly.', path: '/ai-scanner', icon: '✦', color: '#10b981' },
    { label: 'Track Pickup', detail: 'Follow your request in real-time.', path: '/pickup-tracking', icon: '◎', color: '#f43f5e' },
  ];

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title animate-slide-down">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Your waste management overview for today.</p>
        </div>
        <button className="btn btn-primary btn-with-shadow" onClick={() => navigate('/pickup-request')}>
          + Request Pickup
        </button>
      </header>

      {/* Main Metric Hero Section */}
      <section className="dashboard-highlight glass-morph">
        <div className="highlight-text">
          <span className="dashboard-highlight__eyebrow">Weekly Efficiency</span>
          <h2>Your impact matters.</h2>
          <p>You've maintained a <strong>{completionRate}%</strong> completion rate this week. Keep it up!</p>
        </div>

        <div className="dashboard-highlight__metrics">
          <div className="dashboard-highlight__metric">
            <div className="metric-circle">{completionRate}%</div>
            <span>Completion</span>
          </div>
          <div className="dashboard-highlight__metric">
            <strong>{pending}</strong>
            <span>Pending</span>
          </div>
          <div className="dashboard-highlight__metric">
            <strong>{totalReports}</strong>
            <span>Reports</span>
          </div>
        </div>
      </section>

      {/* Summary Grid */}
      <div className="dashboard-summary-grid">
        <div className="dashboard-summary-card">
          <span className="card-dot" style={{background: '#e9c483'}}></span>
          <span className="dashboard-summary-card__label">Total Pickups</span>
          <strong className="dashboard-summary-card__value">{totalPickups}</strong>
        </div>
        <div className="dashboard-summary-card dashboard-summary-card--accent">
          <span className="card-dot" style={{background: '#fff'}}></span>
          <span className="dashboard-summary-card__label">Next Pickup</span>
          <strong className="dashboard-summary-card__value">
            {nextPickup ? nextPickup.wasteType.replace('_', ' ') : 'None'}
          </strong>
          <small>{nextPickup ? formatDate(nextPickup.preferredDate) : 'No upcoming slots'}</small>
        </div>
        <div className="dashboard-summary-card">
          <span className="card-dot" style={{background: '#f43f5e'}}></span>
          <span className="dashboard-summary-card__label">Pending Items</span>
          <strong className="dashboard-summary-card__value">{pendingItems}</strong>
        </div>
      </div>

      {/* Interactive Chart Section - Futuristic HUD Mode */}
      <div className="card dashboard-chart-card interactive-card hud-container">
        {/* Hexagonal Background Pattern */}
        <div className="hud-hex-overlay"></div>
        
        <div className="dashboard-chart-card__header">
          <div className="hud-header-content">
            <span className="hud-status-blink"></span>
            <div>
              <span className="hud-eyebrow">System Activity Monitor</span>
              <h2 className="hud-title">Collection Volume</h2>
            </div>
          </div>
          <button className="btn-hud" onClick={() => navigate('/history')}>
             View History
          </button>
        </div>

        <div className="dashboard-chart-card__chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={statsTimeline} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onMouseMove={(state) => {
                if (state.activeTooltipIndex !== undefined) setActiveIndex(state.activeTooltipIndex);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                {/* Neon Purple to Cyan Gradient */}
                <linearGradient id="hudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7af39f" stopOpacity={1} />
                  <stop offset="100%" stopColor="#86deee" stopOpacity={0.8} />
                </linearGradient>

                {/* Glowing Light Tube Filter */}
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <CartesianGrid 
                strokeDasharray="0" 
                vertical={false} 
                stroke="rgba(6, 182, 212, 0.1)" 
              />
              
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: 'rgba(6, 182, 212, 0.3)' }}
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                dy={10}
              />

              <YAxis 
                domain={[0, chartMax]} 
                tickCount={6}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />

              <Tooltip 
                cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="hud-tooltip">
                        <p className="hud-tag">ID_TRACE: {payload[0].payload.name}</p>
                        <p className="hud-val">{payload[0].value} UNITS</p>
                        <div className="hud-scanner-line"></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar 
                dataKey="count" 
                radius={[2, 2, 0, 0]} 
                barSize={28}
                filter="url(#neonGlow)"
                animationDuration={1500}
              >
                {statsTimeline.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={activeIndex === index ? '#fff' : 'url(#hudGradient)'}
                    style={{ 
                      transition: 'all 0.3s ease',
                      cursor: 'crosshair'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions Grid - Fixed 3D Flash Cards */}
      <section className="dashboard-actions-wrapper">
        <h3 className="section-title hud-eyebrow" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
          QUICK ACTIONS
        </h3>
        <div className="dashboard-actions-flash">
          {actionCards.map((action) => (
            <div 
              key={action.path} 
              className="flash-card-3d" 
              onClick={() => navigate(action.path)}
            >
              <div className="flash-card-inner">
                <div className="action-icon-3d" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <div className="action-content-3d">
                  <strong className="flash-label">{action.label}</strong>
                  <p className="flash-detail">{action.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Lists */}
      <div className="grid-2">
        <ActivityList 
          title="Recent Pickups" 
          items={pickups} 
          onViewAll={() => navigate('/history')}
          renderItem={(p) => (
            <>
              <div>
                <div className="list-item-title">{p.wasteType.replace('_', ' ')}</div>
                <div className="list-item-subtitle">{formatDate(p.preferredDate)}</div>
              </div>
              <StatusBadge status={p.status} />
            </>
          )}
        />
        <ActivityList 
          title="Recent Reports" 
          items={reports} 
          onViewAll={() => navigate('/report-waste')}
          renderItem={(r) => (
            <>
              <div>
                <div className="list-item-title">{r.title}</div>
                <div className="list-item-subtitle">{r.category} · {formatDate(r.createdAt)}</div>
              </div>
              <StatusBadge status={r.status} />
            </>
          )}
        />
      </div>
    </div>
  );
}

function ActivityList({ title, items, onViewAll, renderItem }) {
  return (
    <div className="card dashboard-section-card">
      <div className="dashboard-section-card__header">
        <h2>{title}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onViewAll}>View all</button>
      </div>
      {items.length === 0 ? (
        <p className="dashboard-empty">No activity yet.</p>
      ) : (
        <div className="dashboard-list">
          {items.slice(0, 4).map((item) => (
            <div key={item._id} className="dashboard-list__item">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}