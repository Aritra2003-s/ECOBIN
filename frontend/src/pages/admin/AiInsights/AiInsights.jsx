import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFetch from '../../../hooks/useFetch';
import { aiApi } from '../../../api/aiApi';
import Loader from '../../../components/common/Loader/Loader';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './AiInsights.css';

export default function AiInsights() {
  const toast = useToast();
  const [filter, setFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'unread'
  const { data, loading, refetch } = useFetch(() => aiApi.getInsights({ limit: 50 }));
  const insights = data?.insights || [];

  const handleMarkRead = async (id) => {
    try {
      await aiApi.markRead(id);
      toast.success('AI insight acknowledged');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to update insight');
    }
  };

  const filteredInsights = insights.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'high') return item.severity === 'high';
    if (filter === 'medium') return item.severity === 'medium';
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  if (loading) return <Loader fullscreen message="Querying neural anomaly detection network..." />;

  return (
    <motion.div
      className="ai-insights-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="insights-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Neural Predictions & Anomaly Stream</h1>
            <span className="neural-badge">
              <span className="pulse-dot"></span>
              <span>Vision AI 2.0 Continuous Monitor</span>
            </span>
          </div>
          <p className="page-subtitle">
            Edge sensor logs, container overflow forecasts, contamination hotspots, and autonomous municipal action directives.
          </p>
        </div>
      </motion.div>

      {/* ── Filters Row ────────────────────────────────────────── */}
      <motion.div className="insights-controls-row" variants={itemVariants}>
        <div className="filter-pills glass-panel">
          {[
            { id: 'all', label: `All Alerts (${insights.length})` },
            { id: 'high', label: '🔴 High Priority' },
            { id: 'medium', label: '🟡 Medium Urgency' },
            { id: 'unread', label: '⚡ Unacknowledged' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-pill-btn ${filter === tab.id ? 'active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Insights Cards Grid ────────────────────────────────── */}
      {filteredInsights.length === 0 ? (
        <motion.div className="insights-empty-panel glass-panel" variants={itemVariants}>
          <span>✨</span>
          <h3>All Municipal Nodes Normal</h3>
          <p>No anomaly events match the selected filter category.</p>
        </motion.div>
      ) : (
        <div className="insights-masonry-grid">
          <AnimatePresence>
            {filteredInsights.map((ins) => (
              <motion.div
                key={ins._id}
                className={`insight-console-card glass-panel ${ins.isRead ? 'read' : ''}`}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                whileHover={{ y: -3 }}
              >
                <div className="insight-card-top">
                  <span className="category-tag">{ins.category || 'Route Telematics'}</span>
                  <span className={`severity-badge ${ins.severity || 'medium'}`}>
                    {ins.severity ? ins.severity.toUpperCase() : 'ACTIVE'}
                  </span>
                </div>

                <h3 className="insight-card-title">{ins.title}</h3>
                <p className="insight-card-desc">{ins.description}</p>

                <div className="insight-card-footer">
                  <span className="insight-time">
                    Generated {formatDate(ins.createdAt)}
                  </span>
                  {!ins.isRead && (
                    <button
                      className="btn-ack-alert"
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
    </motion.div>
  );
}