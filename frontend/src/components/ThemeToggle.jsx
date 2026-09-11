import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}

      <style>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: var(--color-surface);
          color: var(--color-ink-soft);
          cursor: pointer;
        }
        .theme-toggle:hover { border-color: var(--color-accent); color: var(--color-accent); }
      `}</style>
    </button>
  );
}
