export default function Textarea({ label, error, id, rows = 6, ...rest }) {
  const areaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field">
      {label && <label htmlFor={areaId}>{label}</label>}
      <textarea id={areaId} rows={rows} className={error ? 'has-error' : ''} {...rest} />
      {error && <span className="error-text">{error}</span>}

      <style>{`
        .field { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        label { font-size: 13px; font-weight: 600; color: var(--color-ink-soft); }
        textarea {
          padding: 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-strong);
          background: var(--color-surface);
          color: var(--color-ink);
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          min-height: 140px;
          width: 100%;
        }
        textarea:focus { border-color: var(--color-accent); outline: none; }
        textarea.has-error { border-color: var(--color-danger); }
        .error-text { font-size: 12px; color: var(--color-danger); }
      `}</style>
    </div>
  );
}
