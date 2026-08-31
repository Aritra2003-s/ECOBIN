import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportApi } from '../../../api/reportApi';
import useToast from '../../../hooks/useToast';
import './ReportWaste.css';

const REPORT_CATEGORIES = [
  { id: 'illegal_dumping', label: 'Illegal Dumping / Debris', icon: '🚯', color: '#EF4444' },
  { id: 'overflowing_bin', label: 'Overflowing Public Bin', icon: '🗑️', color: '#F59E0B' },
  { id: 'hazardous_spill', label: 'Hazardous / Chemical Spill', icon: '☣️', color: '#DC2626' },
  { id: 'missed_collection', label: 'Missed Scheduled Route', icon: '🚛', color: '#0EA5E9' },
  { id: 'other', label: 'Other Civic Maintenance', icon: '⚠️', color: '#8B5CF6' },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Low', desc: 'Non-blocking cleanup', color: '#10B981' },
  { id: 'medium', label: 'Medium', desc: 'Standard turnaround (<24h)', color: '#F59E0B' },
  { id: 'high', label: 'High Priority', desc: 'Pedestrian obstruction (<6h)', color: '#EA580C' },
  { id: 'critical', label: 'Critical Hazard', desc: 'Immediate dispatch (<2h)', color: '#DC2626' },
];

export default function ReportWaste() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'illegal_dumping',
    priority: 'medium',
    location: { address: '', city: '', state: '', zip: '' },
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setLoc = (field) => (e) =>
    setForm((p) => ({
      ...p,
      location: { ...p.location, [field]: e.target.value },
    }));

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info('Fetching GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setForm((p) => ({
            ...p,
            location: {
              ...p.location,
              address: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (Near Main Road)`,
              city: 'Municipal Sector 4',
            },
          }));
          toast.success('GPS coordinates locked!');
        },
        () => {
          setForm((p) => ({
            ...p,
            location: {
              ...p.location,
              address: 'GPS: 37.77492, -122.41941 (Sector 4B)',
              city: 'Metro Ward',
            },
          }));
          toast.info('Simulated GPS coordinates locked');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.priority ||
      !form.location.address.trim() ||
      !form.location.city.trim()
    ) {
      toast.error('Please fill in all required report details.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('priority', form.priority);

      const locationPayload = {
        address: form.location.address.trim(),
        city: form.location.city.trim(),
        state: form.location.state.trim() || '',
        zip: form.location.zip.trim() || '',
      };
      fd.append('location', JSON.stringify(locationPayload));

      images.forEach((img) => {
        fd.append('images', img);
      });

      await reportApi.create(fd);
      toast.success('Civic issue report filed! Municipal dispatch team notified.');
      navigate('/history');
    } catch (err) {
      const backendError = err.response?.data?.message || err.message || 'Submission failed';
      toast.error(backendError);
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
      className="report-waste-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="report-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">File Civic Waste & Incident Report</h1>
            <span className="civic-watch-pill">
              <span className="pulse-dot"></span>
              <span>Civic Watch Queue Active</span>
            </span>
          </div>
          <p className="page-subtitle">
            Upload photo evidence and geotagged incident descriptions to notify municipal cleanup crews.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="report-form-layout">
        <div className="report-main-col">
          {/* Section 1: Category & Priority */}
          <motion.div className="report-card glass-panel" variants={itemVariants}>
            <div className="report-card-header">
              <span className="step-tag">STEP 01</span>
              <h3>Incident Classification & Urgency</h3>
            </div>

            <div className="category-select-grid">
              {REPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`report-cat-btn ${form.category === cat.id ? 'active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <strong>{cat.label}</strong>
                </button>
              ))}
            </div>

            {/* Priority Selector */}
            <div className="priority-select-section">
              <label className="form-label">Impact Urgency Priority</label>
              <div className="priority-pills-grid">
                {PRIORITY_OPTIONS.map((pri) => (
                  <button
                    key={pri.id}
                    type="button"
                    className={`priority-pill-card ${form.priority === pri.id ? 'active' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, priority: pri.id }))}
                  >
                    <span className="pri-dot" style={{ background: pri.color }} />
                    <div className="pri-text">
                      <strong>{pri.label}</strong>
                      <small>{pri.desc}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 2: Details & Evidence Photo Dropzone */}
          <motion.div className="report-card glass-panel" variants={itemVariants}>
            <div className="report-card-header">
              <span className="step-tag">STEP 02</span>
              <h3>Incident Details & Photo Evidence</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Report Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Overflowing garbage bins blocking pedestrian walkway"
                value={form.title}
                onChange={set('title')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description of Obstruction *</label>
              <textarea
                className="form-input report-textarea"
                rows={4}
                placeholder="Describe material volume, hazard level, proximity to street or water drainage..."
                value={form.description}
                onChange={set('description')}
                required
              />
            </div>

            {/* Photo Upload Dropzone */}
            <div className="form-group">
              <label className="form-label">Upload Photo Evidence (Max 4)</label>
              <label className="upload-dropzone-report">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden-file-input"
                  onChange={(e) => setImages(Array.from(e.target.files).slice(0, 4))}
                />
                <div className="dropzone-icon">📸</div>
                <strong className="dropzone-title">Click to upload photo evidence</strong>
                <span className="dropzone-sub">PNG, JPG, WebP up to 10MB</span>
              </label>

              {images.length > 0 && (
                <div className="report-image-chips">
                  {images.map((img, i) => (
                    <div key={i} className="image-chip glass-card">
                      <span>{img.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeImage(i);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 3: Geotagged Location */}
          <motion.div className="report-card glass-panel" variants={itemVariants}>
            <div className="report-card-header">
              <span className="step-tag">STEP 03</span>
              <h3>Location & GPS Pin</h3>
              <button
                type="button"
                className="btn-use-gps"
                onClick={handleUseCurrentLocation}
              >
                <span>📍 Auto-Fill GPS</span>
              </button>
            </div>

            <div className="form-row-grid">
              <div className="form-group span-2">
                <label className="form-label">Exact Location / Cross Streets *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Corner of 5th Ave and Maple St"
                  value={form.location.address}
                  onChange={setLoc('address')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Sector *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Sector or Ward"
                  value={form.location.city}
                  onChange={setLoc('city')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 90210"
                  value={form.location.zip}
                  onChange={setLoc('zip')}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-submit-report"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span>Filing Incident with Municipal Dispatch...</span>
              ) : (
                <>
                  <span>Submit Verified Civic Report</span>
                  <span>🛡️</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}