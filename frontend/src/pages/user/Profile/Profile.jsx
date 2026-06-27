import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userApi } from '../../../api/userApi';
import useToast from '../../../hooks/useToast';
import './Profile.css'; // Import the CSS file

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city:   user?.address?.city   || '',
      state:  user?.address?.state  || '',
      zip:    user?.address?.zip    || '',
    },
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setAddr = (field) => (e) =>
    setForm((p) => ({ ...p, address: { ...p.address, [field]: e.target.value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',    form.name);
      fd.append('phone',   form.phone);
      fd.append('address', JSON.stringify(form.address));
      const res = await userApi.updateProfile(fd);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information.</p>
        </div>
      </div>

      {/* ── Avatar Section ── */}
      <div className="card profile-avatar-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <span className="badge badge-success profile-badge">{user?.role}</span>
        </div>
      </div>

      {/* ── Profile Form ── */}
      <form onSubmit={handleSave}>
        <div className="card profile-form-card">
          <h3 className="section-title">Personal details</h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input className="form-input" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <hr className="divider" />
          <h3 className="section-title">Address</h3>

          <div className="form-group">
            <label className="form-label">Street</label>
            <input className="form-input" value={form.address.street} onChange={setAddr('street')} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.address.city} onChange={setAddr('city')} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={form.address.state} onChange={setAddr('state')} />
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}