import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../features/auth/authApi.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import PageHeader from '../components/common/PageHeader.jsx';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up">
        <PageHeader 
          title="Security Settings" 
          description="Update your account password." 
        />

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Current Password"
              type="password"
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
            <div className="border-t border-line pt-5 space-y-5">
              <Input
                label="New Password"
                type="password"
                required
                helperText="Must be at least 6 characters."
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" loading={changePasswordMutation.isPending}>
                <KeyRound className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
