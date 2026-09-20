import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, BrainCircuit, Mail, ArrowLeft } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import GoogleSignInButton from '../components/GoogleSignInButton';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

const initialForm = {
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '',
};

export default function Register() {
  const { register, registerWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState('choice'); // choice | form
  const [toast, setToast] = useState(null);

  useEffect(() => () => window.clearTimeout(toast?.timeoutId), [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({...f, [name]: value }));
    setFieldErrors(f => ({...f, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password!== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      const timeoutId = window.setTimeout(() => navigate('/login'), 1400);
      setToast({ message: 'Registration successful. Please login!', type: 'success', timeoutId });
    } catch (err) {
      if (err?.response?.status === 409) {
        setToast({ message: 'This email has been used before', type: 'error' });
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (token) => {
    setGoogleLoading(true);
    try {
      await registerWithGoogle(token);
      navigate('/dashboard');
    } catch (err) {
      if (err?.response?.status === 409) {
        setToast({ message: 'This email has been used before', type: 'error' });
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="register-page">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="register-card">
        <div className="register-visual">
          <div>
            <div className="brand-pill"><BrainCircuit size={16} /> AI Interview Simulator</div>
            <h2>Join 2,000+ people<br/>acing interviews.</h2>
            <p>Practice with AI that thinks like a real hiring manager.</p>
          </div>
          <div className="visual-stats">
            <div><b>95%</b> feel more confident</div>
            <div><b>10k+</b> interviews done</div>
          </div>
        </div>

        <div className="register-form-wrap">
          <div className="form-header">
            <h1>Create your account</h1>
            <p>Practice real interviews with AI-driven feedback.</p>
          </div>

          {error && <ErrorMessage message={error} />}

          {step === 'choice'? (
            <div className="choice-stack">
              <button className="choice-btn primary" onClick={() => setStep('form')}>
                <Mail size={18} /> Create account with email
              </button>

              <div className="divider"><span>or</span></div>

              <GoogleSignInButton onCredential={handleGoogle} disabled={googleLoading || loading} />

              <p className="footer-link">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form animate-in">
              <button type="button" className="back-btn" onClick={() => setStep('choice')}>
                <ArrowLeft size={16} /> Back
              </button>

              <div className="row">
                <div className="field">
                  <label>First name</label>
                  <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" error={fieldErrors.firstName} />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" error={fieldErrors.lastName} />
                </div>
              </div>

              <div className="field">
                <label>Email</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" error={fieldErrors.email} />
              </div>

              <div className="field">
                <label>Password</label>
                <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
                <span className="hint">At least 8 chars, one uppercase, one lowercase, one number</span>
              </div>

              <div className="field">
                <label>Confirm password</label>
                <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" error={fieldErrors.confirmPassword} />
              </div>

              <div className="field">
                <label>Phone number (optional)</label>
                <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+1..." />
              </div>

              <Button type="submit" loading={loading} style={{borderRadius: '999px', width: '100%', marginTop: '6px'}}>
                <UserPlus size={18} /> Create account
              </Button>

              <p className="footer-link">Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
          )}
        </div>
      </div>

      <style>{`
      .register-page { min-height: 100vh; background: var(--color-bg); display: grid; place-items: center; padding: 24px; }
      .register-card { width: 100%; max-width: 1000px; background: var(--color-surface); border-radius: 32px; overflow: hidden; display: grid; grid-template-columns: 0.9fr 1.1fr; box-shadow: var(--shadow-lg); border: 1px solid var(--color-border); min-height: 600px; }
       .register-visual { background: radial-gradient(120% 120% at 0% 0%, #1e293b 0%, #0f172a 60%, #020617 100%); color: white; padding: 36px; display: flex; flex-direction: column; justify-content: space-between; }
       .brand-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; backdrop-filter: blur(10px); }
       .register-visual h2 { font-size: 32px; font-weight: 800; line-height: 1.1; margin-top: 28px; letter-spacing: -0.02em; }
      .register-visual p { color: #94a3b8; margin-top: 12px; font-size: 15px; }
       .visual-stats { display: flex; gap: 12px; }
       .visual-stats div { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 14px 16px; border-radius: 16px; font-size: 13px; }
       .visual-stats b { display: block; font-size: 18px; color: white; }

      .register-form-wrap { padding: 36px; display: flex; flex-direction: column; justify-content: center; color: var(--color-ink); }
       .form-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-left: 60px; }
      .form-header p { color: var(--color-ink-soft); font-size: 14px; margin-top: 6px; margin-bottom: 24px; margin-left: 30px; }

       .choice-stack { display: grid; gap: 14px; }
      .choice-btn { width: 100%; padding: 14px 18px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-ink); font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
      .choice-btn.primary { background: var(--color-primary-strong); color: var(--color-bg); border-color: var(--color-primary-strong); }
      .choice-btn.primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
      .choice-btn:hover { background: var(--color-surface-raised); }

       .form { display: grid; gap: 14px; }
       .animate-in { animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
       .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
       .field { display: grid; gap: 6px; }
      .field label { font-size: 13px; font-weight: 600; color: var(--color-ink-soft); }
      .hint { font-size: 11.5px; color: var(--color-ink-faint); }
      .back-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--color-surface-raised); color: var(--color-ink); border: 1px solid var(--color-border); padding: 8px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer; width: fit-content; margin-bottom: 4px; }
       .divider { display: grid; place-items: center; position: relative; margin: 4px 0; }
      .divider::before { content: ''; position: absolute; width: 100%; height: 1px; background: var(--color-border); }
      .divider span { background: var(--color-surface); position: relative; padding: 0 12px; font-size: 12px; color: var(--color-ink-faint); }
      .footer-link { text-align: center; font-size: 13.5px; color: var(--color-ink-soft); margin-top: 6px; }
      .footer-link a { color: var(--color-primary); font-weight: 700; text-decoration: none; }

        @media (max-width: 860px) {
         .register-card { grid-template-columns: 1fr; border-radius: 24px; min-height: auto; }
         .register-visual { display: none; }
         .register-form-wrap { padding: 24px 20px; }
        }
        @media (max-width: 480px) {.row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}