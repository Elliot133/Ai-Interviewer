import { Link } from 'react-router-dom';
import { BrainCircuit, Mic, BarChart3, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav container">
        <div className="brand"><BrainCircuit size={22} /><span>AI Interview Simulator</span></div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/register"><Button>Get started</Button></Link>
        </div>
      </header>

      <section className="hero container">
        <h1>Practice real interviews.<br />Get real feedback.</h1>
        <p>Pick a role, a difficulty, and a style of interview. The AI asks realistic questions,
          evaluates your answers, and shows you exactly where to improve — by typing or by speaking.</p>
        <div className="hero-actions">
          <Link to="/register"><Button size="lg">Start practicing free</Button></Link>
          <Link to="/login"><Button size="lg" variant="secondary">I already have an account</Button></Link>
        </div>
      </section>

      <section className="features container">
        <div className="feature">
          <Mic size={22} />
          <h3>Type or speak your answers</h3>
          <p>Answer naturally with your microphone, or type — the choice is always yours.</p>
        </div>
        <div className="feature">
          <BrainCircuit size={22} />
          <h3>AI-generated questions</h3>
          <p>Questions adapt to your role, experience level and how you're performing.</p>
        </div>
        <div className="feature">
          <BarChart3 size={22} />
          <h3>Track your progress</h3>
          <p>Review detailed feedback and watch your scores improve over time.</p>
        </div>
        <div className="feature">
          <ShieldCheck size={22} />
          <h3>Your data stays yours</h3>
          <p>Every interview is private to your account and securely stored.</p>
        </div>
      </section>

      <style>{`
        .landing { min-height: 100vh; }
        .landing-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px;
        }
        .brand { display: flex; align-items: center; gap: 9px; font-family: var(--font-display); font-weight: 700; color: var(--color-primary); }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .hero { text-align: center; padding: 60px 24px 40px; max-width: 720px; }
        .hero h1 { font-size: 40px; line-height: 1.15; margin-bottom: 18px; }
        .hero p { color: var(--color-ink-soft); font-size: 16px; line-height: 1.6; margin-bottom: 28px; }
        .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .features {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
          padding: 20px 24px 80px;
        }
        .feature {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 22px;
        }
        .feature svg { color: var(--color-accent); margin-bottom: 12px; }
        .feature h3 { font-size: 15px; margin-bottom: 6px; }
        .feature p { margin: 0; font-size: 13px; color: var(--color-ink-soft); line-height: 1.55; }
        @media (max-width: 900px) { .features { grid-template-columns: 1fr 1fr; } .hero h1 { font-size: 32px; } }
        @media (max-width: 560px) { .features { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
