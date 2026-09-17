import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, CalendarDays, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { leaveApi } from '../features/leave/leaveApi.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';
import { formatDate } from '../utils/date.js';

export default function LeaveApprovalsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [remarksModal, setRemarksModal] = useState({ isOpen: false, id: null, status: null, remarks: '' });

  const leavesQuery = useQuery({
    queryKey: ['leaves', 'all', statusFilter],
    queryFn: () => leaveApi.all({ status: statusFilter, limit: 50 }),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, status, remarks }) => leaveApi.action(id, status, remarks),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === 'Approved' ? 'Leave approved.' : 'Leave rejected.');
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all'] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not update leave status.');
      closeModal();
    },
  });

  const handleActionClick = (id, status) => {
    setRemarksModal({ isOpen: true, id, status, remarks: '' });
  };

  const closeModal = () => {
    setRemarksModal({ isOpen: false, id: null, status: null, remarks: '' });
  };

  const confirmAction = (e) => {
    e.preventDefault();
    actionMutation.mutate({
      id: remarksModal.id,
      status: remarksModal.status,
      remarks: remarksModal.remarks,
    });
  };

  const records = leavesQuery.data?.data || [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="Leave Approvals" 
          description="Review employee time-off requests."
        />

        {/* Tab Filters */}
        <div className="mb-6 flex gap-2 border-b border-line overflow-x-auto pb-1">
          {['Pending', 'Approved', 'Rejected', 'All'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'All' ? '' : status)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                (statusFilter === status || (status === 'All' && statusFilter === ''))
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-ink-soft hover:text-ink hover:bg-canvas rounded-t-lg'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <DataTable
          isLoading={leavesQuery.isLoading}
          data={records}
          emptyTitle="No records found"
          emptyDescription={`There are no ${statusFilter.toLowerCase()} leave requests.`}
          columns={[
            {
              header: 'Employee',
              render: (r) => (
                <div>
                  <p className="font-medium text-ink">
                    {r.employee?.personalDetails?.firstName} {r.employee?.personalDetails?.lastName}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {r.employee?.organization?.department?.name}
                  </p>
                </div>
              ),
            },
            {
              header: 'Dates',
              render: (r) => (
                <div className="text-sm">
                  <span className="font-medium text-ink">{formatDate(r.startDate)}</span>
                  {r.startDate !== r.endDate && <span className="text-ink-soft"> to {formatDate(r.endDate)}</span>}
                  <div className="mt-0.5 text-xs text-ink-faint">
                    {r.appliedDays} day(s) {r.isHalfDay ? '(Half)' : ''} · <span className="capitalize">{r.leaveType}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Reason',
              render: (r) => (
                <p className="max-w-xs truncate text-xs text-ink-soft" title={r.reason}>
                  {r.reason}
                </p>
              ),
            },
            {
              header: 'Status',
              render: (r) => <Badge tone={r.status}>{r.status}</Badge>,
            },
            {
              header: '',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (r) => {
                if (r.status !== 'Pending') return null;
                const pending = actionMutation.isPending && remarksModal.id === r._id;
                
                return (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => handleActionClick(r._id, 'Rejected')}
                    >
                      <X className="h-4 w-4 text-rose-500" />
                    </Button>
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => handleActionClick(r._id, 'Approved')}
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
        title={remarksModal.status === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
      >
        <form onSubmit={confirmAction} className="space-y-4">
          <p className="text-sm text-ink-soft">
            You are about to <strong>{remarksModal.status?.toLowerCase()}</strong> this leave request.
          </p>
          <Input
            label="Manager Remarks (Optional)"
            value={remarksModal.remarks}
            onChange={(e) => setRemarksModal({ ...remarksModal, remarks: e.target.value })}
            placeholder="e.g., Please ensure handover is complete."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={remarksModal.status === 'Approved' ? 'primary' : 'danger'}
              loading={actionMutation.isPending}
            >
              Confirm {remarksModal.status}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
