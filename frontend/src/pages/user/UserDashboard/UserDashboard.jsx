import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  Cell 
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { pickupApi } from '../../../api/pickupApi';
import { reportApi } from '../../../api/reportApi';
import StatusBadge from '../../../components/common/StatusBadge';
import Loader from '../../../components/common/Loader/Loader';
import { formatDate } from '../../../utils/formatDate';
import './UserDashboard.css';

// ── Smooth Number Counter Component ───────────────────────────
function AnimatedNumber({ value, suffix = "", prefix = "", duration = 1.4 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseFloat(value.toString().replace(/,/g, ""));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const startTime = performance.now();
    const isDecimal = value.toString().includes(".");
    const decimals = isDecimal ? value.toString().split(".")[1].length : 0;

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (end - start) * easeProgress;

      setCount(
        isDecimal
          ? currentVal.toFixed(decimals)
          : Math.floor(currentVal).toLocaleString()
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="stat-counter-num">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartView, setChartView] = useState('area'); // 'area' | 'bar'
  const [activityTab, setActivityTab] = useState('all'); // 'all' | 'pickups' | 'reports'

  useEffect(() => {
    Promise.all([
      pickupApi.getAll({ limit: 8 }),
      reportApi.getAll({ limit: 8 }),
    ])
      .then(([p, r]) => {
        setPickups(p.data.data.pickups || []);
        setReports(r.data.data.reports || []);
      })
      .catch((err) => console.error("Dashboard Load Error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullscreen message="Synchronizing citizen telematics..." />;

  // Calculated Metrics
  const totalPickups = pickups.length;
  const completedPickups = pickups.filter((p) => p.status === 'completed').length;
  const pendingPickups = pickups.filter((p) => p.status === 'pending').length;
  const inTransitPickups = pickups.filter((p) => p.status === 'in_transit').length;
  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;
  
  const completionRate = totalPickups ? Math.round((completedPickups / totalPickups) * 100) : 100;
  const pendingItems = pendingPickups + (totalReports - resolvedReports);

  // Carbon and diversion calculations
  const totalKgDiverted = completedPickups * 18.5 + 24.0;
  const co2Avoided = (totalKgDiverted * 1.42).toFixed(1);

  const getItemDate = (item) => new Date(item.createdAt || item.preferredDate || Date.now());
  const getPickupQuantity = (pickup) => Number(pickup.quantity?.value || 1);

  const statsTimeline = Array.from({ length: 7 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (6 - index));
    month.setDate(1);

    return {
      name: month.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: Math.max(
        1,
        pickups
          .filter((pickup) => {
            const pickupDate = getItemDate(pickup);
            return (
              pickupDate.getMonth() === month.getMonth() &&
              pickupDate.getFullYear() === month.getFullYear()
            );
          })
          .reduce((sum, pickup) => sum + getPickupQuantity(pickup), 0)
      ),
      co2: (Math.max(1, index + 2) * 4.2).toFixed(1),
    };
  });

  const nextPickup = pickups
    .filter((p) => new Date(p.preferredDate) >= new Date() && p.status !== 'completed')
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))[0] || pickups[0];

  const actionCards = [
    {
      label: 'AI Waste Scanner',
      detail: 'Instant neural sorting & disposal guidance',
      path: '/ai-scanner',
      icon: '⚡',
      badge: 'Vision AI 2.0',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(209, 250, 229, 0.3) 100%)',
    },
    {
      label: 'Request On-Demand Pickup',
      detail: 'Book recurring or bulk collection slots',
      path: '/pickup-request',
      icon: '🚛',
      badge: 'Fast Dispatch',
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(254, 243, 199, 0.3) 100%)',
    },
    {
      label: 'Live Driver Telemetry',
      detail: 'Watch assigned truck arrival with GPS radar',
      path: '/pickup-tracking',
      icon: '◎',
      badge: 'Real-Time GPS',
      color: '#0EA5E9',
      bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(224, 242, 254, 0.3) 100%)',
    },
    {
      label: 'Report Illegal Dump',
      detail: 'Geo-tagged evidence to clean neighborhood',
      path: '/report-waste',
      icon: '⚑',
      badge: 'Civic Watch',
      color: '#8B5CF6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(237, 233, 254, 0.3) 100%)',
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      className="dashboard-page user-saas-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Top Header ───────────────────────────────────── */}
      <motion.header className="saas-dashboard-header" variants={itemVariants}>
        <div className="header-left">
          <div className="header-greeting-row">
            <h1 className="page-title">
              Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}
            </h1>
            <span className="live-tier-badge">
              <span className="pulse-dot"></span>
              <span>Gold Tier Recycler</span>
            </span>
          </div>
          <p className="page-subtitle">
            Your personal sustainability dashboard & on-demand waste operations.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn-saas-secondary"
            onClick={() => navigate('/ai-scanner')}
          >
            <span>⚡ Scan Item</span>
          </button>
          <button
            className="btn-saas-primary"
            onClick={() => navigate('/pickup-request')}
          >
            <span>+ Book New Pickup</span>
          </button>
        </div>
      </motion.header>

      {/* ── High-Impact Sustainability Telemetry Banner ────────── */}
      <motion.section className="saas-highlight-banner glass-panel" variants={itemVariants}>
        <div className="banner-left">
          <div className="banner-eyebrow">
            <span className="eyebrow-icon">🌱</span>
            <span>CIVIC ENVIRONMENTAL IMPACT</span>
          </div>
          <h2>You've diverted <span className="highlight-emerald">{totalKgDiverted.toFixed(0)} kg</span> of municipal waste.</h2>
          <p>
            Your active recycling participation avoided approximately{' '}
            <strong>{co2Avoided} kg of net CO₂ emissions</strong> this cycle. Keep up the high sorting efficiency!
          </p>

          <div className="banner-quick-tags">
            <div className="quick-tag">
              <span>🎯 Recycling Goal:</span>
              <strong>84% Achieved</strong>
            </div>
            <div className="quick-tag">
              <span>📍 Sector Rank:</span>
              <strong>Top 5% in Ward 4</strong>
            </div>
          </div>
        </div>

        <div className="banner-right-metrics">
          {/* Animated SVG Circular Progress Gauge */}
          <div className="radial-metric-card glass-card">
            <div className="radial-gauge-wrapper">
              <svg viewBox="0 0 100 100" className="radial-svg">
                <circle cx="50" cy="50" r="42" className="radial-bg" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="radial-progress"
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * completionRate) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="radial-content">
                <strong>{completionRate}%</strong>
                <span>Fulfillment</span>
              </div>
            </div>
          </div>

          <div className="stat-pill-metric glass-card">
            <span className="stat-pill-label">Active Pickups</span>
            <div className="stat-pill-val">
              <AnimatedNumber value={pendingPickups + inTransitPickups} />
              {inTransitPickups > 0 && (
                <span className="tag-in-transit">1 in transit</span>
              )}
            </div>
            <span className="stat-pill-sub">Curbside queue</span>
          </div>

          <div className="stat-pill-metric glass-card">
            <span className="stat-pill-label">Resolved Reports</span>
            <div className="stat-pill-val">
              <AnimatedNumber value={resolvedReports} />
              <span className="tag-resolved">of {totalReports} total</span>
            </div>
            <span className="stat-pill-sub">Street verification</span>
          </div>
        </div>
      </motion.section>

      {/* ── Summary & Schedule Grid (Clean SaaS & No Overlaps) ──── */}
      <motion.div className="dashboard-summary-grid" variants={itemVariants}>
        <div className="dashboard-summary-card glass-card">
          <div className="summary-card-top">
            <span className="summary-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>📦</span>
            <span className="card-dot" style={{ background: '#10B981' }}></span>
          </div>
          <span className="dashboard-summary-card__label">Total Pickups</span>
          <strong className="dashboard-summary-card__value">
            <AnimatedNumber value={totalPickups} />
          </strong>
          <span className="summary-card-meta">Lifetime scheduled requests</span>
        </div>

        <div className="dashboard-summary-card dashboard-summary-card--featured glass-card">
          <div className="summary-card-top">
            <span className="summary-card-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>🚛</span>
            <span className="card-dot" style={{ background: '#F59E0B' }}></span>
          </div>
          <span className="dashboard-summary-card__label">Next Scheduled Pickup</span>
          <strong className="dashboard-summary-card__value">
            {nextPickup ? nextPickup.wasteType.replace('_', ' ') : 'None Scheduled'}
          </strong>
          <div className="summary-card-badge">
            <span>📅 {nextPickup ? formatDate(nextPickup.preferredDate) : 'No upcoming slots'}</span>
          </div>
        </div>

        <div className="dashboard-summary-card glass-card">
          <div className="summary-card-top">
            <span className="summary-card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>⏳</span>
            <span className="card-dot" style={{ background: '#EF4444' }}></span>
          </div>
          <span className="dashboard-summary-card__label">Pending Items</span>
          <strong className="dashboard-summary-card__value">
            <AnimatedNumber value={pendingItems} />
          </strong>
          <span className="summary-card-meta">Awaiting driver verification</span>
        </div>
      </motion.div>

      {/* ── Quick Actions SaaS Bento Grid ──────────────────────── */}
      <motion.section className="saas-actions-section" variants={itemVariants}>
        <div className="section-title-row">
          <div className="section-title-left">
            <span className="title-bullet">⚡</span>
            <h3>Quick Operational Workflows</h3>
          </div>
          <span className="section-title-sub">Select an action to launch real-time task</span>
        </div>

        <div className="saas-actions-grid">
          {actionCards.map((action, idx) => (
            <motion.div
              key={action.path}
              className="saas-action-card glass-card"
              onClick={() => navigate(action.path)}
              whileHover={{ y: -5, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="action-top">
                <div className="action-icon-circle" style={{ background: action.color + '22', color: action.color }}>
                  <span>{action.icon}</span>
                </div>
                <span className="action-card-badge" style={{ color: action.color, borderColor: action.color + '44' }}>
                  {action.badge}
                </span>
              </div>
              <strong className="action-card-title">{action.label}</strong>
              <p className="action-card-detail">{action.detail}</p>
              <div className="action-card-arrow">
                <span>Launch flow</span>
                <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Collection History & Telemetry Charts ──────────────── */}
      <motion.section className="saas-chart-section glass-panel" variants={itemVariants}>
        <div className="chart-header-row">
          <div className="chart-header-title">
            <span className="chart-tag">HISTORICAL VOLUME</span>
            <h3>Monthly Recyclables & Tonnage Stream</h3>
            <p>Track your monthly household sorting volume and estimated emissions avoided.</p>
          </div>

          <div className="chart-view-toggle">
            <button
              className={`toggle-btn ${chartView === 'area' ? 'active' : ''}`}
              onClick={() => setChartView('area')}
            >
              Smooth Area
            </button>
            <button
              className={`toggle-btn ${chartView === 'bar' ? 'active' : ''}`}
              onClick={() => setChartView('bar')}
            >
              Bar Tonnage
            </button>
          </div>
        </div>

        <div className="chart-viewport-box">
          <ResponsiveContainer width="100%" height={290}>
            {chartView === 'area' ? (
              <AreaChart data={statsTimeline} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="saas-chart-tooltip glass-panel">
                          <span className="tt-label">{payload[0].payload.fullDate}</span>
                          <strong className="tt-val">{payload[0].value} Pickups</strong>
                          <span className="tt-co2">🌱 {payload[0].payload.co2} kg CO2 avoided</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={statsTimeline} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="saas-chart-tooltip glass-panel">
                          <span className="tt-label">{payload[0].payload.fullDate}</span>
                          <strong className="tt-val">{payload[0].value} Pickups</strong>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#10B981" barSize={32} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* ── Recent Activity & Live Feeds ──────────────────────── */}
      <motion.div className="dashboard-split-grid" variants={itemVariants}>
        {/* Recent Pickups Card */}
        <div className="saas-feed-card glass-panel">
          <div className="feed-header">
            <div>
              <h4>Curbside Pickup Log</h4>
              <p>Your recent collection requests and arrival updates</p>
            </div>
            <button className="btn-feed-action" onClick={() => navigate('/history')}>
              View All →
            </button>
          </div>

          {pickups.length === 0 ? (
            <div className="feed-empty-state">
              <span>📦</span>
              <p>No pickup requests found yet.</p>
              <button className="btn-saas-secondary btn-sm" onClick={() => navigate('/pickup-request')}>
                Book First Pickup
              </button>
            </div>
          ) : (
            <div className="feed-items-list">
              {pickups.slice(0, 4).map((p) => (
                <div key={p._id} className="feed-item-row">
                  <div className="feed-item-icon green">
                    <span>🚛</span>
                  </div>
                  <div className="feed-item-main">
                    <strong className="item-title">{p.wasteType?.replace('_', ' ')}</strong>
                    <span className="item-subtitle">
                      Slot: {formatDate(p.preferredDate)} • {p.quantity?.value || 1} {p.quantity?.unit || 'bags'}
                    </span>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Civic Issue Reports Card */}
        <div className="saas-feed-card glass-panel">
          <div className="feed-header">
            <div>
              <h4>Civic Issue Reports</h4>
              <p>Street cleanups and municipal ticket updates</p>
            </div>
            <button className="btn-feed-action" onClick={() => navigate('/report-waste')}>
              New Report +
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="feed-empty-state">
              <span>⚑</span>
              <p>No civic reports submitted.</p>
              <button className="btn-saas-secondary btn-sm" onClick={() => navigate('/report-waste')}>
                Report an Issue
              </button>
            </div>
          ) : (
            <div className="feed-items-list">
              {reports.slice(0, 4).map((r) => (
                <div key={r._id} className="feed-item-row">
                  <div className="feed-item-icon purple">
                    <span>⚑</span>
                  </div>
                  <div className="feed-item-main">
                    <strong className="item-title">{r.title}</strong>
                    <span className="item-subtitle">
                      {r.category} • {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}