import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceApi } from '../features/attendance/attendanceApi.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';
import { formatDate, formatTime } from '../utils/date.js';

export default function HRDashboardPage() {
  const queryClient = useQueryClient();
  const [remarksModal, setRemarksModal] = useState({ isOpen: false, id: null, status: null, remarks: '' });

  const summaryQuery = useQuery({
    queryKey: ['attendance', 'today-summary'],
    queryFn: attendanceApi.todaySummary,
  });

  const pendingQuery = useQuery({
    queryKey: ['attendance', 'pending'],
    queryFn: () => attendanceApi.pendingApprovals({ limit: 50 }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, remarks }) => attendanceApi.review(id, status, remarks),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === 'Approved' ? 'Attendance approved.' : 'Attendance rejected.');
      queryClient.invalidateQueries({ queryKey: ['attendance', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today-summary'] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not update this record.');
      closeModal();
    },
  });

  const handleReviewClick = (id, status) => {
    // Open modal to get remarks before submitting
    setRemarksModal({ isOpen: true, id, status, remarks: '' });
  };

  const closeModal = () => {
    setRemarksModal({ isOpen: false, id: null, status: null, remarks: '' });
  };

  const confirmReview = (e) => {
    e.preventDefault();
    reviewMutation.mutate({
      id: remarksModal.id,
      status: remarksModal.status,
      remarks: remarksModal.remarks,
    });
  };

  const records = pendingQuery.data?.data || [];
  const summary = summaryQuery.data;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="Attendance Approvals" 
          description="Review and action today's pending punches and attendance discrepancies." 
        />

        {summary && (
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryTile 
              title="Active Workforce" 
              value={summary.totalActiveEmployees} 
              icon={Users}
              tone="primary" 
            />
            <SummaryTile 
              title="Punched Today" 
              value={summary.totalPunches} 
              icon={CheckCircle2}
              tone="primary" 
            />
            <SummaryTile 
              title="Pending Review" 
              value={summary.pending} 
              icon={Clock}
              tone="amber" 
            />
            <SummaryTile 
              title="Not Punched In" 
              value={summary.notPunchedIn} 
              icon={AlertCircle}
              tone="rose" 
            />
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
            Pending Queue
          </h2>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
            {records.length} requiring action
          </span>
        </div>

        <DataTable
          isLoading={pendingQuery.isLoading}
          data={records}
          emptyTitle="Inbox Zero"
          emptyDescription="All caught up — no attendance records waiting for review."
          columns={[
            {
              header: 'Employee',
              render: (r) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
                    {r.employee?.personalDetails?.firstName?.[0]}{r.employee?.personalDetails?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {r.employee?.personalDetails?.firstName} {r.employee?.personalDetails?.lastName}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {r.employee?.employeeCode} · {r.employee?.organization?.department?.name}
                    </p>
                  </div>
                </div>
              ),
            },
            { header: 'Date', render: (r) => formatDate(r.date) },
            { header: 'In', render: (r) => formatTime(r.punchIn?.timestamp) },
            { header: 'Out', render: (r) => formatTime(r.punchOut?.timestamp) },
            {
              header: '',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (r) => {
                const pending = reviewMutation.isPending && remarksModal.id === r._id;
                return (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={(e) => { e.stopPropagation(); handleReviewClick(r._id, 'Rejected'); }}
                    >
                      <X className="h-4 w-4 text-rose-500" />
                    </Button>
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={(e) => { e.stopPropagation(); handleReviewClick(r._id, 'Approved'); }}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      <Modal
        isOpen={remarksModal.isOpen}
        onClose={closeModal}
        title={remarksModal.status === 'Approved' ? 'Approve Attendance' : 'Reject Attendance'}
      >
        <form onSubmit={confirmReview} className="space-y-4">
          <p className="text-sm text-ink-soft">
            You are about to <strong>{remarksModal.status?.toLowerCase()}</strong> this attendance record.
            You can optionally provide remarks explaining this action.
          </p>
          <Input
            label="Remarks (Optional)"
            value={remarksModal.remarks}
            onChange={(e) => setRemarksModal({ ...remarksModal, remarks: e.target.value })}
            placeholder="e.g., Forgot to punch out, verified with manager."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={remarksModal.status === 'Approved' ? 'primary' : 'danger'}
              loading={reviewMutation.isPending}
            >
              Confirm {remarksModal.status}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SummaryTile({ title, value, icon: Icon, tone }) {
  const tones = {
    primary: 'text-primary-600 bg-primary-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50',
  };

  return (
    <Card className="flex items-center gap-4 p-5 card-hover">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-soft">{title}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value ?? '—'}</p>
      </div>
    </Card>
  );
}
