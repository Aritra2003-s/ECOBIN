import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import ecobinLogo from "../../../assets/logo.png";
import "./ModernLanding.css";

// ── Smooth Animated Number Counter ───────────────────────────
function AnimatedCounter({ value, suffix = "", prefix = "", duration = 1.8 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseFloat(value.toString().replace(/,/g, ""));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const startTime = performance.now();
    const isDecimal = value.toString().includes(".");
    const decimals = isDecimal ? value.toString().split(".")[1].length : 0;

    const animateCount = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (end - start) * easeProgress;

      setCount(
        isDecimal
          ? currentVal.toFixed(decimals)
          : Math.floor(currentVal).toLocaleString()
      );

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animateCount);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="counter-val">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  // ── Interactive Live AI Scanner Simulator Items ─────────────
  const demoItems = [
    {
      id: "plastic",
      name: "PET Water Bottle",
      icon: "🥤",
      category: "Recyclable Plastic",
      confidence: 99.4,
      co2: "0.85 kg saved",
      color: "#10B981",
      protocol: "Empty liquid, compress, and place in Blue Recycling Bin.",
      breakdown: { Recyclability: 98, ContaminationRisk: 4, Degradability: 12 },
    },
    {
      id: "organic",
      name: "Coffee Grounds & Filter",
      icon: "☕",
      category: "Organic Compost",
      confidence: 98.7,
      co2: "1.20 kg saved",
      color: "#F59E0B",
      protocol: "100% biodegradable. Place in Green Bin for municipal composting.",
      breakdown: { Recyclability: 100, ContaminationRisk: 1, Degradability: 95 },
    },
    {
      id: "electronic",
      name: "Lithium-Ion Battery",
      icon: "🔋",
      category: "Hazardous E-Waste",
      confidence: 99.8,
      co2: "3.40 kg saved",
      color: "#EF4444",
      protocol: "Do NOT bin. Requires certified specialized e-waste drop-off.",
      breakdown: { Recyclability: 82, ContaminationRisk: 96, Degradability: 0 },
    },
    {
      id: "paper",
      name: "Corrugated Cardboard",
      icon: "📦",
      category: "Fiber & Paper",
      confidence: 99.1,
      co2: "1.45 kg saved",
      color: "#0D9488",
      protocol: "Flatten box, remove plastic tape, deposit in Dry Paper stream.",
      breakdown: { Recyclability: 96, ContaminationRisk: 6, Degradability: 88 },
    },
  ];

  const [activeDemo, setActiveDemo] = useState(demoItems[0]);

  // ── Core Feature Matrix ─────────────────────────────────────
  const features = [
    {
      id: "ai-scanner",
      icon: "⚡",
      badge: "Vision AI 2.0",
      title: "Neural Waste Classifier",
      desc: "Sub-second multi-modal AI categorizes waste from images or text with 99%+ accuracy, providing actionable disposal guidance.",
      metric: "99.4% Model Precision",
      audience: ["Citizens", "Recycling Hubs", "Schools"],
      stats: [
        { label: "Inference Latency", value: "< 24ms" },
        { label: "Material Classes", value: "48+ types" },
      ],
      highlights: [
        {
          title: "Instant Multi-Modal Detection",
          detail: "Real-time edge recognition for plastics, organics, metals, e-waste, and hazardous materials.",
        },
        {
          title: "Automated Disposal Routing",
          detail: "Tailored bin recommendations and carbon savings estimation on every scan.",
        },
      ],
    },
    {
      id: "pickup",
      icon: "🚛",
      badge: "On-Demand Dispatch",
      title: "Smart Pickup Orchestration",
      desc: "Effortlessly schedule curbside or bulk collections with transparent slot reservations and live driver telemetry.",
      metric: "14 min Avg Dispatch",
      audience: ["Residential", "Commercial Hubs", "Enterprises"],
      stats: [
        { label: "On-Time Rate", value: "99.1%" },
        { label: "Route Efficiency", value: "+34%" },
      ],
      highlights: [
        {
          title: "Automated Slot Allocation",
          detail: "Dynamic scheduling based on fleet availability and neighborhood density.",
        },
        {
          title: "Live GPS Tracking",
          detail: "Watch your pickup truck progress in real-time with verified arrival alerts.",
        },
      ],
    },
    {
      id: "reporting",
      icon: "🛡️",
      badge: "Civic Watch",
      title: "Geotagged Issue Reporting",
      desc: "Empower communities to report illegal dumping and bin overflows with GPS tagging and automated priority escalations.",
      metric: "3x Faster Resolution",
      audience: ["City Wards", "Citizens", "Environmental NGOs"],
      stats: [
        { label: "Avg Resolution", value: "< 4.2 hrs" },
        { label: "Community Trust", value: "98.8%" },
      ],
      highlights: [
        {
          title: "Photo & GPS Evidence",
          detail: "One-tap geotagged captures eliminate ambiguous locations and false reports.",
        },
        {
          title: "Closed-Loop Resolution",
          detail: "Citizens receive before/after verification photos as soon as crews clear the site.",
        },
      ],
    },
    {
      id: "analytics",
      icon: "📊",
      badge: "Admin Intelligence",
      title: "Predictive City Analytics",
      desc: "Equip municipal administrators and waste contractors with live heatmaps, predictive overflow models, and carbon accounting.",
      metric: "28% Reduced OpEx",
      audience: ["City Planners", "Fleet Supervisors", "Contractors"],
      stats: [
        { label: "Fleet CO2 Cut", value: "-24.2%" },
        { label: "Bin Sensor Grid", value: "1,200+ Nodes" },
      ],
      highlights: [
        {
          title: "Dynamic Route Optimization",
          detail: "AI recalculates optimal fuel-efficient paths avoiding empty bins.",
        },
        {
          title: "ESG & Carbon Reporting",
          detail: "Export verified sustainability metrics ready for ESG compliance and municipal audits.",
        },
      ],
    },
  ];

  const [activeFeature, setActiveFeature] = useState(features[0]);

  // ── Community Impact Calculator State ───────────────────────
  const [households, setHouseholds] = useState(250);

  // ── Animation Variants ──────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const floatingOrbVariants = {
    animate1: {
      x: [0, 20, -15, 0],
      y: [0, -25, 15, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    animate2: {
      x: [0, -30, 20, 0],
      y: [0, 20, -20, 0],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="landing-page">
      {/* Background Ambient Glowing Orbs */}
      <div className="ambient-background" aria-hidden="true">
        <motion.div
          className="ambient-orb ambient-orb--emerald"
          variants={floatingOrbVariants}
          animate="animate1"
        />
        <motion.div
          className="ambient-orb ambient-orb--teal"
          variants={floatingOrbVariants}
          animate="animate2"
        />
        <div className="ambient-grid-pattern" />
      </div>

      {/* ── Glassmorphic Navigation Bar ────────────────────────── */}
      <motion.header
        className="landing-nav-wrapper"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="landing-nav glass-panel">
          <div className="landing-brand" onClick={() => navigate("/")}>
            <div className="landing-brand__mark">
              <img src={ecobinLogo} alt="EcoBin Mark" />
            </div>
            <div className="landing-brand__copy">
              <strong>ECOBIN</strong>
              <span>Next-Gen Waste Intelligence</span>
            </div>
          </div>

          <div className="landing-nav__links">
            <a href="#features" className="nav-link">Platform</a>
            <a href="#ai-simulator" className="nav-link">Live AI Demo</a>
            <a href="#workflow" className="nav-link">Workflow</a>
            <a href="#impact" className="nav-link">Impact</a>
          </div>

          <div className="landing-nav__actions">
            <button
              className="btn-glass-subtle"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button
              className="btn-saas-primary"
              onClick={() => navigate("/signup")}
            >
              <span>Get Started</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ── Hero Section (Staggered + Floating Telemetry) ─────── */}
      <section className="landing-hero-section">
        <motion.div
          className="landing-hero"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Hero Content */}
          <motion.div className="landing-hero__copy" variants={itemVariants}>
            <motion.div
              className="glass-pill hero-status-pill"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <span className="pulse-dot"></span>
              <span className="hero-pill-text">AI Waste Infrastructure Platform</span>
            </motion.div>

            <h1 className="landing-title">
              Turn Waste Operations Into a{" "}
              <span className="text-gradient-emerald">High-Precision SaaS.</span>
            </h1>

            <p className="landing-description">
              EcoBin synchronizes AI-assisted sorting, smart curbside collection,
              and municipal fleet telematics into one unified, closed-loop sustainability platform.
            </p>

            {/* Action CTAs */}
            <div className="landing-hero__cta-group">
              <motion.button
                className="btn-saas-hero-primary"
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Launch EcoBin Platform</span>
                <span className="btn-arrow">→</span>
              </motion.button>

              <motion.a
                href="#ai-simulator"
                className="btn-saas-hero-ghost"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Try Live AI Classifier</span>
                <span className="btn-indicator">⚡</span>
              </motion.a>
            </div>

            {/* Live Trust Metrics */}
            <div className="hero-trust-bar">
              <div className="trust-metric">
                <AnimatedCounter value="28,450" suffix="+" />
                <span className="trust-metric__label">Kg Waste Diverted</span>
              </div>
              <div className="trust-metric-divider" />
              <div className="trust-metric">
                <AnimatedCounter value="99.4" suffix="%" />
                <span className="trust-metric__label">AI Precision Rate</span>
              </div>
              <div className="trust-metric-divider" />
              <div className="trust-metric">
                <AnimatedCounter value="14" suffix=" min" />
                <span className="trust-metric__label">Avg Dispatch Time</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive SaaS Preview & Floating Telemetry */}
          <motion.div className="landing-hero__panel-wrapper" variants={itemVariants}>
            {/* Floating Telemetry Badge 1: Top Left */}
            <motion.div
              className="floating-telemetry floating-telemetry--top-left glass-card"
              animate={{ y: [-6, 6, -6], rotate: [-0.5, 0.5, -0.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="telemetry-icon-circle green">
                <span>⚡</span>
              </div>
              <div className="telemetry-content">
                <strong>99.4% Accuracy</strong>
                <span>Live Edge Model v2.4</span>
              </div>
            </motion.div>

            {/* Floating Telemetry Badge 2: Bottom Right */}
            <motion.div
              className="floating-telemetry floating-telemetry--bottom-right glass-card"
              animate={{ y: [6, -6, 6], rotate: [0.5, -0.5, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="telemetry-icon-circle teal">
                <span>🌱</span>
              </div>
              <div className="telemetry-content">
                <strong>-24.8% Carbon</strong>
                <span>Dynamic Route Engine</span>
              </div>
            </motion.div>

            {/* Floating Telemetry Badge 3: Top Right */}
            <motion.div
              className="floating-telemetry floating-telemetry--top-right glass-card"
              animate={{ y: [-4, 5, -4] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <span className="status-indicator-live"></span>
              <span className="telemetry-tag">IoT Grid Sector 4B • Online</span>
            </motion.div>

            {/* Main Interactive SaaS Hub Preview */}
            <div className="saas-preview-hub glass-panel">
              {/* Window Header */}
              <div className="saas-hub-header">
                <div className="saas-hub-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="saas-hub-title">
                  <span className="lock-icon">🔒</span>
                  <span>ecobin.app/neural-telematics</span>
                </div>
                <div className="saas-hub-badge">
                  <span className="live-ping"></span>
                  <span>LIVE DEMO</span>
                </div>
              </div>

              {/* Hub Body */}
              <div className="saas-hub-body">
                {/* Active Focus Feature */}
                <div className="hub-feature-banner">
                  <div className="hub-feature-banner__info">
                    <span className="hub-eyebrow">ACTIVE MODULE</span>
                    <h4>{activeFeature.title}</h4>
                  </div>
                  <div className="hub-feature-banner__tag">
                    {activeFeature.metric}
                  </div>
                </div>

                <p className="hub-feature-desc">{activeFeature.desc}</p>

                {/* Micro Stats Grid */}
                <div className="hub-stats-row">
                  {activeFeature.stats.map((s, i) => (
                    <div key={i} className="hub-stat-card">
                      <span className="hub-stat-label">{s.label}</span>
                      <span className="hub-stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Micro Highlights */}
                <div className="hub-highlights-list">
                  {activeFeature.highlights.map((h, i) => (
                    <div key={i} className="hub-highlight-item">
                      <div className="highlight-bullet">✓</div>
                      <div>
                        <strong>{h.title}</strong>
                        <p>{h.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Quick Switch Bar */}
                <div className="hub-quick-switcher">
                  <span className="switcher-label">Preview Core APIs:</span>
                  <div className="switcher-tabs">
                    {features.map((f) => (
                      <button
                        key={f.id}
                        className={`switcher-tab ${activeFeature.id === f.id ? "active" : ""}`}
                        onClick={() => setActiveFeature(f)}
                      >
                        <span>{f.icon}</span>
                        <span>{f.title.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Interactive Live AI Scanner Simulator ─────────────── */}
      <section id="ai-simulator" className="landing-simulator-section">
        <motion.div
          className="section-header-centered"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-pill section-pill">
            <span className="pulse-dot"></span>
            <span>Interactive AI Sandbox</span>
          </div>
          <h2>Experience Computer Vision in Action</h2>
          <p>
            Select a waste item below to test our neural classifier, confidence breakdown,
            and automated circular economy routing in real-time.
          </p>
        </motion.div>

        <motion.div
          className="simulator-container glass-panel"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Item Selector Tabs */}
          <div className="simulator-items-selector">
            <span className="selector-title">Select Sample Item to Classify:</span>
            <div className="simulator-item-buttons">
              {demoItems.map((item) => (
                <button
                  key={item.id}
                  className={`item-selector-btn ${activeDemo.id === item.id ? "active" : ""}`}
                  onClick={() => setActiveDemo(item)}
                >
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-name">{item.name}</span>
                  {activeDemo.id === item.id && (
                    <motion.div
                      layoutId="activeDemoTab"
                      className="active-tab-glow"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Visualizer Grid */}
          <div className="simulator-grid">
            {/* Scanner Visual Frame */}
            <div className="scanner-frame glass-card">
              <div className="scanner-viewport">
                <div className="scanner-laser-line" />
                <div className="scanner-target-reticle" />
                <span className="scanner-item-emoji">{activeDemo.icon}</span>
                <div className="scanner-overlay-info">
                  <span className="tag-model">NEURAL_NET_v2.4</span>
                  <span className="tag-confidence">{activeDemo.confidence}% MATCH</span>
                </div>
              </div>
              <div className="scanner-footer">
                <div className="scanner-status">
                  <span className="live-dot-green"></span>
                  <span>Optical Stream Validated</span>
                </div>
                <span className="scanner-latency">18ms</span>
              </div>
            </div>

            {/* AI Diagnostics & Output Panel */}
            <div className="diagnostics-panel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemo.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3 }}
                  className="diagnostics-content"
                >
                  <div className="diagnostics-header">
                    <div>
                      <span className="diag-eyebrow">CLASSIFICATION RESULT</span>
                      <h3 style={{ color: activeDemo.color }}>{activeDemo.category}</h3>
                    </div>
                    <div className="diag-co2-pill" style={{ borderColor: activeDemo.color }}>
                      <span>🌱</span>
                      <strong>{activeDemo.co2}</strong>
                    </div>
                  </div>

                  {/* Confidence Progress Meter */}
                  <div className="progress-block">
                    <div className="progress-info">
                      <span>Model Confidence</span>
                      <strong>{activeDemo.confidence}%</strong>
                    </div>
                    <div className="progress-track">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeDemo.confidence}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ background: activeDemo.color }}
                      />
                    </div>
                  </div>

                  {/* Material Attribute Breakdown Bars */}
                  <div className="attributes-breakdown">
                    {Object.entries(activeDemo.breakdown).map(([attr, val]) => (
                      <div key={attr} className="attribute-row">
                        <span className="attr-name">{attr.replace(/([A-Z])/g, " $1")}</span>
                        <div className="attr-bar-wrapper">
                          <motion.div
                            className="attr-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                        <span className="attr-val">{val}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Protocol Directive Box */}
                  <div className="protocol-box">
                    <div className="protocol-icon">💡</div>
                    <div className="protocol-text">
                      <strong>Automated Disposal Directive:</strong>
                      <p>{activeDemo.protocol}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features & Ecosystem Grid (Card Hover & Scroll Reveal) */}
      <section id="features" className="landing-features-section">
        <motion.div
          className="section-header-centered"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-pill section-pill">
            <span>Modular SaaS Architecture</span>
          </div>
          <h2>Engineered for Scale, Speed & Precision</h2>
          <p>
            From individual citizen households to municipal fleets, EcoBin powers
            seamless waste traceability across the entire circular lifecycle.
          </p>
        </motion.div>

        <div className="features-bento-grid">
          {features.map((f, idx) => (
            <motion.div
              key={f.id}
              className={`feature-bento-card glass-card ${activeFeature.id === f.id ? "card-highlighted" : ""}`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => setActiveFeature(f)}
            >
              <div className="bento-top">
                <div className="bento-icon-wrapper">
                  <span>{f.icon}</span>
                </div>
                <span className="bento-badge">{f.badge}</span>
              </div>

              <h3>{f.title}</h3>
              <p>{f.desc}</p>

              <div className="bento-metric-row">
                <span className="bento-metric-val">{f.metric}</span>
                <span className="bento-audience-tags">
                  {f.audience.slice(0, 2).join(" • ")}
                </span>
              </div>

              <div className="bento-card-footer">
                <span className="card-learn-more">
                  Explore Architecture <span>→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3-Step Circular Workflow ───────────────────────────── */}
      <section id="workflow" className="landing-workflow-section">
        <motion.div
          className="section-header-centered"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-pill section-pill">
            <span>End-to-End Operational Pipeline</span>
          </div>
          <h2>How EcoBin Transforms Waste Operations</h2>
          <p>
            A frictionless, transparent journey from initial disposal to verified diversion.
          </p>
        </motion.div>

        <div className="workflow-steps-grid">
          {[
            {
              step: "01",
              icon: "📸",
              title: "Scan or Request",
              desc: "Citizens classify items with AI camera guidance or schedule on-demand bulk collections in under 30 seconds.",
              highlight: "Sub-second AI Inference",
            },
            {
              step: "02",
              icon: "🧠",
              title: "Neural Fleet Routing",
              desc: "Algorithms cluster pickup locations by material density and dynamically optimize truck routes to cut emissions.",
              highlight: "-24% Route Carbon",
            },
            {
              step: "03",
              icon: "🌱",
              title: "Verified Closed Loop",
              desc: "Recycling hubs verify weights and generate cryptographically timestamped ESG diversion certificates.",
              highlight: "Automated ESG Telematics",
            },
          ].map((s, index) => (
            <motion.div
              key={s.step}
              className="workflow-step-card glass-card"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -5 }}
            >
              <div className="step-header">
                <span className="step-number">{s.step}</span>
                <span className="step-icon">{s.icon}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="step-highlight-pill">
                <span>⚡</span>
                <span>{s.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Community Impact & Calculator Section ──────────────── */}
      <section id="impact" className="landing-calculator-section">
        <motion.div
          className="calculator-box glass-panel"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="calc-left">
            <div className="glass-pill">
              <span className="pulse-dot"></span>
              <span>Live ESG Impact Model</span>
            </div>
            <h2>Estimate Your Community's Environmental ROI</h2>
            <p>
              Adjust the slider to simulate annual waste diversion and greenhouse gas offsets
              achieved when deploying EcoBin's AI infrastructure.
            </p>

            {/* Interactive Slider */}
            <div className="calc-slider-group">
              <div className="slider-header">
                <span>Active Participating Households:</span>
                <strong>{households.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={households}
                onChange={(e) => setHouseholds(Number(e.target.value))}
                className="calc-range-slider"
              />
              <div className="slider-limits">
                <span>50 homes</span>
                <span>1,250 homes</span>
                <span>2,500+ homes</span>
              </div>
            </div>
          </div>

          {/* ROI Metric Cards */}
          <div className="calc-right">
            <div className="calc-metrics-grid">
              <div className="calc-metric-card glass-card">
                <span className="calc-metric-icon">♻️</span>
                <div className="calc-metric-num">
                  <AnimatedCounter
                    value={(households * 114).toLocaleString()}
                    suffix=" kg"
                  />
                </div>
                <span className="calc-metric-lbl">Annual Recyclables Diverted</span>
              </div>

              <div className="calc-metric-card glass-card">
                <span className="calc-metric-icon">🌳</span>
                <div className="calc-metric-num">
                  <AnimatedCounter
                    value={(households * 42).toLocaleString()}
                    suffix=" kg"
                  />
                </div>
                <span className="calc-metric-lbl">Net CO2 Emissions Avoided</span>
              </div>

              <div className="calc-metric-card glass-card">
                <span className="calc-metric-icon">⏱️</span>
                <div className="calc-metric-num">
                  <AnimatedCounter
                    value={Math.round(households * 1.8).toLocaleString()}
                    suffix=" hrs"
                  />
                </div>
                <span className="calc-metric-lbl">Municipal Crew Hours Saved</span>
              </div>

              <div className="calc-metric-card glass-card">
                <span className="calc-metric-icon">⚡</span>
                <div className="calc-metric-num">
                  <AnimatedCounter
                    value={(households * 185).toLocaleString()}
                    prefix="$"
                  />
                </div>
                <span className="calc-metric-lbl">Landfill Surcharge Savings</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── High-Converting SaaS Dark Banner ───────────────────── */}
      <section className="landing-cta-banner-section">
        <motion.div
          className="cta-banner-card"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-banner-glow" />
          <div className="cta-banner-content">
            <span className="cta-banner-tag">Ready for Next-Gen Waste Intelligence?</span>
            <h2>Accelerate Your City's Sustainable Future Today.</h2>
            <p>
              Join forward-thinking citizens, recycling operators, and municipal managers
              scaling intelligent waste recovery on EcoBin.
            </p>

            <div className="cta-banner-buttons">
              <motion.button
                className="btn-banner-primary"
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Create Free Account</span>
                <span>→</span>
              </motion.button>
              <motion.button
                className="btn-banner-secondary"
                onClick={() => navigate("/login?role=admin")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Municipal Portal Demo</span>
                <span>↗</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SaaS Minimal Footer ────────────────────────────────── */}
      <footer className="landing-footer-modern">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img src={ecobinLogo} alt="EcoBin" className="footer-logo" />
              <strong>ECOBIN</strong>
            </div>
            <p>
              The intelligent, closed-loop waste management platform for sustainable communities.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot-green"></span>
              <span>All Systems Operational • 99.98% Uptime</span>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h5>Platform</h5>
              <a href="#ai-simulator">Vision AI Scanner</a>
              <a href="#features">Smart Pickups</a>
              <a href="#features">Civic Reporting</a>
              <a href="#features">Fleet Analytics</a>
            </div>

            <div className="footer-col">
              <h5>Access Portals</h5>
              <button onClick={() => navigate("/login")}>Citizen Login</button>
              <button onClick={() => navigate("/login?role=admin")}>Admin Console</button>
              <button onClick={() => navigate("/signup")}>Registration</button>
            </div>

            <div className="footer-col">
              <h5>Technology</h5>
              <span>Edge Computer Vision</span>
              <span>Framer Motion Physics</span>
              <span>Plus Jakarta Sans & Inter</span>
              <span>Real-Time Telematics</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 EcoBin Inc. Clean • Sustainable • Autonomous Waste Infrastructure.</p>
          <div className="footer-bottom-badges">
            <span>🌿 Carbon Neutral Web</span>
            <span>🔒 SOC-2 Compliant Protocols</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
