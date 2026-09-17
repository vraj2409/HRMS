import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, Wallet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollApi } from '../features/payroll/payrollApi.js';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Select from '../components/common/Select.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function MyPayslipsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());

  const payslipsQuery = useQuery({
    queryKey: ['payroll', 'my', year],
    queryFn: () => payrollApi.my({ year }),
  });

  const payslips = payslipsQuery.data?.data || [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="My Payslips" 
          description="View and download your monthly salary statements."
        />

        <div className="mb-6 flex items-center justify-between">
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-32"
            options={[
              { label: currentYear.toString(), value: currentYear.toString() },
              { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
              { label: (currentYear - 2).toString(), value: (currentYear - 2).toString() },
            ]}
          />
        </div>

        {payslipsQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : payslips.length === 0 ? (
          <Card className="p-12">
            <EmptyState 
              title="No payslips found" 
              description={`There are no generated payslips for the year ${year}.`} 
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {payslips.map((slip) => (
              <PayslipCard key={slip._id} slip={slip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PayslipCard({ slip }) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return (
    <Card className="card-hover flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-canvas/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">{monthNames[slip.month - 1]} {slip.year}</h3>
            <Badge tone={slip.status}>{slip.status}</Badge>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">Net Salary</span>
          <span className="text-lg font-bold text-ink">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(slip.netSalary)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 text-xs">
          <div>
            <span className="block text-ink-faint">Payable Days</span>
            <span className="mt-0.5 block font-medium text-ink">{slip.payableDays} / {slip.totalWorkingDays}</span>
          </div>
          <div>
            <span className="block text-ink-faint">Gross Earnings</span>
            <span className="mt-0.5 block font-medium text-ink">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(slip.earnings.grossEarnings)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-line p-3">
        <DownloadButton slip={slip} />
      </div>
    </Card>
  );
}

function DownloadButton({ slip }) {
  const downloadMutation = useMutation({
    mutationFn: (id) => payrollApi.downloadPayslip(id),
    onSuccess: (data) => {
      window.open(data.url, '_blank');
      toast.success('Opening secure document link.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not download payslip.');
    }
  });

  return (
    <button 
      disabled={!slip.payslipS3Key || downloadMutation.isPending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-surface px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => downloadMutation.mutate(slip._id)}
    >
      <Download className="h-4 w-4" /> 
      {downloadMutation.isPending ? 'Generating...' : 'Download PDF'}
    </button>
  );
}
