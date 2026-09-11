import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import InterviewCard from '../components/InterviewCard';
import Select from '../components/Select';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getInterviews } from '../services/interviewService';
import { extractErrorMessage } from '../services/api';

export default function History() {
  const [interviews, setInterviews] = useState(null);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [scoreFilter, setScoreFilter] = useState('All scores');

  const load = async () => {
    setError(null);
    try {
      const data = await getInterviews();
      setInterviews(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  const roles = useMemo(() => {
    if (!interviews) return ['All roles'];
    return ['All roles', ...new Set(interviews.map((i) => i.jobRole))];
  }, [interviews]);

  const types = useMemo(() => {
    if (!interviews) return ['All types'];
    return ['All types', ...new Set(interviews.map((i) => i.interviewType))];
  }, [interviews]);

  const filtered = useMemo(() => {
    if (!interviews) return [];
    return interviews
      .filter((i) => roleFilter === 'All roles' || i.jobRole === roleFilter)
      .filter((i) => typeFilter === 'All types' || i.interviewType === typeFilter)
      .filter((i) => {
        if (scoreFilter === 'All scores') return true;
        const pct = i.overallPercentage ?? -1;
        if (scoreFilter === '80+') return pct >= 80;
        if (scoreFilter === '60-79') return pct >= 60 && pct < 80;
        if (scoreFilter === 'Below 60') return pct >= 0 && pct < 60;
        return true;
      })
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  }, [interviews, roleFilter, typeFilter, scoreFilter]);

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: 32 }}><ErrorMessage message={error} onRetry={load} /></div>
      </div>
    );
  }

  if (!interviews) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Loading interview history..." />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container history-page">
        <div className="history-header">
          <h1>Interview History</h1>
          <Link to="/interview/setup"><Button icon={PlusCircle}>New interview</Button></Link>
        </div>

        <div className="filters">
          <Filter size={15} />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            options={roles.map((r) => ({ value: r, label: r }))} />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            options={types.map((t) => ({ value: t, label: t }))} />
          <Select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}
            options={['All scores', '80+', '60-79', 'Below 60'].map((s) => ({ value: s, label: s }))} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No interviews match these filters yet.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map((interview) => <InterviewCard key={interview.id} interview={interview} />)}
          </div>
        )}
      </div>

      <style>{`
        .history-page { padding: 32px 24px 60px; display: flex; flex-direction: column; gap: 22px; }
        .history-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .filters {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          color: var(--color-ink-soft);
        }
        .filters .field { margin-bottom: 0; min-width: 160px; }
        .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .empty-state {
          padding: 48px 24px; text-align: center; color: var(--color-ink-soft);
          border: 1px dashed var(--color-border-strong); border-radius: var(--radius-lg);
        }
        @media (max-width: 700px) { .cards-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
