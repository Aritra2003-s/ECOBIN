import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./ModernLanding.css";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    if (user)
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
  }, [user, navigate]);

  const features = [
    {
      icon: "♻",
      title: "AI Waste Scanner",
      desc: "Classify waste instantly from text or photo and get disposal guidance.",
      metric: "92% faster sorting support",
      audience: ["Citizens", "Schools", "Recycling drives"],
      highlights: [
        {
          title: "Live classification",
          detail: "Know whether an item is recyclable in a few taps.",
        },
        {
          title: "Confidence guidance",
          detail: "See how sure the model is before you act.",
        },
      ],
    },
    {
      icon: "⊕",
      title: "Pickup Requests",
      desc: "Schedule waste pickups at your convenience with real-time tracking.",
      metric: "Flexible pickup windows",
      audience: ["Homes", "Apartments", "Local offices"],
      highlights: [
        {
          title: "Self-serve booking",
          detail: "Pick dates, time slots, and waste types from one flow.",
        },
        {
          title: "Tracking updates",
          detail: "Follow each request from pending to completed.",
        },
      ],
    },
    {
      icon: "⚑",
      title: "Issue Reporting",
      desc: "Report illegal dumping or missed collections with photo evidence.",
      metric: "Clearer reports, quicker action",
      audience: ["Neighborhoods", "Volunteers", "Ward teams"],
      highlights: [
        {
          title: "Detailed reporting",
          detail: "Share category, location, and photos in one report.",
        },
        {
          title: "History timeline",
          detail: "Keep a record of what you reported and what changed.",
        },
      ],
    },
    {
      icon: "▦",
      title: "Smart Analytics",
      desc: "Admins get predictive insights and route optimisation powered by AI.",
      metric: "Better planning visibility",
      audience: ["Admins", "Supervisors", "Operations teams"],
      highlights: [
        {
          title: "Operational overview",
          detail: "See pickups, reports, and demand trends in one place.",
        },
        {
          title: "AI insight cards",
          detail: "Prioritize anomalies and optimize routes faster.",
        },
      ],
    },
  ];

  const [activeFeature, setActiveFeature] = useState(features[0]);
  const stats = [
    { value: "1 app", label: "For citizens and admins" },
    { value: "Real-time", label: "Pickup visibility" },
    { value: "AI-first", label: "Sorting and insight support" },
  ];


  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="landing-brand__mark">
            <img src="assets/logo.png" alt="Ecobin Logo" />
          </div>
          <div className="landing-brand__copy">
            <strong>ECOBIN</strong>
            <span>Waste management made simpler</span>
          </div>
        </div>

        <div className="landing-nav__actions">
          <button
  className="btn-login"
  onClick={() => navigate("/login")}
>
  User Login
</button>

<button
  className="btn-login"
  onClick={() => navigate("/login?role=admin")}
>
  Admin Login
</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <div className="landing-pill">AI-powered waste management</div>
          <h1 className="landing-title">
            Smarter collection,
            <br />
            cleaner communities.
          </h1>
          <p className="landing-description">
            "Ecobin synchronizes citizen action and administrative precision
            into one fluid, AI-augmented ecosystem"
          </p>

          <div className="landing-stats">
            {stats.map((item) => (
              <div key={item.label} className="landing-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-hero__panel">
          <div className="landing-preview">
            <div className="landing-preview__header">
              <span className="landing-preview__eyebrow">
                Interactive preview
              </span>
              <div className="landing-preview__trend">
                <strong>{activeFeature.metric}</strong>
                <span>Current feature focus</span>
              </div>
            </div>

            <h3>{activeFeature.title}</h3>
            <p>{activeFeature.desc}</p>

            <div className="landing-preview__chips">
              {activeFeature.audience.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="landing-preview__list">
              {activeFeature.highlights.map((item) => (
                <div key={item.title} className="landing-preview__list-item">
                  <span>{activeFeature.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-section-heading">
          <div>
            <h2>Designed to feel active, not static</h2>
            <p>
              Tap between features to preview the workflow, then move into the
              part of the platform you need.
            </p>
          </div>
        </div>

        <div className="landing-feature-grid">
          {features.map((f) => (
            <button
              key={f.title}
              type="button"
              className={`card landing-feature-card ${activeFeature.title === f.title ? "landing-feature-card--active" : ""}`}
              onClick={() => setActiveFeature(f)}
            >
              <span className="landing-feature-card__icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="landing-steps">
        <div className="landing-section-heading">
          <div>
            <h2>How the flow works</h2>
            <p>
              Citizens can report, request, and track. Admins can monitor,
              optimize, and respond.
            </p>
          </div>
        </div>

        <div className="landing-step-grid">
          {[
            {
              step: "01",
              title: "Capture the need",
              desc: "Report a street issue or request a pickup from any device.",
            },
            {
              step: "02",
              title: "Use AI support",
              desc: "Let AI assist with waste classification and smarter routing decisions.",
            },
            {
              step: "03",
              title: "Track the outcome",
              desc: "Follow status changes and keep the service loop visible.",
            },
          ].map((item) => (
            <div key={item.step} className="card landing-step">
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta__box">
          <h2>Ready to make your city cleaner?</h2>
          <p>
            Start with a citizen account today and help monitor operations from
            a more modern dashboard.
          </p>
          <div className="landing-cta__actions">
            {/* UPDATED: Inlined strict background formatting rules to enforce deep brand blue matching the log-in page button */}
            <button
              className="btn-dark-flat"
              onClick={() => navigate("/signup")}
            >
              Start for free
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © 2026 Ecobin. Built with care for the planet.
      </footer>
    </div>
  );
}
