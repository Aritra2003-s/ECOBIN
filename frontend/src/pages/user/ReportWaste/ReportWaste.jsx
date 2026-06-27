import { useState } from 'react';
import { reportApi } from '../../../api/reportApi';
import useToast from '../../../hooks/useToast';
import { WASTE_CATEGORIES, PRIORITY_LEVELS } from '../../../utils/constants';
import './ReportWaste.css';

export default function ReportWaste() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: { address: '', city: '', state: '', zip: '' },
  });

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));
  const setLoc = (field) => (e) =>
    setForm((p) => ({
      ...p,
      location: { ...p.location, [field]: e.target.value },
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field Validation Checks
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.priority ||
      !form.location.address.trim() ||
      !form.location.city.trim()
    ) {
      toast.error('All required fields marked with * must be filled.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      // Append simple flat elements
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('priority', form.priority);

      // FIXED: Serialize the nested location object as a unified JSON string 
      // This prevents multipart bracket-key flattening from failing backend validation rules
      const locationPayload = {
        address: form.location.address.trim(),
        city: form.location.city.trim(),
        state: form.location.state.trim() || "",
        zip: form.location.zip.trim() || ""
      };
      fd.append('location', JSON.stringify(locationPayload));

      // Append file items
      images.forEach((img) => {
        fd.append('images', img);
      });

      await reportApi.create(fd); // Axios handles multipart boundary transmission seamlessly
      toast.success('Waste report submitted successfully!');

      // Form Field Clean Reset State
      setForm({
        title: '',
        description: '',
        category: '',
        priority: '',
        location: { address: '', city: '', state: '', zip: '' },
      });
      setImages([]);
    }  catch (err) {
  // Directly targets the formatted error message traveling through your updated axios setup
  const backendError = err.response?.data?.message || err.message || 'Validation failed';
  toast.error(backendError);
  console.error("Full Backend Error Context:", err.response?.data);
}
  };

  return (
    <div className="pickup-request-container">
      <div className="page-header">
        <h1 className="page-title">Report Waste Issue</h1>
        <p className="page-subtitle">Help keep your community clean by reporting waste management issues in your area.</p>
      </div>

      <form onSubmit={handleSubmit} className="pickup-form">
        
        {/* SECTION 1: REPORT DETAILS CARD */}
        <div className="card form-card-section">
          <div className="section-header">
            <svg className="section-icon text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="section-title">Report Details</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input 
              className="form-input" 
              placeholder="e.g., Overflowing garbage bins on Main Street"
              value={form.title} 
              onChange={set('title')} 
            />
          </div>

          <div className="form-group mt-12">
            <label className="form-label">Description *</label>
            <textarea 
              className="form-input vertical-resize textarea-input" 
              rows={4}
              placeholder="e.g., The garbage bins near the park have been overflowing for several days..."
              value={form.description} 
              onChange={set('description')}
            />
          </div>

          <div className="form-group mt-12">
            <label className="form-label">Category *</label>
            <div className="select-wrapper">
              <select className="form-input" value={form.category} onChange={set('category')}>
                <option value="" disabled hidden>Select a category</option>
                {WASTE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group mt-12">
            <label className="form-label">Priority *</label>
            <div className="select-wrapper">
              <select className="form-input" value={form.priority} onChange={set('priority')}>
                <option value="" disabled hidden>Select priority level</option>
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: LOCATION CARD */}
        <div className="card form-card-section">
          <div className="section-header">
            <svg className="section-icon text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="section-title">Location</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Street/Landmark *</label>
            <input 
              className="form-input" 
              placeholder="e.g., 123 Main Street or Central Park"
              value={form.location.address} 
              onChange={setLoc('address')} 
            />
          </div>

          <div className="form-group mt-12">
            <label className="form-label">City *</label>
            <input 
              className="form-input" 
              placeholder="e.g., Kolkata"
              value={form.location.city} 
              onChange={setLoc('city')} 
            />
          </div>

          <div className="address-row mt-12">
            <div className="form-group">
              <label className="form-label label-gray">State</label>
              <input 
                className="form-input" 
                placeholder="e.g., WB"
                value={form.location.state} 
                onChange={setLoc('state')} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Zip code</label>
              <input 
                className="form-input" 
                placeholder="e.g., 700001"
                value={form.location.zip} 
                onChange={setLoc('zip')} 
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PHOTO UPLOAD CARD */}
        <div className="card form-card-section">
          <div className="section-header">
            <svg className="section-icon text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <h3 className="section-title">Upload Photo (Up to 3)</h3>
          </div>

          <div className="form-group">
            <label className="upload-dropzone">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden-file-input"
                onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))} 
              />
              <div className="dropzone-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                </svg>
              </div>
              <span className="dropzone-text">Click to upload photo</span>
              <span className="dropzone-subtext">PNG, JPG up to 10MB</span>
            </label>
            
            {images.length > 0 && (
              <div className="image-badges-container">
                {images.map((img, i) => (
                  <div key={i} className="image-badge">{img.name}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="btn-submit-full" type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Waste Report'}
        </button>

        <p className="footer-notice">Your waste management report will be reviewed and addressed within 24-48 hours</p>
      </form>
    </div>
  );
}