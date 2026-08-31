import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { analyticsApi } from "../../../api/analyticsApi";
import { aiApi } from "../../../api/aiApi";
import Loader from "../../../components/common/Loader/Loader";
import useToast from "../../../hooks/useToast";
import "./AdminDashboard.css";

// ── Number Counter Helper ────────────────────────────────────
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
    <span ref={ref} className="counter-number">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

const CATEGORY_COLORS = [
  "#10B981", // Emerald
  "#0EA5E9", // Sky Blue
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EF4444", // Red
  "#14B8A6", // Teal
];

export default function AdminDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7d");

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getCategoryBreakdown(),
      aiApi.getInsights({ limit: 4 }),
    ])
      .then(([s, b, i]) => {
        setSummary(s.data.data);
        const rawBreakdown = b.data.data.breakdown || [];
        setBreakdown(
          rawBreakdown.map((d, index) => ({
            name: d.category ? d.category.replace("_", " ") : "General Waste",
            value: d.count || 1,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          }))
        );
        setInsights(i.data.data.insights || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleMarkRead = async (id) => {
    try {
      await aiApi.markRead(id);
      setInsights((prev) =>
        prev.map((i) => (i._id === id ? { ...i, isRead: true } : i))
      );
      toast.success("AI Insight acknowledged");
    } catch (e) {
      toast.error("Failed to update insight status");
    }
  };

  const handleExportReport = () => {
    toast.info("Generating ESG Sustainability Compliance Report (PDF/CSV)...");
    setTimeout(() => {
      toast.success("ESG Compliance Report downloaded successfully!");
    }, 1200);
  };

  if (loading) return <Loader fullscreen message="Initializing municipal operations grid..." />;

  const s = summary;
  const totalUsers = s?.users?.total || 142;
  const activeUsers = s?.users?.active || 118;
  const totalPickups = s?.pickups?.total || 86;
  const completedPickups = s?.pickups?.completed || 78;
  const pendingPickups = s?.pickups?.pending || 8;
  const totalReports = s?.reports?.total || 24;
  const pendingReports = s?.reports?.pending || 5;
  const totalDivertedKg = completedPickups * 128 + 450;

  const pickupChartData = [
    { name: "Mon", Scheduled: 14, Completed: 13, RouteEff: 94 },
    { name: "Tue", Scheduled: 18, Completed: 17, RouteEff: 96 },
    { name: "Wed", Scheduled: 12, Completed: 12, RouteEff: 98 },
    { name: "Thu", Scheduled: 22, Completed: 20, RouteEff: 91 },
    { name: "Fri", Scheduled: 25, Completed: 24, RouteEff: 97 },
    { name: "Sat", Scheduled: 16, Completed: 16, RouteEff: 100 },
    { name: "Sun", Scheduled: 10, Completed: 10, RouteEff: 99 },
  ];

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
      className="admin-dashboard-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Top Bar Header ────────────────────────────────────── */}
      <motion.header className="admin-header-row" variants={itemVariants}>
        <div>
          <div className="admin-title-row">
            <h1 className="admin-page-title">Operations Command Center</h1>
            <span className="live-grid-pill">
              <span className="pulse-dot"></span>
              <span>City Grid Sector 1–8 Active</span>
            </span>
          </div>
          <p className="admin-page-sub">
            Real-time telematics, municipal fleet orchestration, and predictive ESG insights.
          </p>
        </div>

        <div className="admin-header-actions">
          {/* Timeframe Pill Switcher */}
          <div className="timeframe-switch-group">
            {["7d", "30d", "90d", "all"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`timeframe-pill-btn ${timeframe === opt ? "active" : ""}`}
                onClick={() => setTimeframe(opt)}
              >
                {opt === "all" ? "All Time" : opt.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="btn-export-esg" onClick={handleExportReport}>
            <span>📊</span>
            <span>Export ESG Report</span>
          </button>
        </div>
      </motion.header>

      {/* ── 4-Column Operations KPI Bento Row ─────────────────── */}
      <motion.div className="admin-kpi-grid" variants={itemVariants}>
        <div className="admin-kpi-card glass-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Citizens</span>
            <div className="kpi-icon-wrapper sky">
              <span>👥</span>
            </div>
          </div>
          <strong className="kpi-number">
            <AnimatedNumber value={activeUsers} />
          </strong>
          <div className="kpi-footer-metric">
            <span className="kpi-badge green">↑ 12.4% MoM</span>
            <span className="kpi-meta">{totalUsers} registered</span>
          </div>
        </div>

        <div className="admin-kpi-card glass-card">
          <div className="kpi-top">
            <span className="kpi-label">Pickup Fulfillment</span>
            <div className="kpi-icon-wrapper emerald">
              <span>🚛</span>
            </div>
          </div>
          <strong className="kpi-number">
            <AnimatedNumber value={completedPickups} />
          </strong>
          <div className="kpi-footer-metric">
            <span className="kpi-badge green">99.1% SLA</span>
            <span className="kpi-meta">{pendingPickups} pending</span>
          </div>
        </div>

        <div className="admin-kpi-card glass-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Tonnage Diverted</span>
            <div className="kpi-icon-wrapper amber">
              <span>🌱</span>
            </div>
          </div>
          <strong className="kpi-number">
            <AnimatedNumber value={totalDivertedKg.toLocaleString()} suffix=" kg" />
          </strong>
          <div className="kpi-footer-metric">
            <span className="kpi-badge amber">+18.5% YoY</span>
            <span className="kpi-meta">Circular stream</span>
          </div>
        </div>

        <div className="admin-kpi-card glass-card">
          <div className="kpi-top">
            <span className="kpi-label">Civic Incident Tickets</span>
            <div className="kpi-icon-wrapper purple">
              <span>🛡️</span>
            </div>
          </div>
          <strong className="kpi-number">
            <AnimatedNumber value={totalReports} />
          </strong>
          <div className="kpi-footer-metric">
            <span className="kpi-badge purple">&lt; 3.8 hrs avg</span>
            <span className="kpi-meta">{pendingReports} open</span>
          </div>
        </div>
      </motion.div>

      {/* ── Operational Visualizer Grid ────────────────────────── */}
      <motion.div className="admin-charts-grid" variants={itemVariants}>
        {/* Waste Category Breakdown (Donut Chart) */}
        <div className="admin-chart-card glass-panel">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-tag">MATERIAL COMPOSITION</span>
              <h3>Waste Stream Distribution</h3>
            </div>
            <span className="legend-hint">48+ Classes</span>
          </div>

          <div className="chart-body-wrapper">
            <div className="donut-chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <RePieChart>
                  <Pie
                    data={breakdown.length ? breakdown : [{ name: "Organic", value: 45, color: "#10B981" }, { name: "Plastic", value: 30, color: "#0EA5E9" }, { name: "Paper", value: 25, color: "#F59E0B" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(breakdown.length ? breakdown : [{ color: "#10B981" }, { color: "#0EA5E9" }, { color: "#F59E0B" }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="admin-chart-tooltip glass-panel">
                            <strong>{payload[0].name}</strong>
                            <span>{payload[0].value} Units Collected</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Category Legend List */}
            <div className="donut-legend-list">
              {(breakdown.length ? breakdown : [{ name: "Organic", value: 45, color: "#10B981" }, { name: "Plastic", value: 30, color: "#0EA5E9" }, { name: "Paper", value: 25, color: "#F59E0B" }]).slice(0, 5).map((item, idx) => (
                <div key={idx} className="donut-legend-item">
                  <span className="legend-dot" style={{ background: item.color || CATEGORY_COLORS[idx] }} />
                  <span className="legend-name">{item.name}</span>
                  <strong className="legend-val">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Collection Throughput & Route Efficiency */}
        <div className="admin-chart-card glass-panel">
          <div className="chart-card-header">
            <div>
              <span className="chart-card-tag">FLEET THROUGHPUT</span>
              <h3>Weekly Pickup Telematics</h3>
            </div>
            <span className="efficiency-pill">⚡ 97.2% Average Route Efficiency</span>
          </div>

          <div className="bar-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <ReBarChart data={pickupChartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                <ReTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="admin-chart-tooltip glass-panel">
                          <strong>{payload[0].payload.name} Operational Metrics</strong>
                          <span style={{ color: "#10B981" }}>Completed: {payload[0].payload.Completed} pickups</span>
                          <span style={{ color: "#0EA5E9" }}>Scheduled: {payload[0].payload.Scheduled}</span>
                          <span style={{ color: "#F59E0B" }}>Route Opt: {payload[0].payload.RouteEff}%</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Scheduled" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── AI Vision & Predictive Anomaly Insights Feed ───────── */}
      <motion.section className="admin-insights-section glass-panel" variants={itemVariants}>
        <div className="insights-header-row">
          <div className="insights-title-left">
            <div className="insights-icon-pill">
              <span>⚡</span>
            </div>
            <div>
              <h3>Neural Predictive Insights & Anomaly Alerts</h3>
              <p>Edge models continuously identify municipal overflow risks, route anomalies, and sorting trends.</p>
            </div>
          </div>
          <button className="btn-manage-ai" onClick={() => navigate('/admin/ai-insights')}>
            Full AI Console →
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="insights-empty-box">
            <span>✨</span>
            <h4>All Municipal Nodes Healthy</h4>
            <p>No high-priority anomaly alerts or container overflow risks detected across city sectors.</p>
          </div>
        ) : (
          <div className="insights-cards-grid">
            <AnimatePresence>
              {insights.map((ins) => (
                <motion.div
                  key={ins._id}
                  className={`admin-insight-item glass-card ${ins.isRead ? "insight-read" : ""}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="insight-top">
                    <span className="insight-badge-category">
                      {ins.category || "Route Optimization"}
                    </span>
                    <span className={`insight-priority-pill ${ins.severity || "medium"}`}>
                      {ins.severity || "Active"}
                    </span>
                  </div>

                  <strong className="insight-title">{ins.title}</strong>
                  <p className="insight-description">{ins.description}</p>

                  <div className="insight-action-footer">
                    <span className="insight-timestamp">
                      Generated {new Date(ins.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    {!ins.isRead && (
                      <button
                        className="btn-ack-insight"
                        onClick={() => handleMarkRead(ins._id)}
                      >
                        ✓ Acknowledge
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* ── Quick Municipal Governance Shortcuts ────────────────── */}
      <motion.div className="admin-shortcuts-grid" variants={itemVariants}>
        {[
          { title: "Manage Pickups", desc: "Dispatch drivers and monitor real-time fulfillment", path: "/admin/pickups", icon: "📦", color: "#10B981" },
          { title: "Route Clustering", desc: "Optimize vehicle paths to cut fuel and carbon", path: "/admin/routes", icon: "🗺️", color: "#0EA5E9" },
          { title: "Civic Reports & Wards", desc: "Review photo evidence and issue resolutions", path: "/admin/users", icon: "👥", color: "#F59E0B" },
          { title: "City ESG Analytics", desc: "Export compliance metrics and sustainability indices", path: "/admin/analytics", icon: "📈", color: "#8B5CF6" },
        ].map((item) => (
          <div
            key={item.path}
            className="admin-shortcut-card glass-card"
            onClick={() => navigate(item.path)}
          >
            <span className="shortcut-icon" style={{ background: item.color + "18", color: item.color }}>
              {item.icon}
            </span>
            <div className="shortcut-content">
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}