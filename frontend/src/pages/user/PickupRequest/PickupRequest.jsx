import { useState } from 'react';
import { pickupApi } from '../../../api/pickupApi';
import useToast from '../../../hooks/useToast';
import { WASTE_CATEGORIES, TIME_SLOTS, QUANTITY_UNITS } from '../../../utils/constants';
import './PickupRequest.css';

export default function PickupRequest() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    wasteType: 'general',
    quantity: { value: '', unit: 'kg' }, 
    description: '',
    pickupAddress: { street: '', city: '', state: '', zip: '' },
    preferredDate: '',
    preferredTimeSlot: 'morning',
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setAddr = (field) => (e) =>
    setForm((p) => ({ ...p, pickupAddress: { ...p.pickupAddress, [field]: e.target.value } }));
    
  const setQty = (field) => (e) => {
    const rawValue = e.target.value;
    setForm((p) => ({
      ...p,
      quantity: { 
        ...p.quantity, 
        [field]: field === 'value' ? (rawValue === '' ? '' : Number(rawValue)) : rawValue 
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!form.pickupAddress.street.trim() || !form.pickupAddress.city.trim()) {
      toast.error('Street and City are required.');
      return;
    }
    if (form.quantity.value === '' || form.quantity.value < 0) {
      toast.error('Please enter a valid quantity amount.');
      return;
    }
    if (!form.preferredDate) {
      toast.error('Preferred pickup date is required.');
      return;
    }

    setLoading(true);
    try {
      // Explicit payload mapping to eliminate any undefined parameters
      const payload = {
        wasteType: form.wasteType,
        quantity: {
          value: Number(form.quantity.value),
          unit: form.quantity.unit.toLowerCase(), // Normalizes enum compliance
        },
        description: form.description.trim() || "",
        pickupAddress: {
          street: form.pickupAddress.street.trim(),
          city: form.pickupAddress.city.trim(),
          state: form.pickupAddress.state.trim() || "",
          zip: form.pickupAddress.zip.trim() || "",
        },
        preferredDate: new Date(form.preferredDate).toISOString(), // Standardizes ISO date format
        preferredTimeSlot: form.preferredTimeSlot,
      };

      await pickupApi.create(payload);
      toast.success('Pickup request submitted! We will review it shortly.');
      
      // Reset form fields
      setForm({
        wasteType: 'general', 
        quantity: { value: '', unit: 'kg' }, 
        description: '',
        pickupAddress: { street: '', city: '', state: '', zip: '' },
        preferredDate: '', 
        preferredTimeSlot: 'morning',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pickup-request-container">
      <div className="page-header">
        <h1 className="page-title">Request Pickup</h1>
        <p className="page-subtitle">Schedule a waste collection at your location.</p>
      </div>

      <form onSubmit={handleSubmit} className="pickup-form">
        
        {/* SECTION 1: WASTE DETAILS CARD */}
        <div className="card form-card-section">
          <div className="section-header">
            <svg className="section-icon text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 className="section-title">Waste Details</h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">Waste type *</label>
            <div className="select-wrapper">
              <select className="form-input" value={form.wasteType} onChange={set('wasteType')}>
                {WASTE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <div className="quantity-group">
              <input 
                className="quantity-input" 
                type="number" 
                step="0.01"
                min="0" 
                placeholder="0.00"
                value={form.quantity.value} 
                onChange={setQty('value')} 
              />
              <div className="select-wrapper quantity-select-wrapper">
                <select 
                  className="quantity-select" 
                  value={form.quantity.unit} 
                  onChange={setQty('unit')}
                >
                  {QUANTITY_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group mt-12">
            <label className="form-label label-optional">Description (optional)</label>
            <textarea 
              className="form-input vertical-resize textarea-input" 
              rows={3}
              placeholder="Any special instructions for the pickup team..."
              value={form.description} 
              onChange={set('description')}
            />
          </div>
        </div>

        {/* SECTION 2: PICKUP ADDRESS CARD */}
        <div className="card form-card-section">
          <div className="section-header">
            <svg className="section-icon text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="section-title">Pickup address</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Street address *</label>
            <input 
              className="form-input" 
              placeholder="123 Eco Street"
              value={form.pickupAddress.street} 
              onChange={setAddr('street')} 
            />
          </div>

          <div className="form-group mt-12">
            <label className="form-label">City *</label>
            <input 
              className="form-input" 
              placeholder="Greenfield"
              value={form.pickupAddress.city} 
              onChange={setAddr('city')} 
            />
          </div>

          <div className="address-row mt-12">
            <div className="form-group">
              <label className="form-label label-gray">State</label>
              <input 
                className="form-input" 
                placeholder="WA"
                value={form.pickupAddress.state} 
                onChange={setAddr('state')} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Zip code</label>
              <input 
                className="form-input" 
                placeholder="98101"
                value={form.pickupAddress.zip} 
                onChange={setAddr('zip')} 
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SCHEDULE CARD */}
        <div className="card form-card-section">
          <div className="section-header">
            <svg className="section-icon text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="section-title">Schedule</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred date *</label>
            <input 
              className="form-input date-input" 
              type="date"
              value={form.preferredDate} 
              onChange={set('preferredDate')} 
            />
          </div>
          <div className="form-group">
            <label className="form-label label-gray">Preferred time slot</label>
            <div className="select-wrapper">
              <select 
                className="form-input" 
                value={form.preferredTimeSlot} 
                onChange={set('preferredTimeSlot')}
              >
                {TIME_SLOTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button className="btn-submit-full" type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Request pickup'}
        </button>
      </form>
    </div>
  );
}