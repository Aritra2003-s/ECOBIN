import React, { useState } from 'react';
import StatusBadge from '../../common/StatusBadge';
import { formatRelative } from '../../../utils/formatDate';
import './InsightCard.css';

const typeColors = {
  waste_classification:     { bg: '#dcfce7', color: '#15803d', label: 'Classification' },
  route_optimization:       { bg: '#dbeafe', color: '#1d4ed8', label: 'Route Optimize' },
  predictive_analytics:     { bg: '#ede9fe', color: '#6d28d9', label: 'Prediction' },
  disposal_recommendation:  { bg: '#fef9c3', color: '#854d0e', label: 'Disposal Tip' },
  anomaly_detection:        { bg: '#fee2e2', color: '#b91c1c', label: 'Anomaly' },
};

export default function InsightCard({ insight, onMarkRead }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const meta = typeColors[insight.type] || typeColors.disposal_recommendation;

  const handleFlip = () => {
    // If flipping for the first time and not read, mark as read automatically
    if (!isFlipped && !insight.isRead && onMarkRead) {
      onMarkRead(insight._id);
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`insight-card-scene ${insight.isRead ? 'is-read' : ''}`}>
      <div 
        className={`insight-card__inner ${isFlipped ? 'is-flipped' : ''}`}
        onClick={handleFlip}
      >
        
        {/* --- FRONT: THE HOOK --- */}
        <div className="insight-card__face insight-card__face--front">
          <div className="card-header">
            <span 
              className="insight-card__tag" 
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="insight-card__time">
              {formatRelative(insight.createdAt)}
            </span>
          </div>

          <h3 className="insight-card__title">
            {insight.type?.replace(/_/g, ' ')}
          </h3>
          
          <div className="insight-card__status-indicator">
             {insight.isRead ? '✓ Reviewed' : '● New Insight'}
          </div>

          <p className="hint-text">Tap to analyze</p>
        </div>

        {/* --- BACK: THE DETAILS --- */}
        <div className="insight-card__face insight-card__face--back">
          <div className="card-header">
             <span className="analysis-label">AI ANALYSIS</span>
          </div>

          <p className="insight-card__body">
            {insight.payload?.summary || insight.payload?.routeSuggestion || 'AI analysis complete.'}
          </p>

          {insight.payload?.isRecyclable !== undefined && (
            <div className="insight-card__meta">
              <StatusBadge status={insight.payload.isRecyclable ? 'completed' : 'rejected'} />
              <span className="insight-card__meta-note">
                {Math.round((insight.payload.confidence || 0) * 100)}% Confidence
              </span>
            </div>
          )}

          <p className="tap-to-return">Tap to flip back</p>
        </div>

      </div>
    </div>
  );
}