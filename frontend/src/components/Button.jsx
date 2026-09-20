export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  onClick,
  full = false,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${full ? 'btn-full' : ''}`}
      {...rest}
    >
      {Icon && iconPosition === 'left' && <Icon size={17} strokeWidth={2} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={17} strokeWidth={2} />}

      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease, opacity 0.15s ease;
          white-space: nowrap;
        }
        .btn:active { transform: translateY(1px); }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-full { width: 100%; }

        .btn-sm { padding: 6px 12px; font-size: 13px; }
        .btn-md { padding: 10px 18px; font-size: 14px; }
        .btn-lg { padding: 13px 24px; font-size: 15px; }

        .btn-primary { background: var(--color-primary); color: var(--color-primary-contrast); }
        .btn-primary:hover:not(:disabled) { background: var(--color-primary-strong); }

        .btn-accent { background: var(--color-accent); color: #fff; }
        .btn-accent:hover:not(:disabled) { background: var(--color-accent-strong); }

        .btn-secondary { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-border-strong); }
        .btn-secondary:hover:not(:disabled) { border-color: var(--color-accent); }

        .btn-ghost { background: transparent; color: var(--color-ink-soft); }
        .btn-ghost:hover:not(:disabled) { background: var(--color-border); color: var(--color-ink); }

        .btn-danger { background: var(--color-danger); color: #fff; }
        .btn-danger:hover:not(:disabled) { opacity: 0.9; }
      `}</style>
    </button>
  );
}
