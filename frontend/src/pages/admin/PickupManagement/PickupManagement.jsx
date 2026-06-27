import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import Modal from '../../../components/common/Modal/Modal';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './PickupManagement.css'; 

// Status Information Mapping
const filterMeta = {
  pending: {
    info: "Requests awaiting initial review and approval.",
    color: "#10b981" // Emerald Green for Pending
  },
  approved: {
    info: "Validated requests ready to be assigned to staff and vehicles.",
    color: "#3b82f6"
  },
  assigned: {
    info: "Tasks currently linked to staff and scheduled for collection.",
    color: "#3b82f6"
  },
  in_progress: {
    info: "Collections currently being handled by the field team.",
    color: "#3b82f6"
  },
  completed: {
    info: "Pickups that have been successfully finished.",
    color: "#3b82f6"
  },
  rejected: {
    info: "Requests that were declined due to non-compliance or errors.",
    color: "#ef4444"
  }
};

export default function PickupManagement() {
  const toast = useToast();
  const [filter, setFilter] = useState('pending'); // Default status
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionForm, setActionForm] = useState({ 
    status: '', staffId: '', vehicleId: '', rejectionReason: '', scheduledDate: '' 
  });
  const [saving, setSaving] = useState(false);

  // useFetch automatically re-runs when 'filter' changes
  const { data, loading, refetch } = useFetch(
    () => pickupApi.getAll({ status: filter, limit: 50 }),
    [filter]
  );
  const pickups = data?.pickups || [];

  // Function triggered by "Manage" button in the table
  const openAction = (pickup) => {
    setSelected(pickup);
    // Reset form to empty or suggested next status
    setActionForm({ status: '', staffId: '', vehicleId: '', rejectionReason: '', scheduledDate: '' });
    setModalOpen(true);
  };

  // Logic to update the status for the NEXT process
  const handleAction = async () => {
    if (!actionForm.status) { 
      toast.error('Select a new status for the next process.'); 
      return; 
    }
    setSaving(true);
    try {
      await pickupApi.updateStatus(selected._id, actionForm);
      toast.success(`Pickup moved to ${actionForm.status.replace('_', ' ')}.`);
      setModalOpen(false);
      refetch(); // Refresh list to reflect the status change
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'requestedBy', label: 'User', render: (v) => v?.name || '—' },
    { key: 'wasteType', label: 'Type', render: (v) => <span className="capitalize-text">{v?.replace('_',' ')}</span> },
    { key: 'quantity', label: 'Qty', render: (v) => `${v?.value} ${v?.unit}` },
    { key: 'preferredDate', label: 'Pref. Date', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: '_id', label: 'Action', render: (_, row) => (
      <button className="btn btn-secondary btn-sm" onClick={() => openAction(row)}>Manage</button>
    )},
  ];

  const statusFilters = Object.keys(filterMeta);

  return (
    <div className="pickup-management-container">
      <header className="page-header">
        <h1 className="page-title">Pickup Management</h1>
        <p className="page-subtitle">Review, approve, and assign waste pickup requests.</p>
      </header>

      {/* Filter Tabs with onClick functionality */}
      <nav className="filter-tabs-container">
        {statusFilters.map((s) => (
          <button 
            key={s} 
            onClick={() => setFilter(s)} // Updates info bar and table data
            className={`filter-tab-btn ${filter === s ? 'active' : ''}`}
            style={filter === s ? { backgroundColor: filterMeta[s].color } : {}}
          >
            {s.replace('_',' ')}
          </button>
        ))}
      </nav>

      {/* Dynamic Status Information Bar */}
      <div className="status-info-bar" style={{ borderLeftColor: filterMeta[filter].color }}>
        <p>
          Showing <strong>{filter.replace('_', ' ')}</strong> requests: {filterMeta[filter].info}
        </p>
      </div>

      <DataTable 
        columns={columns} 
        rows={pickups} 
        loading={loading}
        emptyTitle={`No ${filter.replace('_', ' ')} pickups`} 
        emptyMessage="Nothing to show for this status." 
      />

      {/* Modal for Managing Next Steps */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Pickup Status">
        {selected && (
          <div className="modal-form-content">
            <div className="pickup-summary-card">
              <strong>{selected.requestedBy?.name}</strong> — {selected.wasteType?.replace('_',' ')}<br />
              <small>{selected.pickupAddress?.city}</small>
            </div>

            <div className="form-group">
              <label>Move to Next Process *</label>
              <select 
                className="form-input"
                value={actionForm.status}
                onChange={(e) => setActionForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="">Choose next step...</option>
                <option value="approved">Approve</option>
                <option value="assigned">Assign to Staff</option>
                <option value="in_progress">Set In Progress</option>
                <option value="completed">Complete Pickup</option>
                <option value="rejected">Reject Request</option>
              </select>
            </div>

            {/* Conditional Fields based on action selection */}
            {actionForm.status === 'assigned' && (
              <div className="assignment-fields">
                <input className="form-input" placeholder="Staff ID" onChange={(e) => setActionForm(p => ({...p, staffId: e.target.value}))} />
                <input className="form-input" placeholder="Vehicle ID" onChange={(e) => setActionForm(p => ({...p, vehicleId: e.target.value}))} />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAction} disabled={saving}>
                {saving ? 'Processing...' : 'Update Process'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}