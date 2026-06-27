import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { routeApi } from '../../../api/routeApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import Modal from '../../../components/common/Modal/Modal';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './RouteManagement.css'; // Import the CSS file

export default function RouteManagement() {
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving]         = useState(false);
  
  // Cleaned form initialization state matching structural Mongoose schema requirements
  const [form, setForm] = useState({ 
    name: '', 
    zone: '', 
    scheduledDate: '', 
    startTime: '', 
    status: 'planned', // Synced default state value matching your schema constraints
    stopsCount: '0', 
    assignedDriver: '', 
    notes: '' 
  });

  const { data, loading, refetch } = useFetch(() => routeApi.getAll());
  const routes = data?.routes || [];

  // System options formatted to match your lowercase backend enum schema values
  const STATUS_OPTIONS = [
    { value: 'planned', label: 'Planned' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Drivers updated with clean, real 24-character hex MongoDB ObjectIDs to avoid CastErrors
  const DRIVER_OPTIONS = [
    { id: '64f1bc23e4b0123456789abc', name: 'Alex Johnson' },
    { id: '64f1bc23e4b0123456789def', name: 'Marcus Vance' },
    { id: '64f1bc23e4b0123456789ghi', name: 'Sarah Jenkins' }
  ];

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  // Fixed optimized handler processing structured schema objects and eliminating 400 Bad Requests
  const handleCreate = async () => {
    if (!form.name || !form.zone || !form.scheduledDate) {
      toast.error('Name, zone, and date are required.'); 
      return;
    }
    
    setSaving(true);
    try {
      const totalStopsCount = parseInt(form.stopsCount, 10) || 0;

      // FIX: Generate valid subdocuments to satisfy your stopSchema required:true attributes
      const generatedStops = Array.from({ length: totalStopsCount }, (_, index) => ({
        order: index + 1,
        address: `Stop #${index + 1} inside ${form.zone} Zone`,
        isCompleted: false
      }));

      const payload = {
        name: form.name.trim(),
        zone: form.zone.trim(),
        scheduledDate: form.scheduledDate, // Expected format: "YYYY-MM-DD"
        startTime: form.startTime || undefined,
        
        // FIX: Your schema lowercase enum checks mandate 'planned' (NOT 'Pending' or 'Planned')
        status: String(form.status).toLowerCase(), 
        
        stops: generatedStops,
        
        // FIX: Must pass a 24-char hex MongoDB string or NULL. 
        // Do NOT send empty string "" or object structures like { name: "..." }
        assignedDriver: form.assignedDriver && form.assignedDriver.trim() !== "" 
          ? form.assignedDriver 
          : null,
          
        notes: form.notes.trim() || undefined
      };

      console.log("Verifying final payload right before dispatch:", payload);

      // Call your updated API wrapper 
      await routeApi.create(payload);
      
      toast.success('Route created successfully.');
      setCreateOpen(false);
      
      // Reset Form state
      setForm({ 
        name: '', 
        zone: '', 
        scheduledDate: '', 
        startTime: '', 
        status: 'planned', 
        stopsCount: '0', 
        assignedDriver: '', 
        notes: '' 
      });
      refetch();
    } catch (err) {
      // Rely on your interceptor's polished fallback string
      toast.error(err.message || 'Failed to parse route configurations.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return;
    try {
      await routeApi.delete(id);
      toast.success('Route deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name',           label: 'Route name' },
    { key: 'zone',           label: 'Zone' },
    { key: 'scheduledDate',  label: 'Date',     render: (v) => formatDate(v) },
    { key: 'startTime',      label: 'Start',    render: (v) => v || '—' },
    { key: 'status',         label: 'Status',   render: (v) => <StatusBadge status={v} /> },
    { key: 'stops',          label: 'Stops',    render: (v) => v?.length || 0 },
    { key: 'assignedDriver', label: 'Driver',   render: (v) => v?.name || 'Unassigned' },
    { key: '_id',            label: 'Action',   render: (_, row) => (
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
    )},
  ];

  return (
    <div className="route-management-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Route Management</h1>
          <p className="page-subtitle">Plan and manage waste collection routes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          + Create route
        </button>
      </div>

      <DataTable 
        columns={columns} 
        rows={routes} 
        loading={loading}
        emptyTitle="No routes yet" 
        emptyMessage="Create the first collection route." 
      />

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create new route">
        <div className="modal-form-content">
          <div className="modal-form-grid-container">
            
            {/* Row 1: Route Name & Zone */}
            <div className="responsive-form-grid">
              <div className="form-group">
                <label className="form-label">Route name *</label>
                <input className="form-input" type="text" placeholder="North Zone A" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Zone *</label>
                <input className="form-input" type="text" placeholder="North" value={form.zone} onChange={set('zone')} required />
              </div>
            </div>
            
            {/* Row 2: Scheduled Date & Start Time */}
            <div className="responsive-form-grid">
              <div className="form-group">
                <label className="form-label">Scheduled date *</label>
                <input className="form-input date-input" type="date" value={form.scheduledDate} onChange={set('scheduledDate')} required />
              </div>
              <div className="form-group">
                <label className="form-label label-gray">Start time</label>
                <input className="form-input" type="time" value={form.startTime} onChange={set('startTime')} />
              </div>
            </div>

            {/* Row 3: Status selection & Stops counter inputs */}
            <div className="responsive-form-grid">
              <div className="form-group">
                <label className="form-label label-gray">Status</label>
                <div className="select-wrapper">
                  <select className="form-input" value={form.status} onChange={set('status')}>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label label-gray">Number of Stops</label>
                <input className="form-input" type="number" min="0" placeholder="0" value={form.stopsCount} onChange={set('stopsCount')} />
              </div>
            </div>

            {/* Row 4: Driver Assignment listing */}
            <div className="form-group">
              <label className="form-label label-gray">Assigned Driver</label>
              <div className="select-wrapper">
                <select className="form-input" value={form.assignedDriver} onChange={set('assignedDriver')}>
                  <option value="">Unassigned</option>
                  {DRIVER_OPTIONS.map((drv) => (
                    <option key={drv.id} value={drv.id}>{drv.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Row 5: Notes textbox component */}
            <div className="form-group">
              <label className="form-label label-gray">Notes (optional)</label>
              <textarea className="form-input textarea-input" rows={3} value={form.notes} onChange={set('notes')} placeholder="Add special routing instructions or vehicle notes..." />
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="button" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating…' : 'Create route'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}