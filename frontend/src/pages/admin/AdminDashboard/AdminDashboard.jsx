import React, { useEffect, useState } from "react";
import { analyticsApi } from "../../../api/analyticsApi";
import { aiApi } from "../../../api/aiApi";
import KpiCard from "../../../components/cards/KpiCard/KpiCard";
import InsightCard from "../../../components/cards/InsightCard/InsightCard";
import PieChart from "../../../components/charts/PieChart/PieChart";
import BarChart from "../../../components/charts/BarChart/BarChart";
import Loader from "../../../components/common/Loader/Loader";
import useToast from "../../../hooks/useToast";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const toast = useToast();
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
        setBreakdown(
          b.data.data.breakdown.map((d) => ({
            name: d.category,
            value: d.count,
          }))
        );
        setInsights(i.data.data.insights);
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
    } catch (e) {
      toast.error("Failed to update insight status");
    }
  };

  const periodLabel = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    all: "All time",
  }[timeframe];

  if (loading) return <Loader />;

  const s = summary;
  const totalActivity = (s?.pickups.total || 0) + (s?.reports.total || 0);

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            System overview and operational metrics.
          </p>
        </div>
      </div>

      <div className="admin-dashboard__pulse">
        <div>
          <span className="admin-dashboard__eyebrow">Operations pulse</span>
          <h2>See the city-wide picture before diving into the details.</h2>
          <p>
            Monitor active users, pickup throughput, and AI-generated
            recommendations from a single responsive overview.
          </p>
          <div className="admin-dashboard__controls">
            {["7d", "30d", "all"].map((option) => (
              <button
                key={option}
                type="button"
                className={`admin-dashboard__filter-btn ${timeframe === option ? "active" : ""}`}
                onClick={() => setTimeframe(option)}
              >
                {option === "all" ? "All time" : `${option}`}
              </button>
            ))}
          </div>
          <p className="admin-dashboard__period-note">
            Showing {periodLabel} summary
          </p>
        </div>

        <div className="admin-dashboard__metrics">
          <div className="admin-dashboard__metric">
            <strong>{s?.users.active || 0}</strong>
            <span>Active users</span>
          </div>
          <div className="admin-dashboard__metric">
            <strong>{s?.pickups.completionRate || 0}%</strong>
            <span>Pickup completion rate</span>
          </div>
          <div className="admin-dashboard__metric">
            <strong>{insights.length}</strong>
            <span>Fresh AI insights</span>
          </div>
          <div className="admin-dashboard__metric">
            <strong>{totalActivity}</strong>
            <span>Total Activity</span>
          </div>
        </div>
      </div>

      <div className="grid-4 kpi-row">
        <KpiCard
          title="Total users"
          value={s?.users.total}
          icon="◯"
          color="#0ea5e9"
          subtitle={`${s?.users.active} active`}
        />
        <KpiCard
          title="Total pickups"
          value={s?.pickups.total}
          icon="⊕"
          color="#16a34a"
          subtitle={`${s?.pickups.completionRate}% rate`}
        />
        <KpiCard
          title="Pending"
          value={s?.pickups.pending}
          icon="◎"
          color="#f59e0b"
          subtitle="Awaiting review"
        />
        <KpiCard
          title="Reports"
          value={s?.reports.total}
          icon="⚑"
          color="#8b5cf6"
          subtitle={`${s?.reports.pending} pending`}
        />
      </div>

      {/* Modern Sustainability Overview Section */}
      <div className="sustainability-overview">
        <div className="overview-header">
          <span className="overview-icon">📈</span>
          <h2>Sustainability Metrics Overview</h2>
        </div>

        <div className="grid-2 glass-container">
          <div className="card admin-dashboard__panel glass-panel">
            <h3 className="panel-title">Waste by category</h3>
            <div className="chart-wrapper">
              <PieChart
                data={breakdown}
                nameKey="name"
                valueKey="value"
                height={240}
              />
            </div>
          </div>

          <div className="card admin-dashboard__panel glass-panel">
            <h3 className="panel-title">Pickup status breakdown</h3>
            <div className="chart-wrapper">
              <BarChart
                data={[
                  { name: "Pending", count: s?.pickups.pending || 0 },
                  { name: "Completed", count: s?.pickups.completed || 0 },
                  { name: "Total", count: s?.pickups.total || 0 },
                ]}
                dataKey="count"
                nameKey="name"
                height={240}
              />
            </div>
          </div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="admin-dashboard__insights">
          <h2>Recent AI insights</h2>
          <div className="grid-2 flash-card-grid">
            {insights.map((ins) => (
              <InsightCard
                key={ins._id}
                insight={ins}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}