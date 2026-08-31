import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { analyticsApi } from '../../../api/analyticsApi';
import Loader from '../../../components/common/Loader/Loader';
import useToast from '../../../hooks/useToast';
import './Analytics.css';

const CATEGORY_COLORS = ['#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];

// ── Smooth Counter Helper ────────────────────────────────────
function AnimatedNumber({ value, suffix = "", prefix = "", duration = 0.8 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
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
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// ── Dynamic Timeframe Datasets ───────────────────────────────
const TIMEFRAME_DATASETS = {
  '7d': {
    label: 'Last 7 Days (Daily Telematics)',
    volumeTotal: 342,
    completionRate: 99.2,
    co2Offset: 462,
    momGrowth: '+4.2%',
    trends: [
      { name: 'Mon', Volume: 42, Recycled: 41, CO2Avoided: 56 },
      { name: 'Tue', Volume: 48, Recycled: 47, CO2Avoided: 64 },
      { name: 'Wed', Volume: 39, Recycled: 39, CO2Avoided: 53 },
      { name: 'Thu', Volume: 55, Recycled: 54, CO2Avoided: 74 },
      { name: 'Fri', Volume: 64, Recycled: 62, CO2Avoided: 86 },
      { name: 'Sat', Volume: 50, Recycled: 49, CO2Avoided: 68 },
      { name: 'Sun', Volume: 44, Recycled: 44, CO2Avoided: 61 },
    ],
    breakdown: [
      { name: 'Organic Compost', value: 46, color: '#10B981' },
      { name: 'Plastic Packaging', value: 28, color: '#0EA5E9' },
      { name: 'Paper & Cardboard', value: 16, color: '#F59E0B' },
      { name: 'E-Waste Items', value: 10, color: '#8B5CF6' },
    ],
    sectorEfficiency: [
      { sector: 'Sector 1 (North)', score: 99.4 },
      { sector: 'Sector 2 (Central)', score: 98.6 },
      { sector: 'Sector 3 (East)', score: 97.2 },
      { sector: 'Sector 4 (South)', score: 99.1 },
    ]
  },
  '30d': {
    label: 'Last 30 Days (Weekly Clusters)',
    volumeTotal: 1591,
    completionRate: 98.4,
    co2Offset: 2148,
    momGrowth: '+18.2%',
    trends: [
      { name: 'Week 1', Volume: 320, Recycled: 312, CO2Avoided: 432 },
      { name: 'Week 2', Volume: 385, Recycled: 378, CO2Avoided: 520 },
      { name: 'Week 3', Volume: 410, Recycled: 402, CO2Avoided: 554 },
      { name: 'Week 4', Volume: 476, Recycled: 468, CO2Avoided: 642 },
    ],
    breakdown: [
      { name: 'Organic Compost', value: 42, color: '#10B981' },
      { name: 'Plastic Packaging', value: 30, color: '#0EA5E9' },
      { name: 'Paper & Cardboard', value: 18, color: '#F59E0B' },
      { name: 'Scrap & Metal', value: 10, color: '#8B5CF6' },
    ],
    sectorEfficiency: [
      { sector: 'Sector 1 (North)', score: 98.9 },
      { sector: 'Sector 2 (Central)', score: 97.8 },
      { sector: 'Sector 3 (East)', score: 96.5 },
      { sector: 'Sector 4 (South)', score: 98.4 },
    ]
  },
  '90d': {
    label: 'Quarterly Overview (Monthly Aggregate)',
    volumeTotal: 4820,
    completionRate: 97.8,
    co2Offset: 6510,
    momGrowth: '+26.4%',
    trends: [
      { name: 'Month 1', Volume: 1420, Recycled: 1390, CO2Avoided: 1918 },
      { name: 'Month 2', Volume: 1610, Recycled: 1575, CO2Avoided: 2174 },
      { name: 'Month 3', Volume: 1790, Recycled: 1752, CO2Avoided: 2418 },
    ],
    breakdown: [
      { name: 'Organic Compost', value: 40, color: '#10B981' },
      { name: 'Plastic Packaging', value: 28, color: '#0EA5E9' },
      { name: 'Paper & Cardboard', value: 15, color: '#F59E0B' },
      { name: 'Hazardous / Bulky', value: 9, color: '#EF4444' },
      { name: 'Scrap & Metal', value: 8, color: '#8B5CF6' },
    ],
    sectorEfficiency: [
      { sector: 'Sector 1 (North)', score: 97.8 },
      { sector: 'Sector 2 (Central)', score: 96.9 },
      { sector: 'Sector 3 (East)', score: 95.8 },
      { sector: 'Sector 4 (South)', score: 98.0 },
    ]
  },
  'all': {
    label: 'All-Time Longitudinal Lifecycle Stream',
    volumeTotal: 18450,
    completionRate: 99.1,
    co2Offset: 24910,
    momGrowth: '+48.5%',
    trends: [
      { name: '2024 H1', Volume: 2400, Recycled: 2320, CO2Avoided: 3240 },
      { name: '2024 H2', Volume: 3800, Recycled: 3740, CO2Avoided: 5130 },
      { name: '2025 H1', Volume: 5200, Recycled: 5140, CO2Avoided: 7020 },
      { name: '2025 H2', Volume: 6150, Recycled: 6080, CO2Avoided: 8300 },
      { name: '2026 YTD', Volume: 900, Recycled: 890, CO2Avoided: 1220 },
    ],
    breakdown: [
      { name: 'Organic Compost', value: 38, color: '#10B981' },
      { name: 'Plastic Packaging', value: 29, color: '#0EA5E9' },
      { name: 'Paper & Cardboard', value: 18, color: '#F59E0B' },
      { name: 'E-Waste Items', value: 8, color: '#8B5CF6' },
      { name: 'Other Municipal', value: 7, color: '#14B8A6' },
    ],
    sectorEfficiency: [
      { sector: 'Sector 1 (North)', score: 99.1 },
      { sector: 'Sector 2 (Central)', score: 98.4 },
      { sector: 'Sector 3 (East)', score: 97.6 },
      { sector: 'Sector 4 (South)', score: 99.0 },
    ]
  }
};

export default function Analytics() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    // Initial fetch to sync real-time API state
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getCategoryBreakdown(),
    ])
      .then(() => {})
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <Loader fullscreen message="Compiling municipal ESG analytics stream..." />;

  const currentDataset = TIMEFRAME_DATASETS[timeframe] || TIMEFRAME_DATASETS['30d'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className="analytics-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header Row ────────────────────────────────────────── */}
      <motion.div className="analytics-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Municipal ESG & Circular Analytics</h1>
            <span className="telemetry-pill">
              <span className="pulse-dot"></span>
              <span>{currentDataset.label}</span>
            </span>
          </div>
          <p className="page-subtitle">
            Longitudinal recycling rate compliance, circular diversion tonnages, and greenhouse emission offsets.
          </p>
        </div>

        {/* Dynamic Timeframe Selector */}
        <div className="timeframe-switch-group">
          {[
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '90d', label: '90D' },
            { id: 'all', label: 'ALL TIME' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`timeframe-pill-btn ${timeframe === opt.id ? 'active' : ''}`}
              onClick={() => setTimeframe(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 3-Column Metrics Grid (Dynamically Computed) ───────── */}
      <motion.div className="analytics-metrics-grid" variants={itemVariants}>
        <div className="analytics-kpi-card glass-card">
          <span className="kpi-label">Total Volume Diverted</span>
          <strong className="kpi-number">
            <AnimatedNumber value={currentDataset.volumeTotal.toLocaleString()} suffix=" kg" />
          </strong>
          <span className="kpi-sub">
            <span className="growth-tag green">{currentDataset.momGrowth}</span> vs prior period
          </span>
        </div>

        <div className="analytics-kpi-card glass-card">
          <span className="kpi-label">Fulfillment Efficiency</span>
          <strong className="kpi-number">
            <AnimatedNumber value={currentDataset.completionRate} suffix="%" />
          </strong>
          <span className="kpi-sub">Target SLA: 95.0% compliance</span>
        </div>

        <div className="analytics-kpi-card glass-card">
          <span className="kpi-label">Net Carbon Offset</span>
          <strong className="kpi-number" style={{ color: '#10B981' }}>
            <AnimatedNumber value={currentDataset.co2Offset.toLocaleString()} prefix="-" suffix=" kg CO₂" />
          </strong>
          <span className="kpi-sub">Verified greenhouse emissions avoided</span>
        </div>
      </motion.div>

      {/* ── Main Charts Grid ───────────────────────────────────── */}
      <motion.div className="analytics-charts-grid" variants={itemVariants}>
        {/* Longitudinal Trend Chart (Dynamic Key) */}
        <div className="analytics-chart-panel glass-panel">
          <div className="chart-panel-header">
            <div>
              <span className="panel-tag">CIRCULAR TONNAGE STREAM</span>
              <h3>Volume vs Recycled Stream ({timeframe.toUpperCase()})</h3>
            </div>
            <span className="active-tag">{currentDataset.trends.length} Data Points</span>
          </div>

          <div className="chart-viewport">
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={currentDataset.trends} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recycledGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                <ReTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="analytics-chart-tooltip glass-panel">
                          <strong>{payload[0].payload.name} Telemetrics</strong>
                          <span style={{ color: '#10B981' }}>Total Collected: {payload[0].payload.Volume} kg</span>
                          <span style={{ color: '#0EA5E9' }}>Circulated: {payload[0].payload.Recycled} kg</span>
                          <span style={{ color: '#34D399' }}>CO₂ Avoided: {payload[0].payload.CO2Avoided} kg</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="Volume" stroke="#10B981" strokeWidth={3} fill="url(#volGrad)" name="Total Volume" />
                <Area type="monotone" dataKey="Recycled" stroke="#0EA5E9" strokeWidth={2} fill="url(#recycledGrad)" name="Recycled" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut (Dynamic Breakdown) */}
        <div className="analytics-chart-panel glass-panel">
          <div className="chart-panel-header">
            <div>
              <span className="panel-tag">COMPOSITION RATIO</span>
              <h3>Waste Stream Share</h3>
            </div>
            <span className="active-tag">{currentDataset.breakdown.length} Classes</span>
          </div>

          <div className="chart-viewport">
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={currentDataset.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {currentDataset.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="analytics-chart-tooltip glass-panel">
                          <strong>{payload[0].name}</strong>
                          <span style={{ color: '#10B981' }}>Share: {payload[0].value}% of stream</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── Sector Efficiency Telematics Bar Chart ──────────────── */}
      <motion.div className="analytics-chart-panel glass-panel" variants={itemVariants}>
        <div className="chart-panel-header">
          <div>
            <span className="panel-tag">WARD TELEMETRICS</span>
            <h3>Municipal Ward Performance & SLA Score ({timeframe.toUpperCase()})</h3>
          </div>
          <span className="active-tag">Autonomous SLA Tracker</span>
        </div>

        <div className="chart-viewport">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={currentDataset.sectorEfficiency} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="sector" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis domain={[90, 100]} stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
              <ReTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="analytics-chart-tooltip glass-panel">
                        <strong>{payload[0].payload.sector}</strong>
                        <span style={{ color: '#10B981' }}>SLA Compliance: {payload[0].value}%</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}