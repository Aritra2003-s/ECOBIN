import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import Modal from '../../../components/common/Modal/Modal';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './PickupManagement.css';

const SEED_STAFF = [
  { _id: '69f841fe07129e2d0c5b6db1', employeeId: 'EMP001', name: 'Rajesh Kumar', role: 'driver', phone: '+91 70000 10001' },
  { _id: '69f841fe07129e2d0c5b6db2', employeeId: 'EMP002', name: 'Mohan Singh', role: 'driver', phone: '+91 70000 10002' },
  { _id: '69f841fe07129e2d0c5b6db3', employeeId: 'EMP003', name: 'Amitabh Mukherjee', role: 'driver', phone: '+91 70000 10003' },
  { _id: '69f841fe07129e2d0c5b6db4', employeeId: 'EMP004', name: 'Subhash Chandra', role: 'driver', phone: '+91 70000 10004' },
  { _id: '69f841fe07129e2d0c5b6db5', employeeId: 'EMP005', name: 'Rameshwar Gupta', role: 'driver', phone: '+91 70000 10005' },
  { _id: '69f841fe07129e2d0c5b6db6', employeeId: 'EMP006', name: 'Vikramaditya Roy', role: 'driver', phone: '+91 70000 10006' },
  { _id: '69f841fe07129e2d0c5b6db7', employeeId: 'EMP007', name: 'Arjun Sen', role: 'driver', phone: '+91 70000 10007' },
  { _id: '69f841fe07129e2d0c5b6db8', employeeId: 'EMP008', name: 'Devendra Prasad', role: 'driver', phone: '+91 70000 10008' },
  { _id: '69f841fe07129e2d0c5b6db9', employeeId: 'EMP009', name: 'Kalyan Banerjee', role: 'driver', phone: '+91 70000 10009' },
  { _id: '69f841fe07129e2d0c5b6dba', employeeId: 'EMP010', name: 'Gurpreet Singh', role: 'driver', phone: '+91 70000 10010' },
  { _id: '69f841fe07129e2d0c5b6dbb', employeeId: 'EMP011', name: 'Pradeep Sharma', role: 'driver', phone: '+91 70000 10011' },
  { _id: '69f841fe07129e2d0c5b6dbc', employeeId: 'EMP012', name: 'Manoj Halder', role: 'driver', phone: '+91 70000 10012' },
];

const SEED_VEHICLES = [
  { _id: '69f841fe07129e2d0c5b6dbd', registrationNumber: 'WB-02-AB-1234', type: 'compactor', model: 'Tata Ultra 1518' },
  { _id: '69f841fe07129e2d0c5b6dbe', registrationNumber: 'WB-02-CD-5678', type: 'large_truck', model: 'Ashok Leyland 2518' },
  { _id: '69f841fe07129e2d0c5b6dbf', registrationNumber: 'WB-02-EF-9012', type: 'recycling_van', model: 'Mahindra Supro EV' },
  { _id: '69f841fe07129e2d0c5b6dc0', registrationNumber: 'WB-02-GH-3456', type: 'hazmat_vehicle', model: 'Force Traveller HazMat' },
  { _id: '69f841fe07129e2d0c5b6dc1', registrationNumber: 'WB-02-IJ-7890', type: 'compactor', model: 'Eicher Pro 3015' },
  { _id: '69f841fe07129e2d0c5b6dc2', registrationNumber: 'WB-02-KL-2345', type: 'recycling_van', model: 'Tata Ace Gold Eco' },
  { _id: '69f841fe07129e2d0c5b6dc3', registrationNumber: 'WB-02-MN-6789', type: 'large_truck', model: 'BharatBenz 1917 Tipper' },
  { _id: '69f841fe07129e2d0c5b6dc4', registrationNumber: 'WB-02-OP-0123', type: 'compactor', model: 'Ashok Leyland Ecomet' },
  { _id: '69f841fe07129e2d0c5b6dc5', registrationNumber: 'WB-02-QR-4567', type: 'recycling_van', model: 'Mahindra Bolero Maxi' },
  { _id: '69f841fe07129e2d0c5b6dc6', registrationNumber: 'WB-02-ST-8901', type: 'large_truck', model: 'Tata Prima 2830' },
  { _id: '69f841fe07129e2d0c5b6dc7', registrationNumber: 'WB-02-UV-2345', type: 'recycling_van', model: 'Force Urbania EV' },
  { _id: '69f841fe07129e2d0c5b6dc8', registrationNumber: 'WB-02-WX-6789', type: 'compactor', model: 'Tata Ultra T.7' },
];

const STATUS_TABS = [
  { id: 'pending', label: 'Pending Review', color: '#F59E0B' },
  { id: 'approved', label: 'Approved Queue', color: '#0EA5E9' },
  { id: 'assigned', label: 'Assigned Drivers', color: '#8B5CF6' },
  { id: 'in_progress', label: 'In Transit', color: '#10B981' },
  { id: 'completed', label: 'Completed', color: '#059669' },
];

export default function PickupManagement() {
  const toast = useToast();
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [staffList, setStaffList] = useState(SEED_STAFF);
  const [vehicleList, setVehicleList] = useState(SEED_VEHICLES);
  const [actionForm, setActionForm] = useState({
    status: '',
    staffId: '',
    vehicleId: '',
    rejectionReason: '',
    scheduledDate: '',
  });
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useFetch(
    () => pickupApi.getAll({ status: filter, limit: 50 }),
    [filter]
  );
  const pickups = data?.pickups || [];

  useEffect(() => {
    pickupApi.getResources()
      .then((res) => {
        if (res.data?.data?.staff?.length) setStaffList(res.data.data.staff);
        if (res.data?.data?.vehicles?.length) setVehicleList(res.data.data.vehicles);
      })
      .catch(() => {});
  }, []);

  const openAction = (pickup) => {
    setSelected(pickup);
    setActionForm({
      status: '',
      staffId: pickup.assignedTo?.staff?._id || '',
      vehicleId: pickup.assignedTo?.vehicle?._id || '',
      rejectionReason: '',
      scheduledDate: pickup.scheduledDate ? pickup.scheduledDate.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!actionForm.status && !actionForm.staffId && !actionForm.vehicleId && !actionForm.scheduledDate) {
      toast.error('Please modify status, assign resources, or pick a date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        status: actionForm.status || selected.status,
        staffId: actionForm.staffId || undefined,
        vehicleId: actionForm.vehicleId || undefined,
        rejectionReason: actionForm.rejectionReason || undefined,
        scheduledDate: actionForm.scheduledDate ? new Date(actionForm.scheduledDate).toISOString() : undefined,
      };

      await pickupApi.updateStatus(selected._id, payload);
      toast.success('Pickup dispatch updated successfully!');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'wasteType',
      label: 'Waste Category',
      render: (v) => <strong className="capitalize-text">{v?.replace('_', ' ')}</strong>,
    },
    {
      key: 'user',
      label: 'Citizen User',
      render: (v) => (
        <div>
          <span>{v?.name || 'Citizen'}</span>
          <small className="cell-meta">{v?.phone || v?.email || '—'}</small>
        </div>
      ),
    },
    {
      key: 'pickupAddress',
      label: 'Location / Ward',
      render: (v) => `${v?.street}, ${v?.city}`,
    },
    {
      key: 'preferredDate',
      label: 'Scheduled Slot',
      render: (v, row) => (
        <div>
          <span>{formatDate(v)}</span>
          <small className="cell-meta">{row.preferredTimeSlot}</small>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'actions',
      label: 'Management',
      render: (_, row) => (
        <button
          type="button"
          className="btn-manage-row"
          onClick={() => openAction(row)}
        >
          ⚙ Dispatch & Edit
        </button>
      ),
    },
  ];

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
      className="pickup-mgmt-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mgmt-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Pickup Dispatch & Route Queue</h1>
            <span className="dispatch-live-badge">
              <span className="pulse-dot"></span>
              <span>Central Fleet Controller</span>
            </span>
          </div>
          <p className="page-subtitle">
            Validate curbside requests, assign municipal drivers, allocate compactor trucks, and track fulfillment SLAs.
          </p>
        </div>
      </motion.div>

      {/* ── Status Tabs Switcher ──────────────────────────────── */}
      <motion.div className="status-tabs-row glass-panel" variants={itemVariants}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`status-tab-btn ${filter === tab.id ? 'active' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            <span className="status-tab-dot" style={{ background: tab.color }} />
            <span>{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Data Table Surface ─────────────────────────────────── */}
      <motion.div className="mgmt-table-card glass-panel" variants={itemVariants}>
        <DataTable
          columns={columns}
          rows={pickups}
          loading={loading}
          emptyTitle={`No ${filter.replace('_', ' ')} requests`}
          emptyMessage="All requests in this category have been processed or moved to next stage."
        />
      </motion.div>

      {/* ── Dispatch Allocation Modal ──────────────────────────── */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Dispatch Management: ${selected?.wasteType?.replace('_', ' ')}`}
        >
          <div className="dispatch-modal-content">
            <div className="form-group">
              <label className="form-label">Update Status Milestone</label>
              <select
                className="form-input"
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
              >
                <option value="">Keep current ({selected?.status})</option>
                <option value="approved">Approve Request</option>
                <option value="assigned">Assign Driver & Vehicle</option>
                <option value="in_progress">Set In Transit</option>
                <option value="completed">Mark as Completed / Weighed</option>
                <option value="rejected">Reject Request</option>
              </select>
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label className="form-label">Assign Field Driver</label>
                <select
                  className="form-input"
                  value={actionForm.staffId}
                  onChange={(e) => setActionForm({ ...actionForm, staffId: e.target.value })}
                >
                  <option value="">Select driver...</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.employeeId} - {s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Vehicle</label>
                <select
                  className="form-input"
                  value={actionForm.vehicleId}
                  onChange={(e) => setActionForm({ ...actionForm, vehicleId: e.target.value })}
                >
                  <option value="">Select vehicle...</option>
                  {vehicleList.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.model} - {v.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Dispatch Date</label>
              <input
                type="date"
                className="form-input"
                value={actionForm.scheduledDate}
                onChange={(e) => setActionForm({ ...actionForm, scheduledDate: e.target.value })}
              />
            </div>

            {actionForm.status === 'rejected' && (
              <div className="form-group">
                <label className="form-label">Reason for Rejection</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Non-compliant hazardous chemical contamination"
                  value={actionForm.rejectionReason}
                  onChange={(e) => setActionForm({ ...actionForm, rejectionReason: e.target.value })}
                />
              </div>
            )}

            <div className="modal-actions-footer">
              <button className="btn-modal-cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Updating Dispatch...' : 'Confirm Dispatch Allocation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}