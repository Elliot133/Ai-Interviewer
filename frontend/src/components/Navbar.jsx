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

            <button className="mobile-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        )}
      </div>

      {isAuthenticated && (
        <>
          <div className={`mobile-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <Link to="/dashboard" className="brand" onClick={() => setOpen(false)}>
                <div className="brand-icon-wrap"><BrainCircuit size={20} /></div>
                <span>AI Interview<br/>Simulator</span>
              </Link>
              <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <div className="mobile-menu-links">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="nav-link" onClick={() => setOpen(false)}>
                  <div className="nav-icon-box"><Icon size={20} /></div>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
            <div className="mobile-menu-footer">
              <ThemeToggle />
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
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
          gap: 10px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
          color: var(--color-primary);
          text-decoration: none;
          line-height: 1.1;
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
        .mobile-menu,
        .mobile-overlay { display: none; }
        
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-toggle { display: block; }
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 49;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.35s ease;
          }
          .mobile-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }
          .mobile-menu {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 50;
            height: 100vh;
            width: 310px;
            padding: 28px 20px 28px;
            background: #ffffff;
            border-top-right-radius: 28px;
            border-bottom-right-radius: 28px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            transform: translateX(-105%);
            transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .mobile-menu.open { transform: translateX(0); }
          .mobile-menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: 24px;
            border-bottom: none;
          }
          .mobile-menu-header .brand {
            font-size: 16px;
            font-weight: 800;
            gap: 12px;
          }
          .brand-icon-wrap {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            background: #111827;
            color: white;
            border-radius: 12px;
          }
          .mobile-close {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            border: none;
            background: #f3f4f6;
            color: #111827;
            cursor: pointer;
          }
          .mobile-menu-links {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-top: 8px;
          }
          .mobile-menu .nav-link {
            padding: 14px 16px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 16px;
            gap: 14px;
            color: #374151;
            background: transparent;
            transition: all 0.2s ease;
          }
          .mobile-menu .nav-link:hover {
            background: #f9fafb;
            transform: scale(1.02);
          }
          .nav-icon-box {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: #f3f4f6;
            color: #111827;
          }
          .mobile-menu-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: auto;
            padding: 20px 4px 0;
            border-top: 1px solid #f1f5f9;
          }
          .mobile-menu-footer .logout-btn {
            padding: 12px 18px;
            border-radius: 14px;
            font-size: 15px;
            background: #fff;
            border: 1.5px solid #e5e7eb;
          }
        }
      `}</style>
    </nav>
  );
}