import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', size = 22, inline = false }) {
  return (
    <div className={inline ? 'spinner-inline' : 'spinner-block'}>
      <Loader2 size={size} className="spin" />
      {label && <span>{label}</span>}

      <style>{`
        .spinner-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 24px;
          color: var(--color-ink-soft);
        }
        .spinner-inline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-ink-soft);
        }
        .spin { animation: ais-spin 0.8s linear infinite; color: var(--color-accent); }
        @keyframes ais-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
