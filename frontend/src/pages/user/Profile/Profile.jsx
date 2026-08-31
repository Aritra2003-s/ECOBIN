import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { userApi } from '../../../api/userApi';
import useToast from '../../../hooks/useToast';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
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
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('address', JSON.stringify(form.address));
      const res = await userApi.updateProfile(fd);
      updateUser(res.data.data.user);
      toast.success('Profile credentials updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

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
      className="profile-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="profile-header" variants={itemVariants}>
        <h1 className="page-title">Citizen Account & Profile</h1>
        <p className="page-subtitle">Manage your personal details, default curbside pickup address, and role permissions.</p>
      </motion.div>

      {/* ── User Overview Hero ────────────────────────────────── */}
      <motion.div className="profile-hero-card glass-panel" variants={itemVariants}>
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
        <div className="profile-hero-meta">
          <div className="name-role-row">
            <h2>{user?.name || 'Registered User'}</h2>
            <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
              {user?.role === 'admin' ? '⚡ Municipal Administrator' : '🌿 Verified Resident Citizen'}
            </span>
          </div>
          <span className="profile-email-tag">📧 {user?.email}</span>
          <span className="profile-uid-tag">ID: {user?._id || 'ECOBIN_USER_NODE'}</span>
        </div>
      </motion.div>

      {/* ── Form Card ─────────────────────────────────────────── */}
      <motion.form onSubmit={handleSave} className="profile-form-card glass-panel" variants={itemVariants}>
        <div className="form-section-header">
          <span className="section-step-tag">SECTION 01</span>
          <h3>Personal Contact Credentials</h3>
        </div>

        <div className="profile-form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={set('name')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>
        </div>

        <div className="form-section-header" style={{ marginTop: '28px' }}>
          <span className="section-step-tag">SECTION 02</span>
          <h3>Default Service Address (Auto-filled on bookings)</h3>
        </div>

        <div className="profile-form-grid">
          <div className="form-group span-2">
            <label className="form-label">Street Address & House / Gate Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 742 Evergreen Terrace"
              value={form.address.street}
              onChange={setAddr('street')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City / Sector</label>
            <input
              type="text"
              className="form-input"
              placeholder="City"
              value={form.address.city}
              onChange={setAddr('city')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">State / Province</label>
            <input
              type="text"
              className="form-input"
              placeholder="State"
              value={form.address.state}
              onChange={setAddr('state')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Postal / ZIP Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="90210"
              value={form.address.zip}
              onChange={setAddr('zip')}
            />
          </div>
        </div>

        <div className="profile-actions-bar">
          <motion.button
            type="submit"
            className="btn-save-profile"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Updating Credentials...' : 'Save Profile Changes'}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}