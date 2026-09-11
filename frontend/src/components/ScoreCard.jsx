export default function ScoreCard({ label, value, suffix = '', accent = false }) {
  return (
    <div className={`score-card ${accent ? 'accent' : ''}`}>
      <span className="score-value">{value}{suffix}</span>
      <span className="score-label">{label}</span>

      <style>{`
        .score-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .score-card.accent { border-color: var(--color-accent); }
        .score-value {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          color: var(--color-primary);
        }
        .score-card.accent .score-value { color: var(--color-accent-strong); }
        .score-label {
          font-size: 12.5px;
          color: var(--color-ink-soft);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
