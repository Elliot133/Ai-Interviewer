import { BrainCircuit } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <BrainCircuit size={26} />
          <span>AI Interview Simulator</span>
        </div>
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>

      <style>{`
        .auth-layout {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--color-bg);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 36px 32px;
          box-shadow: var(--shadow-md);
        }
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 24px;
          font-size: 15px;
        }
        .auth-card h1 { font-size: 22px; margin-bottom: 6px; }
        .auth-subtitle { color: var(--color-ink-soft); font-size: 13.5px; margin: 0 0 22px; }
      `}</style>
    </div>
  );
}
