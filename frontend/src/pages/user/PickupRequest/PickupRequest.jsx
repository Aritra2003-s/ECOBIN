import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pickupApi } from '../../../api/pickupApi';
import useToast from '../../../hooks/useToast';
import './PickupRequest.css';

const CATEGORY_OPTIONS = [
  { id: 'general', label: 'General Dry Waste', icon: '🗑️', desc: 'Mixed packaging & non-recyclables' },
  { id: 'plastic', label: 'Rigid & Soft Plastics', icon: '🥤', desc: 'PET bottles, containers, HDPE' },
  { id: 'organic', label: 'Organic Compost', icon: '🍃', desc: 'Food scrap, yard cuttings, coffee' },
  { id: 'paper', label: 'Paper & Cardboard', icon: '📦', desc: 'Corrugated cartons, newspapers' },
  { id: 'e_waste', label: 'Electronic E-Waste', icon: '💻', desc: 'Batteries, cables, broken devices' },
  { id: 'hazardous', label: 'Hazardous Materials', icon: '⚠️', desc: 'Chemicals, paints, fluorescent bulbs' },
  { id: 'metal', label: 'Scrap & Metal Cans', icon: '🔩', desc: 'Aluminum tins, iron scraps, wires' },
];

const TIME_SLOT_OPTIONS = [
  { id: 'morning', label: 'Morning Window', time: '08:00 AM – 12:00 PM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon Window', time: '12:00 PM – 04:00 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening Window', time: '04:00 PM – 08:00 PM', icon: '🌆' },
];

export default function PickupRequest() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    wasteType: 'plastic',
    quantity: { value: '5', unit: 'kg' },
    description: '',
    pickupAddress: { street: '', city: '', state: '', zip: '' },
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTimeSlot: 'morning',
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setAddr = (field) => (e) =>
    setForm((p) => ({ ...p, pickupAddress: { ...p.pickupAddress, [field]: e.target.value } }));
  const setWasteType = (type) => setForm((p) => ({ ...p, wasteType: type }));
  const setSlot = (slot) => setForm((p) => ({ ...p, preferredTimeSlot: slot }));

  const setQty = (field, val) => {
    setForm((p) => ({
      ...p,
      quantity: { ...p.quantity, [field]: val },
    }));
  };

  // Estimated CO2 Avoidance
  const numericQty = parseFloat(form.quantity.value) || 0;
  const estimatedCO2 = (numericQty * 1.35).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.pickupAddress.street.trim() || !form.pickupAddress.city.trim()) {
      toast.error('Street and City address are required.');
      return;
    }
    if (!form.quantity.value || numericQty <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    if (!form.preferredDate) {
      toast.error('Preferred pickup date is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        wasteType: form.wasteType,
        quantity: {
          value: numericQty,
          unit: form.quantity.unit.toLowerCase(),
        },
        description: form.description.trim() || '',
        pickupAddress: {
          street: form.pickupAddress.street.trim(),
          city: form.pickupAddress.city.trim(),
          state: form.pickupAddress.state.trim() || '',
          zip: form.pickupAddress.zip.trim() || '',
        },
        preferredDate: new Date(form.preferredDate).toISOString(),
        preferredTimeSlot: form.preferredTimeSlot,
      };

      await pickupApi.create(payload);
      toast.success('Pickup request confirmed! Live GPS tracking will activate upon driver dispatch.');
      navigate('/pickup-tracking');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
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
      className="pickup-request-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ───────────────────────────────────────── */}
      <motion.div className="pickup-req-header" variants={itemVariants}>
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Book On-Demand Curbside Pickup</h1>
            <span className="dispatch-badge">
              <span className="pulse-dot"></span>
              <span>Municipal Fleet Active</span>
            </span>
          </div>
          <p className="page-subtitle">
            Schedule convenient home or commercial collections with verified material circularity.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="pickup-booking-layout">
        {/* ── Left Column: Configuration Forms ─────────────────── */}
        <div className="booking-main-col">
          {/* Step 1: Category Picker */}
          <motion.div className="booking-card glass-panel" variants={itemVariants}>
            <div className="booking-card-header">
              <span className="step-tag">STEP 01</span>
              <h3>Select Waste Classification</h3>
            </div>

            <div className="category-options-grid">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-select-card ${form.wasteType === cat.id ? 'active' : ''}`}
                  onClick={() => setWasteType(cat.id)}
                >
                  <div className="cat-icon-row">
                    <span className="cat-emoji">{cat.icon}</span>
                    {form.wasteType === cat.id && <span className="cat-check">✓</span>}
                  </div>
                  <strong>{cat.label}</strong>
                  <p>{cat.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Step 2: Quantity & Schedule */}
          <motion.div className="booking-card glass-panel" variants={itemVariants}>
            <div className="booking-card-header">
              <span className="step-tag">STEP 02</span>
              <h3>Estimated Quantity & Date Slot</h3>
            </div>

            <div className="booking-form-grid">
              <div className="form-group">
                <label className="form-label">Approximate Amount</label>
                <div className="quantity-input-group">
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="5"
                    value={form.quantity.value}
                    onChange={(e) => setQty('value', e.target.value)}
                  />
                  <select
                    className="form-select qty-select"
                    value={form.quantity.unit}
                    onChange={(e) => setQty('unit', e.target.value)}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="bags">Bags / Sacks</option>
                    <option value="items">Units / Items</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Collection Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.preferredDate}
                  onChange={set('preferredDate')}
                />
              </div>
            </div>

            {/* Time Slot Selector */}
            <div className="time-slot-section">
              <label className="form-label">Select Driver Window</label>
              <div className="time-slots-grid">
                {TIME_SLOT_OPTIONS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`time-slot-btn ${form.preferredTimeSlot === slot.id ? 'active' : ''}`}
                    onClick={() => setSlot(slot.id)}
                  >
                    <div className="slot-top">
                      <span>{slot.icon}</span>
                      <strong>{slot.label}</strong>
                    </div>
                    <span className="slot-hours">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Step 3: Pickup Location */}
          <motion.div className="booking-card glass-panel" variants={itemVariants}>
            <div className="booking-card-header">
              <span className="step-tag">STEP 03</span>
              <h3>Curbside Pickup Location</h3>
            </div>

            <div className="booking-form-grid">
              <div className="form-group span-2">
                <label className="form-label">Street Address & Landmark *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 742 Evergreen Terrace, Gate 2"
                  value={form.pickupAddress.street}
                  onChange={setAddr('street')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="City name"
                  value={form.pickupAddress.city}
                  onChange={setAddr('city')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 90210"
                  value={form.pickupAddress.zip}
                  onChange={setAddr('zip')}
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Special Driver Instructions (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Left beside front driveway, ring bell upon arrival"
                  value={form.description}
                  onChange={set('description')}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right Column: Booking Summary & Impact Estimator ──── */}
        <div className="booking-summary-sidebar">
          <motion.div className="booking-summary-card glass-panel" variants={itemVariants}>
            <div className="summary-card-header">
              <span className="summary-tag">BOOKING TELEMETRICS</span>
              <h4>Request Summary</h4>
            </div>

            <div className="summary-details-list">
              <div className="summary-row">
                <span>Material:</span>
                <strong>{CATEGORY_OPTIONS.find((c) => c.id === form.wasteType)?.label}</strong>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <strong>{form.quantity.value || 0} {form.quantity.unit}</strong>
              </div>
              <div className="summary-row">
                <span>Scheduled Date:</span>
                <strong>{form.preferredDate ? new Date(form.preferredDate).toLocaleDateString() : '—'}</strong>
              </div>
              <div className="summary-row">
                <span>Time Slot:</span>
                <strong>{TIME_SLOT_OPTIONS.find((s) => s.id === form.preferredTimeSlot)?.label}</strong>
              </div>
            </div>

            {/* Impact Estimator Box */}
            <div className="summary-impact-box">
              <div className="impact-top">
                <span>🌱</span>
                <strong>Estimated Environmental ROI</strong>
              </div>
              <div className="impact-stats-row">
                <div>
                  <span className="impact-num">{estimatedCO2} kg</span>
                  <span className="impact-label">CO2 Avoided</span>
                </div>
                <div>
                  <span className="impact-num">100%</span>
                  <span className="impact-label">Recycle Verified</span>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-saas-confirm-booking"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span>Locking Dispatch Route...</span>
              ) : (
                <>
                  <span>Confirm Pickup Request</span>
                  <span>→</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}