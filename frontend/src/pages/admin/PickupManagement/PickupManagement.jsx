import { useState, useEffect } from 'react';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import Modal from '../../../components/common/Modal/Modal';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './PickupManagement.css'; 

// Seed data fallback matching backend seedData.js
const SEED_STAFF = [
  { _id: '69f841fe07129e2d0c5b6db1', employeeId: 'EMP001', name: 'Rajesh Kumar', role: 'driver', phone: '+91 70000 10001', availability: 'available' },
  { _id: '69f841fe07129e2d0c5b6db2', employeeId: 'EMP002', name: 'Mohan Singh', role: 'driver', phone: '+91 70000 10002', availability: 'available' },
  { _id: '69f841fe07129e2d0c5b6db3', employeeId: 'EMP003', name: 'Deepa Roy', role: 'collector', phone: '+91 70000 10003', availability: 'available' },
  { _id: '69f841fe07129e2d0c5b6db4', employeeId: 'EMP004', name: 'Vikram Patil', role: 'supervisor', phone: '+91 70000 10004', availability: 'available' },
];

const SEED_VEHICLES = [
  { _id: '69f841fe07129e2d0c5b6db6', registrationNumber: 'WB-02-AB-1234', type: 'compactor', model: 'Tata Ultra 1518', status: 'available' },
  { _id: '69f841fe07129e2d0c5b6db7', registrationNumber: 'WB-02-CD-5678', type: 'large_truck', model: 'Ashok Leyland 2518', status: 'available' },
  { _id: '69f841fe07129e2d0c5b6db8', registrationNumber: 'WB-02-EF-9012', type: 'recycling_van', model: 'Mahindra Supro', status: 'available' },
  { _id: '69f841fe07129e2d0c5b6db9', registrationNumber: 'WB-02-GH-3456', type: 'hazmat_vehicle', model: 'Force Traveller HazMat', status: 'maintenance' },
];

// Status Information Mapping
const filterMeta = {
  pending: {
    info: "Requests awaiting initial review and approval.",
    color: "#10b981"
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
  const [staffList, setStaffList] = useState(SEED_STAFF);
  const [vehicleList, setVehicleList] = useState(SEED_VEHICLES);
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

  // Load live staff and vehicles from backend resources API (with seed fallback)
  useEffect(() => {
    pickupApi.getResources()
      .then((res) => {
        if (res.data?.data?.staff?.length) {
          setStaffList(res.data.data.staff);
        }
        if (res.data?.data?.vehicles?.length) {
          setVehicleList(res.data.data.vehicles);
        }
      })
      .catch(() => {
        // Keeps SEED_STAFF and SEED_VEHICLES
      });
  }, []);

  // Function triggered by "Manage" button in the table
  const openAction = (pickup) => {
    setSelected(pickup);
    setActionForm({ 
      status: '', 
      staffId: pickup.assignedTo?.staff?._id || '', 
      vehicleId: pickup.assignedTo?.vehicle?._id || '', 
      rejectionReason: '', 
      scheduledDate: pickup.scheduledDate ? pickup.scheduledDate.split('T')[0] : '' 
    });
    setModalOpen(true);
  };

  // Logic to update the status for the NEXT process
  const handleAction = async () => {
    if (!actionForm.status) { 
      toast.error('Select a new status for the next process.'); 
      return; 
    }

    if (actionForm.status === 'assigned') {
      if (!actionForm.staffId) {
        toast.error('Please select a Staff ID / member from the dropdown.');
        return;
      }
      if (!actionForm.vehicleId) {
        toast.error('Please select a Vehicle Number from the dropdown.');
        return;
      }
    }

    if (actionForm.status === 'rejected' && !actionForm.rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting this pickup.');
      return;
    }

    setSaving(true);
    try {
      await pickupApi.updateStatus(selected._id, actionForm);
      toast.success(`Pickup moved to ${actionForm.status.replace('_', ' ')}.`);
      setModalOpen(false);
      refetch(); // Refresh list to reflect the status change
    } catch (err) {
      toast.error(err.message || 'Failed to update pickup status.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'requestedBy', label: 'User', render: (v) => v?.name || '—' },
    { key: 'wasteType', label: 'Type', render: (v) => <span className="capitalize-text">{v?.replace('_',' ')}</span> },
    { key: 'quantity', label: 'Qty', render: (v) => `${v?.value} ${v?.unit}` },
    { key: 'preferredDate', label: 'Pref. Date', render: (v) => formatDate(v) },
    { key: 'assignedTo', label: 'Assigned', render: (v) => v?.staff?.name ? `${v.staff.name} (${v.vehicle?.registrationNumber || 'No vehicle'})` : '—' },
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
              <small>{selected.pickupAddress?.street}, {selected.pickupAddress?.city}</small>
            </div>

            <div className="form-group">
              <label className="form-label">Move to Next Process *</label>
              <div className="select-wrapper">
                <select 
                  className="form-input"
                  value={actionForm.status}
                  onChange={(e) => setActionForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="">Choose next step...</option>
                  <option value="approved">Approve</option>
                  <option value="assigned">Assign to Staff & Vehicle</option>
                  <option value="in_progress">Set In Progress</option>
                  <option value="completed">Complete Pickup</option>
                  <option value="rejected">Reject Request</option>
                </select>
              </div>
            </div>

            {/* Conditional Dropdown Fields when assigning staff & vehicle */}
            {actionForm.status === 'assigned' && (
              <div className="assignment-fields">
                <div className="form-group">
                  <label className="form-label">Assign Staff ID / Member *</label>
                  <div className="select-wrapper">
                    <select 
                      className="form-input" 
                      value={actionForm.staffId} 
                      onChange={(e) => setActionForm(p => ({ ...p, staffId: e.target.value }))}
                      required
                    >
                      <option value="">Select Staff (Driver / Collector)...</option>
                      {staffList.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.employeeId} — {s.name} ({s.role.toUpperCase()}){s.availability ? ` • ${s.availability.replace('_', ' ')}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Vehicle Number *</label>
                  <div className="select-wrapper">
                    <select 
                      className="form-input" 
                      value={actionForm.vehicleId} 
                      onChange={(e) => setActionForm(p => ({ ...p, vehicleId: e.target.value }))}
                      required
                    >
                      <option value="">Select Vehicle Number...</option>
                      {vehicleList.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} — {v.model || v.type} ({v.type.replace('_', ' ')}){v.status ? ` • ${v.status}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label label-gray">Scheduled Date (optional)</label>
                  <input 
                    className="form-input date-input" 
                    type="date" 
                    value={actionForm.scheduledDate} 
                    onChange={(e) => setActionForm(p => ({ ...p, scheduledDate: e.target.value }))} 
                  />
                </div>
              </div>
            )}

            {/* Conditional Rejection Reason */}
            {actionForm.status === 'rejected' && (
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea 
                  className="form-input textarea-input" 
                  rows={3} 
                  placeholder="Explain why this request is being rejected..." 
                  value={actionForm.rejectionReason} 
                  onChange={(e) => setActionForm(p => ({ ...p, rejectionReason: e.target.value }))} 
                  required
                />
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