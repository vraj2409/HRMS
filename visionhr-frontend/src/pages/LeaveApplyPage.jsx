import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';
import { leaveApi } from '../features/leave/leaveApi.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import Button from '../components/common/Button.jsx';
import PageHeader from '../components/common/PageHeader.jsx';

export default function LeaveApplyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
  });

  const applyMutation = useMutation({
    mutationFn: leaveApi.apply,
    onSuccess: () => {
      toast.success('Leave application submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['me'] }); // Refresh balances
      navigate('/leave/my');
    },
    onError: (err) => {
      const data = err.response?.data;
      // Show field-level validation errors if available
      if (data?.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        toast.error(firstError || data.message || 'Validation failed.');
      } else {
        toast.error(data?.message || 'Failed to submit leave application.');
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalEndDate = form.isHalfDay ? form.startDate : form.endDate;
    if (!form.startDate || !finalEndDate) {
      toast.error('Please select both start and end dates.');
      return;
    }
    applyMutation.mutate({ ...form, endDate: finalEndDate });
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up">
        <PageHeader 
          title="Apply for Leave" 
          description="Submit a new time-off request for manager approval." 
        />

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Leave Type"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                required
                options={[
                  { label: 'Casual Leave (CL)', value: 'Casual' },
                  { label: 'Sick Leave (SL)', value: 'Sick' },
                  { label: 'Earned Leave (EL)', value: 'Earned' },
                ]}
              />

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isHalfDay}
                    onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })}
                    className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500"
                  />
                  Request Half Day
                </label>
              </div>

              <Input
                type="date"
                label="Start Date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />

              <Input
                type="date"
                label={form.isHalfDay ? 'End Date (Same as Start)' : 'End Date'}
                required
                disabled={form.isHalfDay}
                value={form.isHalfDay ? form.startDate : form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Reason for Leave <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                minLength={10}
                rows={4}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Please provide a brief reason for your leave request (min. 10 characters)..."
              />
              <p className="mt-1 text-xs text-ink-faint">Minimum 10 characters required.</p>
            </div>

            {form.leaveType === 'Sick' && (
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Sick leave requests exceeding 2 consecutive days require a medical certificate to be submitted to HR upon return.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" loading={applyMutation.isPending}>
                <CalendarDays className="h-4 w-4" /> Submit Application
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
