export default function ProgressBar({ value, max, label }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label"><span>{label}</span><span>{percent}%</span></div>}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <style>{`
        .progress-wrap { width: 100%; }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: var(--color-ink-soft);
          margin-bottom: 6px;
          font-weight: 600;
        }
        .progress-track {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: var(--color-border);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: 999px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}
