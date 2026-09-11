import { useEffect, useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../services/userService';
import { extractErrorMessage } from '../services/api';

export default function Profile() {
  const { updateUserLocal } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName, lastName: data.lastName,
        phoneNumber: data.phoneNumber || '', careerField: data.careerField || '',
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      updateUserLocal(updated);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (error && !profile) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: 32 }}><ErrorMessage message={error} onRetry={load} /></div>
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Loading your profile..." />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container profile-page">
        <h1>Your profile</h1>

        <div className="profile-card">
          <div className="profile-readonly">
            <div>
              <span className="ro-label">Email</span>
              <span className="ro-value">{profile.email}</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="grid-2">
              <Input label="First name" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Last name" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <Input label="Phone number" value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            <Input label="Career / field" value={form.careerField}
              onChange={(e) => setForm({ ...form, careerField: e.target.value })} />

            {error && <ErrorMessage message={error} />}
            {success && <p className="success-text">{success}</p>}

            <div className="profile-actions">
              <Button type="submit" icon={Save} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              <Button type="button" variant="secondary" icon={KeyRound} onClick={() => setShowPasswordModal(true)}>
                Change password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      <style>{`
        .profile-page { padding: 32px 24px 60px; max-width: 640px; display: flex; flex-direction: column; gap: 20px; }
        .profile-card {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .profile-readonly { border-bottom: 1px solid var(--color-border); padding-bottom: 16px; }
        .ro-label { display: block; font-size: 12px; color: var(--color-ink-faint); font-weight: 600; }
        .ro-value { display: block; font-size: 15px; font-weight: 600; margin-top: 2px; }
        .profile-form { display: flex; flex-direction: column; gap: 4px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .profile-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
        .success-text { color: var(--color-success); font-size: 13.5px; font-weight: 600; }
        @media (max-width: 480px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.newPassword !== form.confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(form);
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Change password" onClose={onClose}>
      {success ? (
        <p>Your password has been changed successfully.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input label="Current password" type="password" value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
          <Input label="New password" type="password" value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            hint="At least 8 characters, one uppercase, one lowercase, one number" required />
          <Input label="Confirm new password" type="password" value={form.confirmNewPassword}
            onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })} required />
          {error && <ErrorMessage message={error} />}
          <Button type="submit" full disabled={loading}>{loading ? 'Updating...' : 'Update password'}</Button>
        </form>
      )}
    </Modal>
  );
}
