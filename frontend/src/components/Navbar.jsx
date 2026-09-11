import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, LayoutDashboard, History, BarChart3, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: History },
    { to: '/performance', label: 'Performance', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand">
          <BrainCircuit size={22} />
          <span>AI Interview Simulator</span>
        </Link>

        {isAuthenticated && (
          <>
            <div className="nav-links desktop-only">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="nav-link">
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="nav-actions desktop-only">
              <ThemeToggle />
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            <button className="mobile-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        )}
      </div>

      {isAuthenticated && open && (
        <div className="mobile-menu">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="nav-link" onClick={() => setOpen(false)}>
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
          <div className="mobile-menu-footer">
            <ThemeToggle />
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 62px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
          color: var(--color-primary);
          text-decoration: none;
        }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--color-ink-soft);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
        }
        .nav-link:hover { background: var(--color-bg); color: var(--color-ink); }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: transparent;
          color: var(--color-ink-soft);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }
        .logout-btn:hover { border-color: var(--color-danger); color: var(--color-danger); }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-ink);
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 8px 16px 16px;
          border-top: 1px solid var(--color-border);
          gap: 4px;
        }
        .mobile-menu-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
        }
        @media (max-width: 800px) {
          .desktop-only { display: none; }
          .mobile-toggle { display: block; }
          .mobile-menu { display: flex; }
        }
      `}</style>
    </nav>
  );
}
