import { Link } from 'react-router-dom';
import { BrainCircuit, Mic, BarChart3, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand"><div className="brand-icon"><BrainCircuit size={18} /></div><span>AI Interview Simulator</span></div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link to="/login"><Button variant="ghost" style={{borderRadius: '999px', padding: '10px 16px'}}>Sign in</Button></Link>
          <Link to="/register"><Button style={{borderRadius: '999px', padding: '10px 18px'}}>Get started</Button></Link>
        </div>
      </header>

      <section className="hero container">
        <div className="pill"><Sparkles size={14} /> New: Voice interviews with real-time feedback</div>
        <h1>Practice real interviews.<br />Get real feedback.</h1>
        <p>Pick a role, a difficulty, and a style of interview. The AI asks realistic questions,
          evaluates your answers, and shows you exactly where to improve — by typing or by speaking.</p>
        <div className="hero-actions">
          <Link to="/register"><Button size="lg" style={{borderRadius: '999px'}}>Start practicing free</Button></Link>
          <Link to="/login"><Button size="lg" variant="secondary" style={{borderRadius: '999px'}}>I already have an account</Button></Link>
        </div>
      </section>

      <section className="features container">
        <div className="feature">
          <div className="feature-icon"><Mic size={20} /></div>
          <h3>Type or speak your answers</h3>
          <p>Answer naturally with your microphone, or type — the choice is always yours.</p>
        </div>
        <div className="feature">
          <div className="feature-icon"><BrainCircuit size={20} /></div>
          <h3>AI-generated questions</h3>
          <p>Questions adapt to your role, experience level and how you're performing.</p>
        </div>
        <div className="feature">
          <div className="feature-icon"><BarChart3 size={20} /></div>
          <h3>Track your progress</h3>
          <p>Review detailed feedback and watch your scores improve over time.</p>
        </div>
        <div className="feature">
          <div className="feature-icon"><ShieldCheck size={20} /></div>
          <h3>Your data stays yours</h3>
          <p>Every interview is private to your account and securely stored.</p>
        </div>
      </section>

      <section className="about container">
        <div className="about-card">
          <div className="about-text">
            <h2>About the Simulator</h2>
            <p>We built this for people who freeze in real interviews. Practice unlimited times without judgment, get scored like a real hiring manager would.</p>
            <div className="about-list">
              <span><CheckCircle2 size={16} /> Voice + text mode</span>
              <span><CheckCircle2 size={16} /> Role-based: Frontend, Backend, Product, Data</span>
              <span><CheckCircle2 size={16} /> Instant clarity, confidence & knowledge score</span>
            </div>
          </div>
          <div className="about-stats">
            <div className="stat"><b>10k+</b> interviews done</div>
            <div className="stat"><b>4.9/5</b> user rating</div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="brand"><div className="brand-icon"><BrainCircuit size={18} /></div><span>AI Interview Simulator</span></div>
            <p>Practice smarter. Interview better.</p>
          </div>
          <div className="footer-links">
            <div><strong>Product</strong><Link to="/register">Get started</Link><Link to="/login">Sign in</Link></div>
            <div><strong>Company</strong><span>About</span><span>Privacy</span></div>
          </div>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} AI Interview Simulator. All rights reserved.</div>
      </footer>

      <style>{`
        .landing { min-height: 100vh; background: #f8f9fc; }
        .landing-nav {
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            gap: 28px;
            padding: 8px 10px 8px 16px;
            background: rgba(255,255,255,0.55);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            position: fixed; 
            top: 16px; 
            left: 50%; 
            transform: translateX(-50%);
            width: auto;
            max-width: calc(100% - 24px);
            z-index: 100;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.4);
            box-shadow: 0 8px 30px rgba(15,23,42,0.06);
          }
        .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 15px; color: #0f172a; white-space: nowrap; }
        .brand-icon { width: 32px; height: 32px; border-radius: 999px; background: #0f172a; color: white; display: grid; place-items: center; flex-shrink: 0; }
        .nav-actions { display: flex; align-items: center; gap: 4px; margin-left: 12px; }

        .hero { text-align: center; padding: 140px 24px 40px; max-width: 760px; margin: 0 auto; }
        .pill { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #e5e7eb; padding: 7px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 600; margin-bottom: 22px; }
        .hero h1 { font-size: 52px; line-height: 1.05; letter-spacing: -0.03em; font-weight: 800; color: #0f172a; margin-bottom: 18px; }
        .hero p { color: #475569; font-size: 18px; line-height: 1.6; margin-bottom: 30px; max-width: 600px; margin-inline: auto; }
        .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        .features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; padding: 20px 24px 60px; max-width: 1200px; margin: 0 auto; }
        .feature { background: white; border: 1px solid #eef2f7; border-radius: 24px; padding: 22px 20px; box-shadow: 0 4px 20px rgba(15,23,42,0.03); }
        .feature-icon { width: 44px; height: 44px; border-radius: 14px; background: #fff7ed; color: #c2410c; display: grid; place-items: center; margin-bottom: 16px; border: 1px solid #ffedd5; }
        .feature h3 { font-size: 15.5px; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
        .feature p { margin: 0; font-size: 13.5px; color: #64748b; line-height: 1.6; }

        .about { padding: 0 24px 60px; max-width: 1200px; margin: 0 auto; }
        .about-card { background: white; border-radius: 32px; padding: 32px; display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 24px; border: 1px solid #eef2f7; }
        .about-text h2 { font-size: 28px; font-weight: 800; }
        .about-text p { color: #475569; margin: 12px 0 18px; line-height: 1.6; }
        .about-list { display: grid; gap: 10px; }
        .about-list span { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; background: #f8fafc; padding: 10px 14px; border-radius: 999px; }
        .about-stats { display: grid; gap: 14px; }
        .stat { background: #f8fafc; border-radius: 20px; padding: 20px; font-size: 14px; color: #475569; }
        .stat b { display: block; font-size: 28px; color: #0f172a; line-height: 1; margin-bottom: 4px; }

        .footer { background: #0f172a; margin-top: 20px; border-top-left-radius: 32px; border-top-right-radius: 32px; color: #94a3b8; }
        .footer-inner { display: flex; justify-content: space-between; gap: 24px; padding: 40px 24px 20px; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; }
        .footer-brand p { font-size: 14px; margin-top: 8px; }
        .footer-links { display: flex; gap: 50px; }
        .footer-links div { display: grid; gap: 10px; }
        .footer-links strong { color: white; font-size: 14px; }
        .footer-links a, .footer-links span { color: #94a3b8; text-decoration: none; font-size: 14px; }
        .footer-copy { text-align: center; border-top: 1px solid #1e293b; padding: 16px; font-size: 13px; }

        @media (max-width: 900px) { 
          .features { grid-template-columns: 1fr 1fr; } 
          .hero h1 { font-size: 36px; } 
          .about-card { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .landing-nav { width: calc(100% - 12px); top: 8px; padding: 8px 10px 8px 14px; }
          .hide-mobile { display: none; }
          .hero { padding-top: 110px; }
        }
      `}</style>
    </div>
  );
}