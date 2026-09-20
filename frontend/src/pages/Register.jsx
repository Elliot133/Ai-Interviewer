import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, BrainCircuit, Mail, ArrowLeft } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

const initialForm = {
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '',
};

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState('choice'); // choice | form

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
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (token) => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(token);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="register-page">
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

              <GoogleSignInButton onSuccess={handleGoogle} loading={googleLoading} />

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
       .register-page { min-height: 100vh; background: #f4f5fb; display: grid; place-items: center; padding: 24px; }
       .register-card { width: 100%; max-width: 1000px; background: white; border-radius: 32px; overflow: hidden; display: grid; grid-template-columns: 0.9fr 1.1fr; box-shadow: 0 20px 60px rgba(15,23,42,0.08); border: 1px solid #eef2f7; min-height: 600px; }
       .register-visual { background: radial-gradient(120% 120% at 0% 0%, #1e293b 0%, #0f172a 60%, #020617 100%); color: white; padding: 36px; display: flex; flex-direction: column; justify-content: space-between; }
       .brand-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; backdrop-filter: blur(10px); }
       .register-visual h2 { font-size: 32px; font-weight: 800; line-height: 1.1; margin-top: 28px; letter-spacing: -0.02em; }
       .register-visual p { color: #94a3b8; margin-top: 12px; font-size: 15px; }
       .visual-stats { display: flex; gap: 12px; }
       .visual-stats div { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 14px 16px; border-radius: 16px; font-size: 13px; }
       .visual-stats b { display: block; font-size: 18px; color: white; }

       .register-form-wrap { padding: 36px; display: flex; flex-direction: column; justify-content: center; }
       .form-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-left: 60px; }
       .form-header p { color: #64748b; font-size: 14px; margin-top: 6px; margin-bottom: 24px; margin-left: 30px; }

       .choice-stack { display: grid; gap: 14px; }
       .choice-btn { width: 100%; padding: 14px 18px; border-radius: 999px; border: 1px solid #e2e8f0; background: white; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
       .choice-btn.primary { background: #0f172a; color: white; border-color: #0f172a; }
       .choice-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(15,23,42,0.2); }
       .choice-btn:hover { background: #f8fafc; }

       .form { display: grid; gap: 14px; }
       .animate-in { animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
       .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
       .field { display: grid; gap: 6px; }
       .field label { font-size: 13px; font-weight: 600; color: #334155; }
       .hint { font-size: 11.5px; color: #94a3b8; }
       .back-btn { display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer; width: fit-content; margin-bottom: 4px; }
       .divider { display: grid; place-items: center; position: relative; margin: 4px 0; }
       .divider::before { content: ''; position: absolute; width: 100%; height: 1px; background: #eef2f7; }
       .divider span { background: white; position: relative; padding: 0 12px; font-size: 12px; color: #94a3b8; }
       .footer-link { text-align: center; font-size: 13.5px; color: #64748b; margin-top: 6px; }
       .footer-link a { color: #0f172a; font-weight: 700; text-decoration: none; }

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