import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (idToken) => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle(idToken);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your interview practice.">
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <div style={{ marginBottom: 16 }}><ErrorMessage message={error} /></div>}

        <Button type="submit" icon={LogIn} full disabled={loading || googleLoading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      <GoogleSignInButton
        onCredential={handleGoogleCredential}
        onError={setError}
        disabled={googleLoading || loading}
      />

      <p className="switch-link">
        Don't have an account? <Link to="/register">Create one</Link>
      </p>

      <style>{`
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
        .auth-divider span { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: var(--color-ink-faint); }
        .switch-link { text-align: center; font-size: 13.5px; color: var(--color-ink-soft); margin-top: 20px; }
        .switch-link a { color: var(--color-accent); font-weight: 600; text-decoration: none; }
      `}</style>
    </AuthLayout>
  );
}
