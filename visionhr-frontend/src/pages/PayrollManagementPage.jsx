import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, CheckCircle2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollApi } from '../features/payroll/payrollApi.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Select from '../components/common/Select.jsx';
import Card from '../components/common/Card.jsx';

export default function PayrollManagementPage() {
  const queryClient = useQueryClient();
  const date = new Date();
  
  const defaultMonth = date.getMonth() === 0 ? 12 : date.getMonth();
  const defaultYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();

  const [month, setMonth] = useState(defaultMonth.toString());
  const [year, setYear] = useState(defaultYear.toString());
  
  // Fetch the backend-merged list of employees (isolated to HR's department) and their payroll records
  const payrollListQuery = useQuery({
    queryKey: ['payroll', 'list', month, year],
    queryFn: () => payrollApi.list({ month, year }),
  });

  const processEmployeeMutation = useMutation({
    mutationFn: ({ employeeId }) => payrollApi.processForEmployee(employeeId, { month: parseInt(month), year: parseInt(year) }),
    onSuccess: (data) => {
      toast.success(data.message || 'Payroll processed successfully.');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not process payroll.');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id) => payrollApi.markPaid(id),
    onSuccess: () => {
      toast.success('Salary marked as paid.');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const tableData = payrollListQuery.data || [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="Payroll Processing" 
          description="Manage monthly employee salaries."
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-36"
              options={[
                { label: 'January', value: '1' }, { label: 'February', value: '2' },
                { label: 'March', value: '3' }, { label: 'April', value: '4' },
                { label: 'May', value: '5' }, { label: 'June', value: '6' },
                { label: 'July', value: '7' }, { label: 'August', value: '8' },
                { label: 'September', value: '9' }, { label: 'October', value: '10' },
                { label: 'November', value: '11' }, { label: 'December', value: '12' },
              ]}
            />
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-28"
              options={[
                { label: defaultYear.toString(), value: defaultYear.toString() },
                { label: (defaultYear - 1).toString(), value: (defaultYear - 1).toString() },
              ]}
            />
          </div>
        </div>

        <DataTable
          isLoading={payrollListQuery.isLoading}
          data={tableData}
          emptyTitle="No employees found"
          emptyDescription="There are no active employees to process."
          columns={[
            {
              header: 'Employee Name',
              render: (r) => (
                <div>
                  <p className="font-medium text-ink">
                    {r.personalDetails?.firstName} {r.personalDetails?.lastName}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {r.employeeCode} • {r.organization?.department?.name || 'No Dept'}
                  </p>
                </div>
              ),
            },
            {
              header: 'Base Salary',
              render: (r) => (
                <span className="font-semibold text-ink">
                  {formatCurrency((r.salary?.basicSalary || 0) + (r.salary?.hra || 0) + (r.salary?.otherAllowances || 0))}
                </span>
              ),
            },
            {
              header: 'Status',
              render: (r) => (
                r.payrollRecord ? (
                  <Badge tone={r.payrollRecord.status === 'Paid' ? 'primary' : 'amber'}>
                    {r.payrollRecord.status}
                  </Badge>
                ) : (
                  <Badge tone="slate">Pending Processing</Badge>
                )
              ),
            },
            {
              header: 'Net Payable',
              render: (r) => (
                r.payrollRecord ? (
                  <span className="font-semibold text-primary-700">
                    {formatCurrency(r.payrollRecord.netSalary)}
                  </span>
                ) : (
                  <span className="text-ink-faint">—</span>
                )
              ),
            },
            {
              header: 'Action',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (r) => {
                if (!r.payrollRecord) {
                  return (
                    <Button
                      size="sm"
                      onClick={() => processEmployeeMutation.mutate({ employeeId: r._id })}
                      loading={processEmployeeMutation.isPending && processEmployeeMutation.variables?.employeeId === r._id}
                    >
                      <Play className="h-4 w-4 mr-1" /> Process
                    </Button>
                  );
                }
                
                return (
                  <div className="flex justify-end gap-2">
                    {r.payrollRecord.status === 'Processed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={markPaidMutation.isPending && markPaidMutation.variables === r.payrollRecord._id}
                        onClick={() => markPaidMutation.mutate(r.payrollRecord._id)}
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary-600 mr-1" /> Mark Paid
                      </Button>
                    )}
                    {r.payrollRecord.payslipS3Key && (
                       <Button size="sm" variant="ghost" className="text-primary-600">
                         <FileText className="h-4 w-4 mr-1" /> PDF Generated
                       </Button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
