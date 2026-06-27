import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import { reportApi } from '../../../api/reportApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import './History.css'; // Import the CSS file

export default function History() {
  const [tab, setTab] = useState('pickups');

  const { data: pickupData, loading: pLoad } = useFetch(() => pickupApi.getAll({ limit: 50 }));
  const { data: reportData, loading: rLoad } = useFetch(() => reportApi.getAll({ limit: 50 }));

  const pickupCols = [
    { key: 'wasteType',    label: 'Type',      render: (v) => <span className="capitalize-text">{v.replace('_',' ')}</span> },
    { key: 'quantity',     label: 'Quantity',  render: (v) => `${v?.value} ${v?.unit}` },
    { key: 'preferredDate', label: 'Date',     render: (v) => formatDate(v) },
    { key: 'status',       label: 'Status',    render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt',    label: 'Requested', render: (v) => formatDate(v) },
  ];

  const reportCols = [
    { key: 'title',     label: 'Title' },
    { key: 'category',  label: 'Category',  render: (v) => <span className="capitalize-text">{v}</span> },
    { key: 'priority',  label: 'Priority',  render: (v) => <StatusBadge status={v} /> },
    { key: 'status',    label: 'Status',    render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Reported',  render: (v) => formatDate(v) },
  ];

  return (
    <div className="history-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My History</h1>
          <p className="page-subtitle">All your past pickups and waste reports.</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="history-tabs-container">
        {['pickups', 'reports'].map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={`history-tab-btn ${tab === t ? 'active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Data Tables ── */}
      {tab === 'pickups' && (
        <DataTable
          columns={pickupCols}
          rows={pickupData?.pickups || []}
          loading={pLoad}
          emptyTitle="No pickups yet"
          emptyMessage="Request your first pickup and it will appear here."
        />
      )}

      {tab === 'reports' && (
        <DataTable
          columns={reportCols}
          rows={reportData?.reports || []}
          loading={rLoad}
          emptyTitle="No reports yet"
          emptyMessage="Submit a waste report and it will appear here."
        />
      )}
    </div>
  );
}