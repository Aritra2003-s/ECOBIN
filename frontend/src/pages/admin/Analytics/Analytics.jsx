import { useEffect, useState } from 'react';
import { analyticsApi } from '../../../api/analyticsApi';
import KpiCard from '../../../components/cards/KpiCard/KpiCard';
import BarChart from '../../../components/charts/BarChart/BarChart';
import PieChart from '../../../components/charts/PieChart/PieChart';
import Loader from '../../../components/common/Loader/Loader';
import './Analytics.css'; // Import the CSS file

export default function Analytics() {
  const [summary, setSummary]     = useState(null);
  const [metrics, setMetrics]     = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [period, setPeriod]       = useState(30);
  const [trends, setTrends]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getPickupMetrics(),
      analyticsApi.getCategoryBreakdown(),
      analyticsApi.getWasteTrends(period),
    ]).then(([s, m, b, t]) => {
      setSummary(s.data.data);
      setMetrics(m.data.data);
      setBreakdown(b.data.data.breakdown.map((d) => ({ name: d.category, value: d.count })));

      // Aggregate trend data to daily counts for the bar chart
      const dayMap = {};
      t.data.data.trends.forEach(({ _id, count }) => {
        dayMap[_id.date] = (dayMap[_id.date] || 0) + count;
      });
      setTrends(Object.entries(dayMap).slice(-14).map(([date, count]) => ({
        name: date.slice(5), count,
      })));
    }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Loader />;

  const statusData = metrics?.statusBreakdown?.map((s) => ({ name: s.status, value: s.count })) || [];
  const wasteTypeData = metrics?.wasteTypeBreakdown?.map((w) => ({ name: w.wasteType, value: w.count })) || [];

  return (
    <div className="analytics-page">
      
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Waste generation trends and operational performance.</p>
        </div>
        <select 
          className="form-input period-select"
          value={period} 
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* ── KPIs ── */}
      <div className="grid-4 section-mb">
        <KpiCard title="Total users"     value={summary?.users.total}          icon="◯" color="#0ea5e9" />
        <KpiCard title="Total pickups"   value={summary?.pickups.total}        icon="⊕" color="#16a34a" subtitle={`${summary?.pickups.completionRate}% completion`} />
        <KpiCard title="Avg. rating"     value={metrics?.avgRating || '—'}      icon="★" color="#f59e0b" subtitle="Customer satisfaction" />
        <KpiCard title="Waste reports"   value={summary?.reports.total}        icon="⚑" color="#8b5cf6" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid-2 section-mb">
        <div className="card chart-card">
          <h2 className="chart-title">Daily reports — last {period} days</h2>
          <BarChart data={trends} dataKey="count" nameKey="name" height={240} />
        </div>

        <div className="card chart-card">
          <h2 className="chart-title">Waste category distribution</h2>
          <PieChart data={breakdown} height={240} />
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid-2">
        <div className="card chart-card">
          <h2 className="chart-title">Pickup status distribution</h2>
          <PieChart data={statusData} height={240} />
        </div>

        <div className="card chart-card">
          <h2 className="chart-title">Pickups by waste type</h2>
          <BarChart data={wasteTypeData} dataKey="value" nameKey="name" height={240} color="#0ea5e9" />
        </div>
      </div>
      
    </div>
  );
}