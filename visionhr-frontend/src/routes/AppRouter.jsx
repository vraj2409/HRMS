import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleGuard from './RoleGuard.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import EmployeeDashboardPage from '../pages/EmployeeDashboardPage.jsx';
import HRDashboardPage from '../pages/HRDashboardPage.jsx';
import EmployeeDirectoryPage from '../pages/EmployeeDirectoryPage.jsx';
import EmployeeProfilePage from '../pages/EmployeeProfilePage.jsx';
import LeaveApplyPage from '../pages/LeaveApplyPage.jsx';
import MyLeavesPage from '../pages/MyLeavesPage.jsx';
import LeaveApprovalsPage from '../pages/LeaveApprovalsPage.jsx';
import MyPayslipsPage from '../pages/MyPayslipsPage.jsx';
import PayrollManagementPage from '../pages/PayrollManagementPage.jsx';
import OnboardEmployeePage from '../pages/OnboardEmployeePage.jsx';
import ChangePasswordPage from '../pages/ChangePasswordPage.jsx';
import DepartmentsPage from '../pages/DepartmentsPage.jsx';

const HR_ROLES = ['SuperAdmin', 'HR', 'Manager'];
const ADMIN_ROLES = ['SuperAdmin', 'HR'];

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Main */}
          <Route path="/" element={<EmployeeDashboardPage />} />
          <Route path="/directory" element={<EmployeeDirectoryPage />} />
          <Route path="/directory/:id" element={<EmployeeProfilePage />} />
          <Route path="/profile" element={<EmployeeProfilePage />} />

          {/* Self Service */}
          <Route path="/leave/apply" element={<LeaveApplyPage />} />
          <Route path="/leave/my" element={<MyLeavesPage />} />
          <Route path="/payroll/my" element={<MyPayslipsPage />} />
          <Route path="/settings/password" element={<ChangePasswordPage />} />

          {/* HR / Manager Approvals */}
          <Route element={<RoleGuard allow={HR_ROLES} />}>
            <Route path="/hr" element={<HRDashboardPage />} />
            <Route path="/leave/approvals" element={<LeaveApprovalsPage />} />
          </Route>

          {/* Core HR Management */}
          <Route element={<RoleGuard allow={ADMIN_ROLES} />}>
            <Route path="/employees/new" element={<OnboardEmployeePage />} />
            <Route path="/payroll" element={<PayrollManagementPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
