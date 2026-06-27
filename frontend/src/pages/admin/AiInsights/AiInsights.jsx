import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { aiApi } from '../../../api/aiApi';
import InsightCard from '../../../components/cards/InsightCard/InsightCard';
import Loader from '../../../components/common/Loader/Loader';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import useToast from '../../../hooks/useToast';
import './AiInsights.css'; // Import the CSS file

const TYPES = ['all', 'waste_classification', 'route_optimization', 'predictive_analytics', 'anomaly_detection'];

export default function AiInsights() {
  const toast = useToast();
  const [typeFilter, setTypeFilter] = useState('all');
  const [predicting, setPredicting] = useState(false);

  const { data, loading, refetch } = useFetch(
    () => aiApi.getInsights({ type: typeFilter === 'all' ? undefined : typeFilter, limit: 30 }),
    [typeFilter]
  );
  const insights = data?.insights || [];

  const handleMarkRead = async (id) => {
    await aiApi.markRead(id);
    refetch();
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      await aiApi.getPredictions();
      toast.success('Prediction generated!');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="insights-page">
      
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Insights</h1>
          <p className="page-subtitle">Machine learning recommendations and analysis results.</p>
        </div>
        <button className="btn btn-primary" onClick={handlePredict} disabled={predicting}>
          {predicting ? 'Generating…' : '✦ Run prediction'}
        </button>
      </div>

      {/* ── Type Filters ── */}
      <div className="filter-container">
        {TYPES.map((t) => (
          <button 
            key={t} 
            onClick={() => setTypeFilter(t)}
            className={`btn btn-sm filter-btn ${typeFilter === t ? 'btn-primary' : 'btn-ghost'}`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      {insights.length === 0 ? (
        <EmptyState 
          title="No insights yet"
          message="Use the AI Scanner or run a prediction to generate insights."
          action={<button className="btn btn-primary" onClick={handlePredict}>Run first prediction</button>}
        />
      ) : (
        <div className="grid-2">
          {insights.map((ins) => (
            <InsightCard key={ins._id} insight={ins} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}

    </div>
  );
}