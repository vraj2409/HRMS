/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  Users, 
  Home, 
  Hourglass, 
  Award, 
  Briefcase, 
  UserSquare2, 
  User, 
  FolderLock, 
  Palmtree, 
  ShieldCheck, 
  LogOut, 
  ShieldAlert,
  X 
} from 'lucide-react';
import { Employee } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  portalMode: 'Employee' | 'HR';
  setPortalMode: (mode: 'Employee' | 'HR') => void;
  employee: Employee;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  portalMode,
  setPortalMode,
  employee,
  onLogout,
  isOpen = false,
  onClose
}: SidebarProps) {

  // Menu items config with literal names from screenshots
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Report', icon: Clock },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'other-leaves', label: 'Other Employees Leave', icon: Users },
    { id: 'wfh', label: 'WFH Management', icon: Home },
    { id: 'ot', label: 'OT Management', icon: Hourglass },
    { id: 'performance', label: 'Performance Review', icon: Award },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'interviews', label: 'Interviews', icon: UserSquare2 },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'documents', label: 'My Documents', icon: FolderLock },
    { id: 'holidays', label: 'Company Holidays', icon: Palmtree },
    { id: 'policy', label: 'Company Policy', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div 
        onClick={onClose} 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1E2038] border-r border-[#AAC4FF]/20 flex flex-col h-screen z-50 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:flex ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } shadow-xl`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#AAC4FF]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#B1B2FF] flex items-center justify-center text-slate-900 font-bold text-sm shadow-sm flex-shrink-0">
              <Building2 className="w-4.5 h-4.5 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">OriginEdge</h1>
              <span className="text-[10px] text-slate-100/70 tracking-wider uppercase font-bold block mt-0.5 leading-none">Technologies</span>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      {/* Portal Swapper (Employee vs HR Portal) */}
      <div className="px-4 py-3 border-b border-[#AAC4FF]/20">
        <div className="flex bg-slate-950/40 p-1 rounded-xl">
          <button
            onClick={() => setPortalMode('Employee')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              portalMode === 'Employee'
                ? 'bg-[#B1B2FF] text-slate-900 shadow-xs font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Employee
          </button>
          <button
            onClick={() => {
              if (employee.role === 'HR') {
                setPortalMode('HR');
              }
            }}
            disabled={employee.role !== 'HR'}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
              portalMode === 'HR'
                ? 'bg-[#B1B2FF] text-slate-900 shadow-xs font-bold'
                : employee.role === 'HR'
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-white/40 cursor-not-allowed'
            }`}
            title={employee.role !== 'HR' ? 'Requires HR Permissions' : 'Switch to HR Admin Dashboard'}
          >
            HR Portal
            {employee.role !== 'HR' && (
              <ShieldAlert className="w-3 h-3 text-white/40" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Options Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <span className="px-3 text-[10px] font-bold text-slate-350/90 tracking-widest uppercase block mb-2">
          {portalMode === 'HR' ? 'ADMIN CONSOLE' : 'MY DASHBOARD'}
        </span>
        
        {portalMode === 'HR' ? (
          // Admin HR shortcuts
          <div className="space-y-1 mb-4">
            <button
              onClick={() => setCurrentTab('hr-employees')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'hr-employees'
                  ? 'bg-[#B1B2FF]/20 text-[#B1B2FF] border-r-4 border-[#B1B2FF]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Employee Directory
            </button>
            <button
              onClick={() => setCurrentTab('hr-attendance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'hr-attendance'
                  ? 'bg-[#B1B2FF]/20 text-[#B1B2FF] border-r-4 border-[#B1B2FF]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Direct Attendance Sheet
            </button>
            <button
              onClick={() => setCurrentTab('hr-leaves')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'hr-leaves'
                  ? 'bg-[#B1B2FF]/20 text-[#B1B2FF] border-r-4 border-[#B1B2FF]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Leaves Verification ({portalMode})
            </button>
            <button
              onClick={() => setCurrentTab('hr-interviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'hr-interviews'
                  ? 'bg-[#B1B2FF]/20 text-[#B1B2FF] border-r-4 border-[#B1B2FF]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <UserSquare2 className="w-4 h-4" />
              Recruitment Center
            </button>
            <button
              onClick={() => setCurrentTab('hr-performance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'hr-performance'
                  ? 'bg-[#B1B2FF]/20 text-[#B1B2FF] border-r-4 border-[#B1B2FF]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Review Management
            </button>
            {/* Divider */}
            <div className="h-px bg-[#AAC4FF]/20 my-4"></div>
            <span className="px-3 text-[10px] font-bold text-slate-350/95 tracking-widest uppercase block mb-1">
              Switch back to standard links
            </span>
          </div>
        ) : null}

        {/* Standard sidebar links */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id && portalMode === 'Employee';
          return (
            <button
              key={item.id}
              onClick={() => {
                setPortalMode('Employee');
                setCurrentTab(item.id);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#B1B2FF]/20 text-[#B1B2FF] border-r-4 border-[#B1B2FF]'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#B1B2FF]' : 'text-white/85'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Footer context */}
      <div className="p-4 border-t border-[#AAC4FF]/20 bg-slate-950/20">
        <div className="flex items-center bg-[#AAC4FF]/10 p-3 rounded-lg mb-3 border border-[#AAC4FF]/10">
          <div className="w-8 h-8 rounded-full bg-[#B1B2FF] border border-white/25 flex items-center justify-center font-bold text-xs text-slate-900 uppercase flex-shrink-0">
            {employee.avatar ? (
              <img src={employee.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              employee.name.split(' ').map((n: string) => n[0]).join('')
            )}
          </div>
          <div className="ml-3 overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate leading-tight">{employee.name}</h4>
            <span className="text-[10px] text-white/70 uppercase truncate block mt-0.5 font-bold tracking-wide">{employee.title}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 border border-white/20 hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/40 text-xs font-semibold rounded-lg text-white/80 transition-all bg-white/5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
      </aside>
    </>
  );
}
