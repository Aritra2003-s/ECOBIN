import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useFetch from '../../../hooks/useFetch';
import { pickupApi } from '../../../api/pickupApi';
import { reportApi } from '../../../api/reportApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import './History.css';

export default function History() {
  const [tab, setTab] = useState('pickups');
  const [search, setSearch] = useState('');

  const { data: pickupData, loading: pLoad } = useFetch(() => pickupApi.getAll({ limit: 50 }));
  const { data: reportData, loading: rLoad } = useFetch(() => reportApi.getAll({ limit: 50 }));

  const rawPickups = pickupData?.pickups || [];
  const rawReports = reportData?.reports || [];

  const filteredPickups = rawPickups.filter((p) =>
    (p.wasteType || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = rawReports.filter((r) =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const pickupCols = [
    {
      key: 'wasteType',
      label: 'Waste Category',
      render: (v) => <strong className="capitalize-text">{v?.replace('_', ' ')}</strong>,
    },
    {
      key: 'quantity',
      label: 'Estimated Quantity',
      render: (v) => `${v?.value || 1} ${v?.unit || 'kg'}`,
    },
    {
      key: 'preferredDate',
      label: 'Pickup Window',
      render: (v, row) => (
        <div>
          <span>{formatDate(v)}</span>
          <small className="cell-sub">{row.preferredTimeSlot}</small>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'createdAt',
      label: 'Requested On',
      render: (v) => formatDate(v),
    },
  ];

  const reportCols = [
    {
      key: 'title',
      label: 'Report Title',
      render: (v) => <strong>{v}</strong>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (v) => <span className="capitalize-text">{v}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'status',
      label: 'Resolution Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'createdAt',
      label: 'Filed On',
      render: (v) => formatDate(v),
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
      className="history-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="history-header" variants={itemVariants}>
        <div>
          <h1 className="page-title">Activity & Service History</h1>
          <p className="page-subtitle">Complete chronological record of all curbside requests and civic issue reports.</p>
        </div>
      </motion.div>

      {/* ── Tabs & Search Bar ─────────────────────────────────── */}
      <motion.div className="history-controls-row" variants={itemVariants}>
        <div className="history-tabs glass-panel">
          <button
            type="button"
            className={`history-tab-btn ${tab === 'pickups' ? 'active' : ''}`}
            onClick={() => setTab('pickups')}
          >
            <span>📦 Curbside Pickups ({rawPickups.length})</span>
          </button>
          <button
            type="button"
            className={`history-tab-btn ${tab === 'reports' ? 'active' : ''}`}
            onClick={() => setTab('reports')}
          >
            <span>⚑ Civic Incident Reports ({rawReports.length})</span>
          </button>
        </div>

        <div className="history-search-wrapper">
          <input
            type="text"
            className="history-search-input"
            placeholder="Search records by category, status, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* ── Table Surface ─────────────────────────────────────── */}
      <motion.div className="history-table-card glass-panel" variants={itemVariants}>
        {tab === 'pickups' && (
          <DataTable
            columns={pickupCols}
            rows={filteredPickups}
            loading={pLoad}
            emptyTitle="No pickup requests found"
            emptyMessage="You haven't requested any pickups or no records match your filter query."
          />
        )}

        {tab === 'reports' && (
          <DataTable
            columns={reportCols}
            rows={filteredReports}
            loading={rLoad}
            emptyTitle="No incident reports found"
            emptyMessage="No civic maintenance reports found matching your criteria."
          />
        )}
      </motion.div>
    </motion.div>
  );
}