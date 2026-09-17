import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { leaveApi } from '../features/leave/leaveApi.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import { formatDate } from '../utils/date.js';

export default function MyLeavesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const leavesQuery = useQuery({
    queryKey: ['leaves', 'my', statusFilter],
    queryFn: () => leaveApi.my({ status: statusFilter, limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: leaveApi.cancel,
    onSuccess: () => {
      toast.success('Leave request cancelled.');
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not cancel leave.');
    },
  });

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      cancelMutation.mutate(id);
    }
  };

  const leaves = leavesQuery.data?.data?.requests || [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="My Leave History" 
          description="Track your past and pending time-off requests."
          actions={
            <Button onClick={() => navigate('/leave/apply')}>
              <CalendarDays className="h-4 w-4" /> Apply for Leave
            </Button>
          }
        />

        {/* Tab Filters */}
        <div className="mb-6 flex gap-2 border-b border-line overflow-x-auto pb-1">
          {[
            { label: 'All', value: '' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Cancelled', value: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                statusFilter === tab.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-ink-soft hover:text-ink hover:bg-canvas rounded-t-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DataTable
          isLoading={leavesQuery.isLoading}
          data={leaves}
          emptyTitle="No leaves found"
          emptyDescription="You don't have any leave records matching this filter."
          columns={[
            {
              header: 'Date Range',
              render: (r) => (
                <div>
                  <span className="font-medium text-ink">{formatDate(r.startDate)}</span>
                  {r.startDate !== r.endDate && (
                    <span className="text-ink-soft"> to {formatDate(r.endDate)}</span>
                  )}
                  {r.isHalfDay && <Badge className="ml-2">Half Day</Badge>}
                </div>
              ),
            },
            {
              header: 'Type',
              render: (r) => <span className="capitalize">{r.leaveType}</span>,
            },
            {
              header: 'Days',
              render: (r) => <span className="font-medium">{r.appliedDays}</span>,
            },
            {
              header: 'Status',
              render: (r) => <Badge tone={r.status}>{r.status}</Badge>,
            },
            {
              header: 'Applied On',
              render: (r) => <span className="text-xs text-ink-faint">{formatDate(r.createdAt)}</span>,
            },
            {
              header: '',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (r) => (
                r.status === 'Pending' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    loading={cancelMutation.isPending && cancelMutation.variables === r._id}
                    onClick={() => handleCancel(r._id)}
                  >
                    <XCircle className="h-4 w-4" /> Cancel
                  </Button>
                )
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
