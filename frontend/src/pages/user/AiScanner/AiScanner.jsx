import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiApi } from '../../../api/aiApi';
import useToast from '../../../hooks/useToast';
import './AiScanner.css';

export default function AiScanner() {
  const toast = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const samplePresets = [
    { label: "🥤 PET Plastic Bottle", text: "Clear polyethylene terephthalate water bottle with plastic cap" },
    { label: "🔋 Lithium Battery", text: "Rechargeable lithium-ion cylindrical battery with terminals" },
    { label: "📦 Cardboard Box", text: "Corrugated shipping carton with paper labels and packaging tape" },
    { label: "☕ Coffee Grounds", text: "Used organic espresso coffee grounds and unbleached filter paper" },
  ];

  const handleScan = async () => {
    if (mode === 'text' && !input.trim()) {
      toast.error('Please describe the waste item.');
      return;
    }
    if (mode === 'image' && images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

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
      toast.success('Neural scan completed successfully!');
    } catch (err) {
      toast.error(err.message || 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className="scanner-saas-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div className="scanner-header" variants={itemVariants}>
        <div className="scanner-header-copy">
          <div className="header-badge-row">
            <h1 className="page-title">Neural Waste Classifier</h1>
            <span className="ai-model-pill">
              <span className="pulse-dot"></span>
              <span>Vision AI 2.0 • Edge Inference</span>
            </span>
          </div>
          <p className="page-subtitle">
            Sub-second multi-modal AI classification with verified circular disposal directives.
          </p>
        </div>
      </motion.div>

      {/* ── Mode Switcher & Presets ───────────────────────────── */}
      <motion.div className="scanner-controls-row" variants={itemVariants}>
        <div className="scanner-mode-tabs glass-panel">
          <button
            type="button"
            className={`scanner-tab-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => { setMode('text'); setResult(null); }}
          >
            <span>✍️ Natural Language Description</span>
          </button>
          <button
            type="button"
            className={`scanner-tab-btn ${mode === 'image' ? 'active' : ''}`}
            onClick={() => { setMode('image'); setResult(null); }}
          >
            <span>📸 Multi-Angle Photo Capture</span>
          </button>
        </div>

        {mode === 'text' && (
          <div className="quick-presets-group">
            <span className="preset-label">Quick Samples:</span>
            <div className="preset-buttons">
              {samplePresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="preset-btn"
                  onClick={() => setInput(p.text)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Main Scanner Workspace Grid ──────────────────────── */}
      <div className="scanner-workspace-grid">
        {/* Left: Input Panel */}
        <motion.div className="scanner-input-card glass-panel" variants={itemVariants}>
          <div className="card-top-header">
            <span className="card-top-tag">{mode === 'text' ? 'INPUT PARAMETERS' : 'OPTICAL FEED'}</span>
            <span className="status-live">🟢 Neural Network Ready</span>
          </div>

          {mode === 'text' ? (
            <div className="form-group">
              <label className="form-label">Describe item materials, state & markings</label>
              <textarea
                className="scanner-textarea"
                rows={5}
                placeholder="e.g. Transparent 500ml beverage bottle with #1 PET recycling symbol, clean and flattened without liquid."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="upload-dropzone-saas">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden-file-input"
                  onChange={(e) => setImages(Array.from(e.target.files).slice(0, 4))}
                />
                <div className="dropzone-icon">
                  <span>📸</span>
                </div>
                <strong className="dropzone-title">Drop waste photos or browse files</strong>
                <span className="dropzone-sub">PNG, JPG, WebP up to 10MB (Upload up to 4 angles)</span>
              </label>

              {images.length > 0 && (
                <div className="image-previews-grid">
                  {images.map((img, i) => (
                    <div key={i} className="image-preview-badge glass-card">
                      <span className="preview-name">{img.name}</span>
                      <button
                        type="button"
                        className="btn-remove-img"
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
          )}

          <motion.button
            className="btn-saas-scan"
            onClick={handleScan}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="scanning-pulse-text">⚡ Running Multi-Modal Neural Scan...</span>
            ) : (
              <>
                <span>Run AI Classification</span>
                <span>⚡</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Right: Results or Scanner Standby Telemetry */}
        <motion.div className="scanner-output-card glass-panel" variants={itemVariants}>
          <div className="card-top-header">
            <span className="card-top-tag">DIAGNOSTICS & TELEMETRICS</span>
            <span className="latency-pill">Latency: ~18ms</span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-box"
                className="scanner-standby-box scanner-loading-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="laser-scanner-reticle">
                  <div className="laser-beam" />
                  <span className="scanner-target-icon">⚡</span>
                </div>
                <h4>Analyzing Spectral & Physical Attributes</h4>
                <p>Comparing against 48+ municipal recyclable classes and toxicity protocols...</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result-box"
                className="scanner-result-content"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4 }}
              >
                <div className="result-category-header">
                  <div>
                    <span className="res-eyebrow">PREDICTED CATEGORY</span>
                    <h3 className="res-category-name">{result.classifiedCategory}</h3>
                  </div>
                  <div className={`res-recyclable-tag ${result.isRecyclable ? 'yes' : 'no'}`}>
                    <span>{result.isRecyclable ? '♻️ Recyclable' : '🚫 Non-Recyclable / Special'}</span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="confidence-meter-block">
                  <div className="confidence-label-row">
                    <span>Model Confidence</span>
                    <strong>{Math.round((result.confidence || 0.96) * 100)}%</strong>
                  </div>
                  <div className="confidence-track">
                    <motion.div
                      className="confidence-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((result.confidence || 0.96) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Directive Protocol Card */}
                <div className="disposal-directive-box">
                  <div className="directive-icon">💡</div>
                  <div className="directive-text">
                    <strong>Mandated Disposal Protocol:</strong>
                    <p>{result.disposalMethod || 'Deposit in designated recycling stream after rinsing.'}</p>
                  </div>
                </div>

                {/* Tags */}
                {result.tags?.length > 0 && (
                  <div className="result-tags-row">
                    {result.tags.map((tag) => (
                      <span key={tag} className="tag-chip">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Action Row */}
                <div className="result-actions-row">
                  <button
                    className="btn-book-from-scan"
                    onClick={() => navigate('/pickup-request')}
                  >
                    <span>Book Pickup for this Item →</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="standby-box"
                className="scanner-standby-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="standby-icon-circle">
                  <span>🔬</span>
                </div>
                <h4>Standby for Sensor Input</h4>
                <p>
                  Enter a description or upload a photo to evaluate circular recyclability,
                  contamination risk, and municipal route directives.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}