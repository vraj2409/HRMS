import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { employeesApi } from '../features/employees/employeesApi.js';
import Button from '../components/common/Button.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';

export default function EmployeeDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  
  // Only HR/SuperAdmin can add employees
  const canAdd = ['HR', 'SuperAdmin'].includes(user?.role);

  const directoryQuery = useQuery({
    queryKey: ['employees', search],
    queryFn: () => employeesApi.list({ search, limit: 50 }),
  });

  const employees = directoryQuery.data?.data || [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="Employee Directory" 
          description={`Showing ${directoryQuery.data?.pagination?.totalItems ?? 0} active team members in the organization.`}
          actions={
            canAdd && (
              <Button onClick={() => navigate('/employees/new')}>
                <UserPlus className="h-4 w-4" /> Onboard Employee
              </Button>
            )
          }
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or department..."
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
            />
          </div>
        </div>

        <DataTable
          isLoading={directoryQuery.isLoading}
          data={employees}
          onRowClick={(emp) => navigate(`/directory/${emp._id}`)}
          emptyTitle="No employees found"
          emptyDescription={search ? `No results match "${search}".` : "There are no employees in the directory."}
          columns={[
            {
              header: 'Employee',
              render: (emp) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600 border border-primary-100">
                    {emp.personalDetails?.firstName?.[0]}{emp.personalDetails?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {emp.personalDetails?.firstName} {emp.personalDetails?.lastName}
                    </p>
                    <p className="text-xs text-ink-faint">{emp.employeeCode}</p>
                  </div>
                </div>
              ),
            },
            {
              header: 'Department',
              render: (emp) => (
                <span className="inline-flex items-center rounded-md bg-canvas px-2 py-1 text-xs font-medium text-ink-soft border border-line">
                  {emp.organization?.department?.name || 'Unassigned'}
                </span>
              ),
            },
            {
              header: 'Designation',
              render: (emp) => <span className="text-sm">{emp.organization?.designation || '—'}</span>,
            },
            {
              header: 'Contact',
              render: (emp) => (
                <div className="text-xs">
                  <p className="text-ink-soft">{emp.userId?.email}</p>
                  <p className="text-ink-faint mt-0.5">{emp.personalDetails?.phone || '—'}</p>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
