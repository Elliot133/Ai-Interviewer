import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getAnalytics } from '../services/interviewService';
import { extractErrorMessage } from '../services/api';

export default function Performance() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: 32 }}><ErrorMessage message={error} onRetry={load} /></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Loading performance analytics..." />
      </div>
    );
  }

  const roleData = Object.entries(analytics.averageScoreByJobRole || {}).map(([role, score]) => ({
    role, score: Math.round(score),
  }));

  const trendData = (analytics.scoreOverTime || []).map((item) => ({
    date: item.date, score: Math.round(item.score),
  }));

  if (analytics.totalInterviews === 0) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '32px 24px' }}>
          <h1>Performance</h1>
          <div className="empty-state">
            <p>Complete an interview to start seeing your performance analytics here.</p>
          </div>
        </div>
        <style>{`
          .empty-state {
            margin-top: 20px; padding: 48px 24px; text-align: center; color: var(--color-ink-soft);
            border: 1px dashed var(--color-border-strong); border-radius: var(--radius-lg);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container performance-page">
        <h1>Performance</h1>

        <div className="stats-grid">
          <ScoreCard label="Total interviews" value={analytics.totalInterviews} />
          <ScoreCard label="Average score" value={Math.round(analytics.averageScore)} suffix="%" accent />
          <ScoreCard label="Highest score" value={Math.round(analytics.highestScore)} suffix="%" />
          <ScoreCard label="Lowest score" value={Math.round(analytics.lowestScore)} suffix="%" />
        </div>

        <div className="chart-panel">
          <h3>Score over time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#B5732B" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <h3>Average score by job role</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roleData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="role" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#16233D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .performance-page { padding: 32px 24px 60px; display: flex; flex-direction: column; gap: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .chart-panel {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 20px;
        }
        .chart-panel h3 { font-size: 15px; margin-bottom: 12px; }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
