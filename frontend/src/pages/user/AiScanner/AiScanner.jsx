import { useState } from 'react';
import { aiApi } from '../../../api/aiApi';
import useToast from '../../../hooks/useToast';
import './AiScanner.css'; // Import the CSS file

export default function AiScanner() {
  const toast = useToast();
  const [mode, setMode]         = useState('text'); // 'text' | 'image'
  const [input, setInput]       = useState('');
  const [images, setImages]     = useState([]);     // Updated to array for multiple images
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const handleScan = async () => {
    if (mode === 'text' && !input.trim()) { toast.error('Please describe the waste.'); return; }
    if (mode === 'image' && images.length === 0) { toast.error('Please upload an image.'); return; }
    
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (mode === 'text') {
        res = await aiApi.classifyText(input);
      } else {
        const fd = new FormData();
        images.forEach((img) => fd.append('images', img));
        res = await aiApi.classifyImage(fd);
      }
      setResult(res.data.data.classification);
      toast.success('Scan complete!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // New function to remove a single image by its index
  const removeImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="scanner-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Waste Scanner</h1>
          <p className="page-subtitle">Identify waste type and get disposal guidance instantly.</p>
        </div>
      </div>

      <div className={`scanner-beacon ${loading ? 'scanner-beacon--active' : ''}`}>
        <div className="scanner-beacon__copy">
          <p className="scanner-beacon__status">AI Scanner status</p>
          <h2>{loading ? 'Analyzing your sample…' : 'Ready for your next scan'}</h2>
          <p>{loading ? 'The model is processing the upload to keep guidance crisp and fast.' : 'Upload a photo or describe an item to get a classification with disposal instructions.'}</p>
        </div>
        <div className="scanner-beacon__pulse" aria-hidden="true" />
      </div>

      {/* ── Mode toggle ── */}
      <div className="mode-toggle">
        {['text', 'image'].map((m) => (
          <button 
            key={m} 
            onClick={() => { setMode(m); setResult(null); }}
            className={`mode-btn ${mode === m ? 'active' : ''}`}
          >
            {m === 'text' ? '✍ Describe' : '⊕ Upload image'}
          </button>
        ))}
      </div>

      {/* ── Input Form ── */}
      <div className="card scanner-form-card">
        {mode === 'text' ? (
          <div className="form-group">
            <label className="form-label">Describe the waste</label>
            <textarea 
              className="form-input scanner-textarea" 
              rows={4}
              placeholder="e.g. Broken laptop with cracked screen and swollen battery"
              value={input} 
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        ) : (
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
                  <div key={i} className="image-badge">
                    <span className="badge-filename">{img.name}</span>
                    <button 
                      type="button" 
                      className="remove-badge-btn"
                      onClick={(e) => {
                        e.preventDefault(); // Stop click from bubbling up
                        removeImage(i);
                      }}
                      aria-label={`Remove ${img.name}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button 
          className="btn btn-primary btn-lg scan-submit-btn" 
          onClick={handleScan} 
          disabled={loading}
        >
          {loading ? 'Scanning…' : '✦ Scan with AI'}
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="card result-card">
          <h2 className="result-title">Scan result</h2>

          <div className="grid-2 result-chips-grid">
            <Chip label="Category" value={result.classifiedCategory} />
            <Chip 
              label="Recyclable"
              value={result.isRecyclable ? 'Yes' : 'No'}
              color={result.isRecyclable ? '#15803d' : '#b91c1c'}
              bg={result.isRecyclable ? '#dcfce7' : '#fee2e2'}
            />
            <Chip label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
            <Chip label="Powered by" value={result.model === 'mock' ? 'AI Mock' : 'GPT-4o'} />
          </div>

          <div className="disposal-guidance-box">
            <p className="guidance-title">Disposal guidance</p>
            <p className="guidance-text">{result.disposalMethod}</p>
          </div>

          {result.tags?.length > 0 && (
            <div className="tag-container">
              {result.tags.map((tag) => (
                <span key={tag} className="result-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, value, bg = 'rgba(255, 255, 255, 0.08)', color = 'var(--text-primary)' }) {
  return (
    <div className="chip-container">
      <div className="chip-label">{label}</div>
      <div className="chip-value" style={{ background: bg, color: color }}>
        {value}
      </div>
    </div>
  );
}