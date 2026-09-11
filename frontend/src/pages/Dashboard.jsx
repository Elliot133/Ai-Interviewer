import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, History, TrendingUp, Award, ListChecks } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import ScoreCard from '../components/ScoreCard';
import InterviewCard from '../components/InterviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { getInterviews } from '../services/interviewService';
import { extractErrorMessage } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState(null);
  const [error, setError] = useState(null);

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
        <LoadingSpinner label="Loading your dashboard..." />
      </div>
    );
  }

  const completed = interviews.filter((i) => i.status === 'COMPLETED');
  const totalInterviews = completed.length;
  const avgScore = totalInterviews
    ? Math.round(completed.reduce((sum, i) => sum + (i.overallPercentage || 0), 0) / totalInterviews)
    : 0;
  const bestScore = totalInterviews
    ? Math.round(Math.max(...completed.map((i) => i.overallPercentage || 0)))
    : 0;
  const recent = interviews.slice(0, 4);

  return (
    <div>
      <Navbar />
      <div className="container dashboard">
        <div className="dash-header">
          <div>
            <h1>Welcome back, {user?.firstName}</h1>
            <p>Ready to sharpen your interview skills today?</p>
          </div>
          <Link to="/interview/setup">
            <Button icon={PlusCircle} size="lg">Start New Interview</Button>
          </Link>
        </div>

        <div className="stats-grid">
          <ScoreCard label="Total interviews" value={totalInterviews} />
          <ScoreCard label="Average score" value={avgScore} suffix="%" accent />
          <ScoreCard label="Best score" value={bestScore} suffix="%" />
          <ScoreCard label="In progress" value={interviews.filter((i) => i.status === 'IN_PROGRESS').length} />
        </div>

        <div className="dash-section">
          <div className="section-header">
            <h2><History size={18} /> Recent interviews</h2>
            <Link to="/history" className="section-link">View all</Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state">
              <ListChecks size={32} />
              <p>You haven't started an interview yet.</p>
              <Link to="/interview/setup"><Button icon={PlusCircle}>Start your first interview</Button></Link>
            </div>
          ) : (
            <div className="cards-grid">
              {recent.map((interview) => <InterviewCard key={interview.id} interview={interview} />)}
            </div>
          )}
        </div>

        <div className="dash-links">
          <Link to="/performance" className="dash-link-card">
            <TrendingUp size={20} />
            <div>
              <h3>Performance analytics</h3>
              <p>See your score trends and strengths over time.</p>
            </div>
          </Link>
          <Link to="/profile" className="dash-link-card">
            <Award size={20} />
            <div>
              <h3>Your profile</h3>
              <p>Update your details and change your password.</p>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        .dashboard { padding: 32px 24px 60px; display: flex; flex-direction: column; gap: 32px; }
        .dash-header {
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }
        .dash-header p { color: var(--color-ink-soft); margin-top: 4px; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-header h2 { display: flex; align-items: center; gap: 8px; font-size: 17px; }
        .section-link { color: var(--color-accent); font-weight: 600; font-size: 13.5px; text-decoration: none; }
        .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 48px 24px; color: var(--color-ink-soft); text-align: center;
          border: 1px dashed var(--color-border-strong); border-radius: var(--radius-lg);
        }
        .dash-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .dash-link-card {
          display: flex; align-items: flex-start; gap: 14px;
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 20px; text-decoration: none; color: inherit;
        }
        .dash-link-card:hover { border-color: var(--color-accent); }
        .dash-link-card svg { color: var(--color-accent); flex-shrink: 0; margin-top: 2px; }
        .dash-link-card h3 { font-size: 14.5px; margin-bottom: 4px; }
        .dash-link-card p { margin: 0; font-size: 12.5px; color: var(--color-ink-soft); }

        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .cards-grid, .dash-links { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
