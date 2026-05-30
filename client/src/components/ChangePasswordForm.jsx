import { useState } from 'react';
import { getToken } from "../utils/auth";

export default function ChangePasswordForm({ onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) return 'All fields are required.';
    if (newPassword !== confirmPassword) return 'New passwords do not match.';
    if (newPassword.length < 6) return 'Password must be at least 6 characters.';
    if (!/[a-zA-Z]/.test(newPassword) || !/[\d\W]/.test(newPassword))
      return 'Password must contain at least one letter and one number or special character.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      if (onSuccess) onSuccess();
      alert('Password changed successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Current Password
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white"
        />
      </div>
      <div className="pt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-all"
        >
          {loading ? 'Saving…' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
