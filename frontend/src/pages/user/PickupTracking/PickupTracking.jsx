import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import StatusBadge from '../../../components/common/StatusBadge';
import Loader from '../../../components/common/Loader/Loader';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import { formatDate, formatDateTime } from '../../../utils/formatDate';
import './PickupTracking.css';

const STATUS_STEPS = [
  { id: 'pending', label: 'Requested', desc: 'Awaiting dispatch confirmation', icon: '📝' },
  { id: 'approved', label: 'Approved', desc: 'Slot locked in schedule', icon: '👍' },
  { id: 'assigned', label: 'Assigned', desc: 'Driver & vehicle assigned', icon: '🚚' },
  { id: 'in_progress', label: 'In Transit', desc: 'Driver en route to location', icon: '⚡' },
  { id: 'completed', label: 'Collected', desc: 'Verified & weighed at facility', icon: '✅' },
];

export default function PickupTracking() {
  const [selected, setSelected] = useState(null);
  const { data, loading } = useFetch(() =>
    pickupApi.getAll({ status: ['pending', 'approved', 'assigned', 'in_progress', 'completed'].join(',') })
  );
  const pickups = data?.pickups || [];

  // Auto-select first pickup if none selected
  const activePickup = selected || pickups[0];

  if (loading) return <Loader fullscreen message="Connecting to municipal fleet GPS radar..." />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className="tracking-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="tracking-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Live Driver & Pickup Telemetry</h1>
            <span className="live-gps-pill">
              <span className="pulse-dot"></span>
              <span>GPS Fleet Signal Active</span>
            </span>
          </div>
          <p className="page-subtitle">
            Track real-time status milestones, assigned vehicle coordinates, and collection proofs.
          </p>
        </div>
      </motion.div>

      {pickups.length === 0 ? (
        <EmptyState
          title="No active collections found"
          message="All your past pickups are completed or you haven't scheduled any collection requests yet."
          actionText="Book New Pickup"
          actionLink="/pickup-request"
        />
      ) : (
        <div className="tracking-workspace-grid">
          {/* Left Column: List of Pickups */}
          <div className="tracking-sidebar-list">
            <span className="list-title">ACTIVE & RECENT DISPATCHES ({pickups.length})</span>
            <div className="pickup-cards-stack">
              {pickups.map((p) => {
                const isSelected = (activePickup?._id === p._id);
                return (
                  <motion.div
                    key={p._id}
                    className={`tracking-item-card glass-card ${isSelected ? 'active-card' : ''}`}
                    onClick={() => setSelected(p)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="card-top-row">
                      <strong className="item-waste-type">
                        {p.wasteType?.replace('_', ' ')}
                      </strong>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="item-date">
                      📅 Preferred: {formatDate(p.preferredDate)} • {p.preferredTimeSlot}
                    </p>
                    <span className="item-addr">
                      📍 {p.pickupAddress?.street}, {p.pickupAddress?.city}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Radar & Milestone Pipeline */}
          {activePickup && (
            <motion.div className="tracking-main-telemetry glass-panel" variants={itemVariants}>
              {/* Radar Simulation Banner */}
              <div className="gps-radar-banner">
                <div className="radar-ping-ring">
                  <div className="radar-core-dot" />
                </div>
                <div className="radar-info">
                  <span className="radar-tag">LIVE TELEMETRY STREAM</span>
                  <h3>{activePickup.status === 'in_progress' ? 'Driver is en route to your address' : 'Order status updated in central grid'}</h3>
                  <p>
                    {activePickup.assignedTo?.vehicle
                      ? `Vehicle: ${activePickup.assignedTo.vehicle.registrationNumber || 'Municipal Truck #4B'}`
                      : 'Assigned to Municipal Waste Fleet Sector 4'}
                  </p>
                </div>
              </div>

              {/* Progress Milestones Line */}
              <div className="milestone-pipeline-box">
                <h4>Fulfillment Journey</h4>
                <div className="pipeline-steps-wrapper">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = STATUS_STEPS.findIndex((s) => s.id === activePickup.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.id} className={`pipeline-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}>
                        <div className="step-circle">
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="step-content">
                          <strong className="step-name">{step.label}</strong>
                          <span className="step-sub">{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Breakdown Card */}
              <div className="tracking-details-grid">
                <div className="detail-item glass-card">
                  <span className="detail-lbl">Waste Category</span>
                  <strong className="detail-val">{activePickup.wasteType?.replace('_', ' ')}</strong>
                </div>

                <div className="detail-item glass-card">
                  <span className="detail-lbl">Volume / Quantity</span>
                  <strong className="detail-val">{activePickup.quantity?.value || 1} {activePickup.quantity?.unit || 'kg'}</strong>
                </div>

                <div className="detail-item glass-card">
                  <span className="detail-lbl">Collection Slot</span>
                  <strong className="detail-val">{activePickup.preferredTimeSlot} ({formatDate(activePickup.preferredDate)})</strong>
                </div>

                <div className="detail-item glass-card">
                  <span className="detail-lbl">Service Address</span>
                  <strong className="detail-val">{activePickup.pickupAddress?.street}, {activePickup.pickupAddress?.city}</strong>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}