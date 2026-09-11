export default function Input({ label, error, hint, id, type = 'text', ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} type={type} className={error ? 'has-error' : ''} {...rest} />
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error-text">{error}</span>}

      <style>{`
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        label { font-size: 13px; font-weight: 600; color: var(--color-ink-soft); }
        input {
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: var(--color-surface);
          color: var(--color-ink);
          font-size: 14px;
        }
        input:focus { border-color: var(--color-accent); outline: none; }
        input.has-error { border-color: var(--color-danger); }
        .hint { font-size: 12px; color: var(--color-ink-faint); }
        .error-text { font-size: 12px; color: var(--color-danger); }
      `}</style>
    </div>
  );
}
