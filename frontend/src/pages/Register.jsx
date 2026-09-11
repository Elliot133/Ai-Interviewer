import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

const initialForm = {
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '', careerField: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      errors.password = 'At least 8 characters, with an uppercase letter, lowercase letter and number';
    }
    if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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

  return (
    <AuthLayout title="Create your account" subtitle="Practice real interviews with AI-driven feedback.">
      <form onSubmit={handleSubmit}>
        <div className="two-col">
          <Input label="First name" name="firstName" value={form.firstName} onChange={handleChange} error={fieldErrors.firstName} required />
          <Input label="Last name" name="lastName" value={form.lastName} onChange={handleChange} error={fieldErrors.lastName} required />
        </div>

        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={fieldErrors.email} required />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={fieldErrors.password}
          hint={!fieldErrors.password ? 'At least 8 characters, one uppercase, one lowercase, one number' : null} required />
        <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={fieldErrors.confirmPassword} required />
        <Input label="Phone number (optional)" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <Input label="Career / field (optional)" name="careerField" value={form.careerField} onChange={handleChange} />

        {error && <div style={{ marginBottom: 16 }}><ErrorMessage message={error} /></div>}

        <Button type="submit" icon={UserPlus} full disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="switch-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <style>{`
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .switch-link { text-align: center; font-size: 13.5px; color: var(--color-ink-soft); margin-top: 20px; }
        .switch-link a { color: var(--color-accent); font-weight: 600; text-decoration: none; }
        @media (max-width: 480px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>
    </AuthLayout>
  );
}
