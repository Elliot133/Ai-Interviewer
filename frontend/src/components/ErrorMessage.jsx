import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error-box">
      <AlertTriangle size={18} />
      <span>{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry
        </Button>
      )}

      <style>{`
        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: var(--color-danger-soft);
          color: var(--color-danger);
          font-size: 13.5px;
          border: 1px solid var(--color-danger);
        }
        .error-box span { flex: 1; }
      `}</style>
    </div>
  );
}
