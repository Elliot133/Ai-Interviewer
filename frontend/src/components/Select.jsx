export default function Select({ label, error, options, id, ...rest }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field">
      {label && <label htmlFor={selectId}>{label}</label>}
      <select id={selectId} className={error ? 'has-error' : ''} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}

      <style>{`
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        label { font-size: 13px; font-weight: 600; color: var(--color-ink-soft); }
        select {
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: var(--color-surface);
          color: var(--color-ink);
          font-size: 14px;
        }
        select:focus { border-color: var(--color-accent); outline: none; }
        select.has-error { border-color: var(--color-danger); }
        .error-text { font-size: 12px; color: var(--color-danger); }
      `}</style>
    </div>
  );
}
