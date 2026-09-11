import { Link } from 'react-router-dom';
import { Briefcase, Calendar, Clock, Layers } from 'lucide-react';

export default function InterviewCard({ interview }) {
  const date = new Date(interview.startedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const durationMinutes = Math.round((interview.durationSeconds || 0) / 60);

  return (
    <Link to={`/results/${interview.id}`} className="interview-card">
      <div className="ic-top">
        <span className="ic-role">
          <Briefcase size={15} /> {interview.jobRole}
        </span>
        <span className={`ic-status ic-status-${interview.status?.toLowerCase()}`}>
          {interview.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="ic-meta">
        <span><Layers size={13} /> {interview.interviewType} · {interview.difficulty}</span>
        <span><Calendar size={13} /> {date}</span>
        <span><Clock size={13} /> {durationMinutes} min · {interview.totalQuestions} questions</span>
      </div>

      {interview.overallPercentage != null && (
        <div className="ic-score">
          <span className="ic-score-value">{Math.round(interview.overallPercentage)}%</span>
          <span className="ic-score-label">Overall score</span>
        </div>
      )}

      <style>{`
        .interview-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 18px 20px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.15s ease;
        }
        .interview-card:hover { border-color: var(--color-accent); }
        .ic-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .ic-role {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--font-display); font-weight: 700; font-size: 14.5px; color: var(--color-primary);
        }
        .ic-status {
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
          padding: 4px 9px; border-radius: 999px;
        }
        .ic-status-completed { background: var(--color-success-soft); color: var(--color-success); }
        .ic-status-in_progress { background: var(--color-warning-soft); color: var(--color-warning); }
        .ic-status-expired { background: var(--color-danger-soft); color: var(--color-danger); }
        .ic-meta {
          display: flex; flex-wrap: wrap; gap: 14px;
          font-size: 12.5px; color: var(--color-ink-soft);
        }
        .ic-meta span { display: flex; align-items: center; gap: 5px; }
        .ic-score {
          display: flex; align-items: baseline; gap: 8px;
          border-top: 1px solid var(--color-border); padding-top: 10px;
        }
        .ic-score-value { font-family: var(--font-display); font-weight: 800; font-size: 20px; color: var(--color-accent-strong); }
        .ic-score-label { font-size: 12px; color: var(--color-ink-faint); }
      `}</style>
    </Link>
  );
}
