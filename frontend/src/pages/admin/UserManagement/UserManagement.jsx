import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useFetch from '../../../hooks/useFetch';
import { userApi } from '../../../api/userApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import './UserManagement.css';

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, loading } = useFetch(
    () => userApi.getAll({ role: roleFilter || undefined, limit: 50 }),
    [roleFilter]
  );
  const users = data?.users || [];

  const filteredUsers = users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Citizen User',
      render: (v, row) => (
        <div className="user-table-cell">
          <div className="user-cell-avatar">
            {v?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <strong className="user-cell-name">{v}</strong>
            <span className="user-cell-email">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Access Role',
      render: (v) => (
        <span className={`role-pill ${v === 'admin' ? 'admin' : 'user'}`}>
          {v === 'admin' ? '⚡ Administrator' : '🌿 Citizen'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (v) => v || '—',
    },
    {
      key: 'isActive',
      label: 'Account Status',
      render: (v) => <StatusBadge status={v !== false ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      label: 'Member Since',
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
      className="user-mgmt-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="user-mgmt-header" variants={itemVariants}>
        <div>
          <h1 className="page-title">Citizen & Role Directory</h1>
          <p className="page-subtitle">Manage registered resident accounts, municipal operators, and administrative security roles.</p>
        </div>
      </motion.div>

      {/* ── Controls Row ───────────────────────────────────────── */}
      <motion.div className="user-controls-row" variants={itemVariants}>
        <div className="role-filter-tabs glass-panel">
          {[
            { id: '', label: 'All Accounts' },
            { id: 'user', label: 'Citizens' },
            { id: 'admin', label: 'Administrators' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`role-tab-btn ${roleFilter === tab.id ? 'active' : ''}`}
              onClick={() => setRoleFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="user-search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search citizens by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* ── Table Card ─────────────────────────────────────────── */}
      <motion.div className="user-table-card glass-panel" variants={itemVariants}>
        <DataTable
          columns={columns}
          rows={filteredUsers}
          loading={loading}
          emptyTitle="No citizens found"
          emptyMessage="No user records matched the selected role filter or search query."
        />
      </motion.div>
    </motion.div>
  );
}