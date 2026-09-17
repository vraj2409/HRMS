import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutGrid,
  Users,
  User,
  ClipboardCheck,
  CalendarDays,
  Wallet,
  Building2,
  UserPlus,
  KeyRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../features/auth/authApi.js';
import { logoutLocal } from '../../features/auth/authSlice.js';

const HR_ROLES = ['SuperAdmin', 'HR', 'Manager'];
const ADMIN_ROLES = ['SuperAdmin', 'HR'];

export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed regardless
    }
    dispatch(logoutLocal());
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItem = (to, label, Icon, end = false) => (
    <NavLink
      to={to}
      end={end}
      onClick={closeSidebar}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? 'bg-primary-50 text-primary-600 shadow-sm'
            : 'text-ink-soft hover:bg-canvas hover:text-ink'
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-40" />
    </NavLink>
  );

  const sectionLabel = (text) => (
    <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-faint/70 first:mt-0">
      {text}
    </p>
  );

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-white shadow-sm">
          VH
        </div>
        <div>
          <span className="text-sm font-semibold text-ink">VisionHR</span>
          <p className="text-[10px] text-ink-faint">HR Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {sectionLabel('Main')}
        {navItem('/', 'Dashboard', LayoutGrid, true)}
        {navItem('/directory', 'Directory', Users)}

        {sectionLabel('Self Service')}
        {navItem('/profile', 'My Profile', User)}
        {navItem('/leave/apply', 'Apply Leave', CalendarDays)}
        {navItem('/leave/my', 'My Leaves', CalendarDays)}
        {navItem('/payroll/my', 'My Payslips', Wallet)}
        {navItem('/settings/password', 'Change Password', KeyRound)}

        {user && HR_ROLES.includes(user.role) && (
          <>
            {sectionLabel('Administration')}
            {navItem('/hr', 'Attendance Approvals', ClipboardCheck)}
            {navItem('/leave/approvals', 'Leave Approvals', CalendarDays)}
          </>
        )}

        {user && ADMIN_ROLES.includes(user.role) && (
          <>
            {sectionLabel('Management')}
            {navItem('/employees/new', 'Onboard Employee', UserPlus)}
            {navItem('/payroll', 'Payroll', Wallet)}
            {navItem('/departments', 'Departments', Building2)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user?.fullName || user?.email}
            </p>
            <p className="truncate text-[11px] text-ink-faint">
              {user?.designation ? `${user.designation} · ` : ''}
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-overlay lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — desktop: fixed, mobile: slide-over */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <button
          onClick={closeSidebar}
          className="absolute right-3 top-4 rounded-md p-1 text-ink-faint hover:text-ink lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-ink-soft hover:bg-canvas"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500 text-[10px] font-bold text-white">
            VH
          </div>
          <span className="text-sm font-semibold text-ink">VisionHR</span>
        </header>

        <main className="flex-1 bg-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
