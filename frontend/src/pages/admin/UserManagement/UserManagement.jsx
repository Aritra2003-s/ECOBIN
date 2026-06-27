import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { userApi } from '../../../api/userApi';
import DataTable from '../../../components/tables/DataTable/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import useToast from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatDate';
import './UserManagement.css'; // Import the CSS file

export default function UserManagement() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { data, loading, refetch } = useFetch(
    () => userApi.getAll({ search, limit: 50 }),
    [search]
  );
  const users = data?.users || [];

  const handleToggle = async (id) => {
    try {
      await userApi.toggleStatus(id);
      toast.success('User status updated.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name',      label: 'Name',      render: (v, row) => (
      <div className="user-info-cell">
        <div className="user-name">{v}</div>
        <div className="user-email">{row.email}</div>
      </div>
    )},
    { key: 'phone',     label: 'Phone',     render: (v) => v || '—' },
    { key: 'role',      label: 'Role',      render: (v) => <StatusBadge status={v} /> },
    { key: 'isActive',  label: 'Status',    render: (v) => <StatusBadge status={v ? 'active' : 'rejected'} /> },
    { key: 'lastLogin', label: 'Last login', render: (v) => formatDate(v) },
    { key: 'createdAt', label: 'Joined',    render: (v) => formatDate(v) },
    { key: '_id',       label: 'Action',    render: (_, row) => row.role !== 'admin' && (
      <button
        className={`btn btn-sm ${row.isActive ? 'btn-danger' : 'btn-secondary'}`}
        onClick={() => handleToggle(row._id)}>
        {row.isActive ? 'Deactivate' : 'Activate'}
      </button>
    )},
  ];

  return (
    <div className="user-management-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage all registered citizens.</p>
        </div>
        <input 
          className="form-input search-input" 
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <DataTable 
        columns={columns} 
        rows={users} 
        loading={loading}
        emptyTitle="No users found" 
        emptyMessage="Try a different search." 
      />
    </div>
  );
}