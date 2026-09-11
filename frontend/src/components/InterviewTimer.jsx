import { Clock } from 'lucide-react';

export default function InterviewTimer({ formatted, isWarning }) {
  return (
    <div className={`timer ${isWarning ? 'warning' : ''}`}>
      <Clock size={16} />
      <span>{formatted}</span>

      <style>{`
        .timer {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: var(--radius-sm);
          background: var(--color-bg);
          border: 1px solid var(--color-border-strong);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          color: var(--color-ink);
        }
        .timer.warning {
          background: var(--color-danger-soft);
          border-color: var(--color-danger);
          color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}
