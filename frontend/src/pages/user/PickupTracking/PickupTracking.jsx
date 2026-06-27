import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import StatusBadge from '../../../components/common/StatusBadge';
import Loader from '../../../components/common/Loader/Loader';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import { formatDate, formatDateTime } from '../../../utils/formatDate';
import './PickupTracking.css'; // Import the CSS file

const STATUS_STEPS = ['pending', 'approved', 'assigned', 'in_progress', 'completed'];

export default function PickupTracking() {
  const [selected, setSelected] = useState(null);
  const { data, loading } = useFetch(() => pickupApi.getAll({ status: ['pending', 'approved', 'assigned', 'in_progress'].join(',') }));
  const pickups = data?.pickups || [];

  if (loading) return <Loader />;

  return (
    <div className="tracking-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Track Pickups</h1>
          <p className="page-subtitle">Monitor your active and pending pickup requests.</p>
        </div>
      </div>

      {pickups.length === 0 ? (
        <EmptyState 
          title="No active pickups" 
          message="All your pickups are either completed or you haven't requested one yet." 
        />
      ) : (
        <div className="tracking-grid">
          
          {/* ── List Area ── */}
          <div className="pickup-list">
            {pickups.map((p) => (
              <div 
                key={p._id} 
                className={`card pickup-card ${selected?._id === p._id ? 'selected' : ''}`}
                onClick={() => setSelected(p)}
              >
                <div className="pickup-card-header">
                  <span className="pickup-card-title">
                    {p.wasteType.replace('_', ' ')} pickup
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="pickup-card-text">
                  Preferred: {formatDate(p.preferredDate)} · {p.preferredTimeSlot}
                </p>
                <p className="pickup-card-subtext">
                  {p.pickupAddress?.street}, {p.pickupAddress?.city}
                </p>
              </div>
            ))}
          </div>

          {/* ── Details Area ── */}
          {selected && (
            <div className="card details-card">
              <h2 className="details-title">Pickup details</h2>

              {/* Progress bar */}
              <div className="progress-container">
                <div className="progress-track">
                  {STATUS_STEPS.map((s, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(selected.status);
                    const done = i <= currentIdx;
                    return (
                      <div key={s} className="progress-step">
                        <div className={`progress-icon ${done ? 'done' : 'pending'}`}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span className={`progress-label ${done ? 'done' : 'pending'}`}>
                          {s.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Rows */}
              <div className="details-list">
                <Row label="Waste type"    value={selected.wasteType} />
                <Row label="Quantity"      value={`${selected.quantity?.value} ${selected.quantity?.unit}`} />
                <Row label="Preferred date" value={formatDate(selected.preferredDate)} />
                <Row label="Time slot"     value={selected.preferredTimeSlot} />
                <Row label="Address"       value={`${selected.pickupAddress?.street}, ${selected.pickupAddress?.city}`} />
                {selected.assignedTo?.staff && (
                  <Row label="Assigned driver" value={selected.assignedTo.staff.name} />
                )}
                {selected.assignedTo?.vehicle && (
                  <Row label="Vehicle" value={selected.assignedTo.vehicle.registrationNumber} />
                )}
                {selected.scheduledDate && (
                  <Row label="Scheduled for" value={formatDateTime(selected.scheduledDate)} />
                )}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

// ── Extracted Row Component ──
function Row({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}