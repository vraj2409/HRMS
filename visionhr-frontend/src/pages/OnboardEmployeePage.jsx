import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeesApi, departmentsApi } from '../features/employees/employeesApi.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import Button from '../components/common/Button.jsx';
import PageHeader from '../components/common/PageHeader.jsx';

export default function OnboardEmployeePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'Employee',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    departmentId: '',
    designation: '',
    employmentType: 'Full-Time',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: '',
    hra: '',
    otherAllowances: '',
  });

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => employeesApi.create(payload),
    onSuccess: (data) => {
      toast.success(`Employee created successfully! Code: ${data.employeeCode}`);
      navigate('/directory');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create employee.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct nested payload structure required by backend
    const payload = {
      user: {
        email: form.email,
        password: form.password,
        role: form.role,
      },
      personalDetails: {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      },
      organization: {
        department: form.departmentId,
        designation: form.designation,
        employmentType: form.employmentType,
        joiningDate: form.joiningDate,
      },
      salary: {
        basicSalary: Number(form.basicSalary),
        hra: Number(form.hra),
        otherAllowances: Number(form.otherAllowances),
      }
    };

    createMutation.mutate(payload);
  };

  const deptOptions = (departmentsQuery.data || []).map((d) => ({
    label: d.name,
    value: d._id,
  }));

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up">
        <PageHeader 
          title="Onboard New Employee" 
          description="Create a new employee profile and system account." 
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Account Credentials</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Input label="Email" type="email" name="email" required value={form.email} onChange={handleChange} />
              <Input label="Temporary Password" type="text" name="password" required value={form.password} onChange={handleChange} />
              <Select label="System Role" name="role" required value={form.role} onChange={handleChange} options={[
                { label: 'Employee', value: 'Employee' },
                { label: 'Manager', value: 'Manager' },
                { label: 'HR', value: 'HR' },
                { label: 'SuperAdmin', value: 'SuperAdmin' },
              ]} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Personal Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" name="firstName" required value={form.firstName} onChange={handleChange} />
              <Input label="Last Name" name="lastName" required value={form.lastName} onChange={handleChange} />
              <Input label="Date of Birth" type="date" name="dateOfBirth" required value={form.dateOfBirth} onChange={handleChange} />
              <Input label="Phone Number" name="phone" required value={form.phone} onChange={handleChange} />
            </div>
            
            <h3 className="text-sm font-medium text-ink-soft mt-6 mb-3">Address</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2"><Input label="Street" name="street" value={form.street} onChange={handleChange} /></div>
              <Input label="City" name="city" value={form.city} onChange={handleChange} />
              <Input label="State" name="state" value={form.state} onChange={handleChange} />
              <Input label="Zip Code" name="zipCode" value={form.zipCode} onChange={handleChange} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Organization & Payroll</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Department" name="departmentId" required value={form.departmentId} onChange={handleChange} options={[{ label: 'Select Department...', value: '' }, ...deptOptions]} disabled={departmentsQuery.isLoading} />
              <Input label="Designation" name="designation" required value={form.designation} onChange={handleChange} />
              <Select label="Employment Type" name="employmentType" required value={form.employmentType} onChange={handleChange} options={[
                { label: 'Full-Time', value: 'Full-Time' },
                { label: 'Part-Time', value: 'Part-Time' },
                { label: 'Contract', value: 'Contract' },
                { label: 'Intern', value: 'Intern' },
              ]} />
              <Input label="Joining Date" type="date" name="joiningDate" required value={form.joiningDate} onChange={handleChange} />
            </div>

            <h3 className="text-sm font-medium text-ink-soft mt-6 mb-3">Monthly Compensation (INR)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Basic Salary" type="number" name="basicSalary" required value={form.basicSalary} onChange={handleChange} min="0" />
              <Input label="HRA" type="number" name="hra" required value={form.hra} onChange={handleChange} min="0" />
              <Input label="Other Allowances" type="number" name="otherAllowances" required value={form.otherAllowances} onChange={handleChange} min="0" />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate('/directory')}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              <UserPlus className="h-4 w-4" /> Create Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
