import { CheckCircle2, TrendingUp } from 'lucide-react';

export default function FeedbackCard({ score, maxScore, feedback, strengths = [], improvements = [], modelAnswer }) {
  return (
    <div className="feedback-card">
      <div className="fc-header">
        <span className="fc-score">{score}/{maxScore}</span>
        <p>{feedback}</p>
      </div>

      {strengths.length > 0 && (
        <div className="fc-section">
          <h4><CheckCircle2 size={15} /> Strengths</h4>
          <ul>
            {strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="fc-section">
          <h4><TrendingUp size={15} /> Areas to improve</h4>
          <ul>
            {improvements.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {modelAnswer && (
        <div className="fc-model">
          <h4>Model answer</h4>
          <p>{modelAnswer}</p>
        </div>
      )}

      <style>{`
        .feedback-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .fc-header { display: flex; align-items: flex-start; gap: 16px; }
        .fc-score {
          flex-shrink: 0;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 20px;
          color: var(--color-accent-strong);
          background: var(--color-accent-soft);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
        }
        .fc-header p { margin: 0; color: var(--color-ink); line-height: 1.6; }
        .fc-section h4 {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--color-ink-soft);
          margin-bottom: 8px;
        }
        .fc-section ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
        .fc-section li { color: var(--color-ink); font-size: 14px; }
        .fc-model {
          border-top: 1px solid var(--color-border);
          padding-top: 14px;
        }
        .fc-model h4 { font-size: 13px; color: var(--color-ink-soft); margin-bottom: 8px; }
        .fc-model p { margin: 0; color: var(--color-ink-soft); font-size: 13.5px; line-height: 1.6; }
      `}</style>
    </div>
  );
}
