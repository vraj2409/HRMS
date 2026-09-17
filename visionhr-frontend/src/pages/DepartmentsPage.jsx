import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { departmentsApi } from '../features/employees/employeesApi.js';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';

export default function DepartmentsPage() {
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const departments = departmentsQuery.data || [];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up stagger-children">
        <PageHeader 
          title="Departments" 
          description="Manage organizational departments and their codes."
        />

        <DataTable
          isLoading={departmentsQuery.isLoading}
          data={departments}
          emptyTitle="No departments found"
          columns={[
            {
              header: 'Department',
              render: (d) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 border border-primary-100">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{d.name}</p>
                    <p className="text-xs text-ink-faint">{d.description || 'No description'}</p>
                  </div>
                </div>
              ),
            },
            {
              header: 'Code',
              render: (d) => <span className="font-mono text-sm bg-canvas px-2 py-1 rounded border border-line">{d.code}</span>,
            },
            {
              header: 'Status',
              render: (d) => (
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${d.isActive ? 'bg-primary-50 text-primary-700' : 'bg-rose-50 text-rose-700'}`}>
                  {d.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
