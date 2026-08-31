import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFetch from '../../../hooks/useFetch';
import { routeApi } from '../../../api/routeApi';
import StatusBadge from '../../../components/common/StatusBadge';
import Loader from '../../../components/common/Loader/Loader';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './RouteManagement.css';

export default function RouteManagement() {
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const { data, loading, refetch } = useFetch(() => routeApi.getAll({ limit: 20 }));
  const routes = data?.routes || [];

  const handleGenerateRoutes = async () => {
    setGenerating(true);
    try {
      await routeApi.generate();
      toast.success('AI Route Clustering complete! Optimal paths generated.');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Route generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  if (loading) return <Loader fullscreen message="Calculating municipal vehicle routing matrices..." />;

  return (
    <motion.div
      className="route-mgmt-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="route-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Municipal Fleet Route Clustering</h1>
            <span className="route-ai-badge">
              <span className="pulse-dot"></span>
              <span>Fleet Route Optimization</span>
            </span>
          </div>
          <p className="page-subtitle">
            Autonomous multi-stop waypoint optimization to reduce municipal fuel consumption and carbon footprint.
          </p>
        </div>

        <motion.button
          className="btn-generate-routes"
          onClick={handleGenerateRoutes}
          disabled={generating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {generating ? 'Calculating Path Matrices...' : '⚡ Generate AI Routes'}
        </motion.button>
      </motion.div>

      {/* ── Route Telemetry Bar ──────────────────────────────── */}
      <motion.div className="route-telemetry-grid" variants={itemVariants}>
        <div className="route-telemetry-card glass-card">
          <span className="telemetry-label">Active Vehicle Routes</span>
          <strong className="telemetry-number">{routes.length}</strong>
          <span className="telemetry-sub">Dispatched sectors</span>
        </div>

        <div className="route-telemetry-card glass-card">
          <span className="telemetry-label">Waypoint Pickups</span>
          <strong className="telemetry-number">
            {routes.reduce((acc, r) => acc + (r.pickups?.length || 0), 0)}
          </strong>
          <span className="telemetry-sub">Stops scheduled</span>
        </div>

        <div className="route-telemetry-card glass-card">
          <span className="telemetry-label">Fuel Reduction Index</span>
          <strong className="telemetry-number" style={{ color: '#10B981' }}>-24.8%</strong>
          <span className="telemetry-sub">AI route savings</span>
        </div>
      </motion.div>

      {/* ── Routes Grid ────────────────────────────────────────── */}
      {routes.length === 0 ? (
        <motion.div className="routes-empty-card glass-panel" variants={itemVariants}>
          <span>🗺️</span>
          <h3>No Active Route Clusters</h3>
          <p>Click "Generate AI Routes" to group pending approved pickups into optimal vehicle paths.</p>
          <button className="btn-generate-routes" onClick={handleGenerateRoutes} disabled={generating}>
            Generate AI Routes
          </button>
        </motion.div>
      ) : (
        <div className="routes-cards-grid">
          {routes.map((route, idx) => (
            <motion.div
              key={route._id || idx}
              className="route-cluster-card glass-panel"
              variants={itemVariants}
              whileHover={{ y: -3 }}
            >
              <div className="cluster-top-row">
                <div className="cluster-badge">
                  <span>ROUTE #{idx + 1}</span>
                </div>
                <StatusBadge status={route.status || 'in_progress'} />
              </div>

              <h3 className="cluster-name">{route.name || `Sector Cluster ${idx + 1}`}</h3>

              <div className="cluster-meta-row">
                <span>🚛 {route.assignedTo?.vehicle?.registrationNumber || 'Municipal Truck'}</span>
                <span>👤 {route.assignedTo?.staff?.name || 'Assigned Driver'}</span>
              </div>

              {/* Waypoints Stops list */}
              <div className="waypoints-container">
                <span className="waypoints-title">WAYPOINT STOPS ({route.pickups?.length || 0})</span>
                <div className="waypoints-list">
                  {(route.pickups || []).slice(0, 4).map((p, pIdx) => (
                    <div key={p._id || pIdx} className="waypoint-stop-item">
                      <span className="stop-num">{pIdx + 1}</span>
                      <div className="stop-info">
                        <strong>{p.wasteType?.replace('_', ' ') || 'Curbside Pickup'}</strong>
                        <small>{p.pickupAddress?.street || 'Municipal Street'}</small>
                      </div>
                    </div>
                  ))}
                  {(route.pickups?.length || 0) > 4 && (
                    <span className="more-stops">+{route.pickups.length - 4} more stops on route</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}