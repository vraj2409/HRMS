/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Lock, Mail, Users, ArrowRight, ShieldCheck, 
  LogOut, Shield, User, HelpCircle, Bell, Clock, Menu 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import AttendanceTab from './components/AttendanceTab';
import LeaveTab from './components/LeaveTab';
import ProfileTab from './components/ProfileTab';
import DocumentsTab from './components/DocumentsTab';
import HolidaysTab from './components/HolidaysTab';
import PoliciesTab from './components/PoliciesTab';
import HRPortalTabs from './components/HRPortalTabs';
import OtherLeavesTab from './components/OtherLeavesTab';
import WFHTab from './components/WFHTab';
import OTTab from './components/OTTab';
import PerformanceTab from './components/PerformanceTab';
import ApplicationsTab from './components/ApplicationsTab';
import InterviewsTab from './components/InterviewsTab';
import { Employee, Attendance } from './types';
import { api } from './lib/api';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hrms_token'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123'); // pre-seed password
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Structural Navigation State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [portalMode, setPortalMode] = useState<'Employee' | 'HR'>('Employee');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live Attendance State
  const [attendanceToday, setAttendanceToday] = useState<Attendance | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Preset quick accounts matching 1 HR and 5 genuine Employees exactly
  const presets = [
    { name: 'Sarah Wilson', email: 'sarah.wilson@originedge.com', desc: 'HR Executive (Admin Access)' },
    { name: 'John Doe', email: 'john.doe@originedge.com', desc: 'Senior Team Lead (Engineering)' },
    { name: 'Michael Brown', email: 'michael.brown@originedge.com', desc: 'UI/UX Designer (Design)' },
    { name: 'Emily Johnson', email: 'emily.johnson@originedge.com', desc: 'Project Manager (Engineering)' },
    { name: 'David Lee', email: 'david.lee@originedge.com', desc: 'Business Analyst (Business)' },
    { name: 'Jessica Taylor', email: 'jessica.taylor@originedge.com', desc: 'QA Engineer (Testing)' }
  ];

  // Token initialization
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Notifications loader
  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(setNotifications)
        .catch(console.error);
    }
  }, [user, refreshTrigger]);

  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const data = await api.getMe();
      setUser(data);
      // Automatically toggle portal mode match role
      if (data.role === 'HR') {
        setPortalMode('HR');
        setCurrentTab('hr-employees');
      } else {
        setPortalMode('Employee');
        setCurrentTab('dashboard');
      }
      // Fetch user attendance today
      loadAttendanceToday(data.id);
    } catch (err: any) {
      console.error(err.message);
      // Clean stale tokens
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceToday = async (employeeId: string) => {
    try {
      const history = await api.getAttendance();
      setAttendanceHistory(history);
      
      const todayStr = new Date().toISOString().split('T')[0]; // Live current system date
      const match = history.find(a => a.employeeId === employeeId && a.date === todayStr);
      setAttendanceToday(match || null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Please enter a valid company email address.');
      return;
    }

    setAuthenticating(true);
    try {
      const res = await api.login(loginEmail.toLowerCase().trim(), loginPassword);
      localStorage.setItem('hrms_token', res.token);
      setToken(res.token);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication rejected. Verify credentials.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handlePresetLogin = async (email: string) => {
    setLoginError('');
    setAuthenticating(true);
    try {
      const res = await api.login(email, 'password123');
      localStorage.setItem('hrms_token', res.token);
      setToken(res.token);
    } catch (err: any) {
      setLoginError(err.message || 'Preset authentication failed.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hrms_token');
    setToken(null);
    setUser(null);
    setAttendanceToday(null);
    setPortalMode('Employee');
    setCurrentTab('dashboard');
  };

  // Clock in handler
  const handleClockIn = async () => {
    if (!user) return;
    try {
      const punch = await api.clockIn();
      setAttendanceToday(punch);
      setRefreshTrigger(prev => prev + 1); // trigger notifier update
      // Reload lists
      await loadAttendanceToday(user.id);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Clock out handler
  const handleClockOut = async () => {
    if (!user) return;
    try {
      const punch = await api.clockOut();
      setAttendanceToday(punch);
      setRefreshTrigger(prev => prev + 1); // trigger notifier update
      // Reload lists
      await loadAttendanceToday(user.id);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Reset attendance handler (Testing helper)
  const handleResetAttendance = async () => {
    if (!user) return;
    try {
      await api.resetAttendance();
      setAttendanceToday(null);
      setRefreshTrigger(prev => prev + 1);
      await loadAttendanceToday(user.id);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Switch Portal Mode
  const handleTogglePortal = (mode: 'Employee' | 'HR') => {
    setPortalMode(mode);
    if (mode === 'HR') {
      setCurrentTab('hr-employees');
    } else {
      setCurrentTab('dashboard');
    }
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {/* Main login grid */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left panel branding column (Lavender & Periwinkle Theme) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#1E2038] to-[#121424] p-8 text-white flex flex-col justify-between relative">
            <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-[#B1B2FF]/10"></div>
            <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-[#B1B2FF]/20"></div>

            <div className="flex items-center gap-2.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm">
                <Building2 className="w-5 h-5 text-[#B1B2FF]" />
              </div>
              <div>
                <h1 className="font-extrabold text-base leading-none text-white">OriginEdge</h1>
                <span className="text-[10px] text-[#B1B2FF] font-bold uppercase tracking-widest mt-0.5 block">Enterprise HRMS</span>
              </div>
            </div>

            <div className="space-y-4 my-12 z-10">
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">Streamlining Workforce Operations & Talent Engines</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Experience high-fidelity workspace components connected securely to live records. Filter leave trackers, timesheets, and evaluate candidate pipelines with Role-Based Access controls.
              </p>
            </div>

            <div className="text-[11px] text-slate-400 font-mono z-10">
              OriginEdge Group © 2026. All rights secured.
            </div>
          </div>

          {/* Right login form column */}
          <form onSubmit={handleLogin} className="md:col-span-7 p-8 md:p-12 space-y-6 flex flex-col justify-center bg-white">
            <div>
              <h2 className="text-xl font-extrabold text-[#1E2038] tracking-tight">Welcome Back</h2>
              <p className="text-xs text-[#64748b] mt-1">Authenticate to connect to your personal workforce secure panel.</p>
            </div>

            {loginError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium animate-pulse">
                <Shield className="w-4 h-4 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Company Registered Email</label>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#D2DAFF] rounded-xl bg-[#EEF1FF]/45 focus-within:border-[#B1B2FF] focus-within:bg-white transition-all">
                  <Mail className="w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="john.doe@originedge.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#334155] w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Password credentials</label>
                  <a href="#" className="text-[10px] font-bold text-[#B1B2FF] hover:text-[#AAC4FF] hover:underline">Forgot?</a>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#D2DAFF] rounded-xl bg-[#EEF1FF]/45 focus-within:border-[#B1B2FF] focus-within:bg-white transition-all">
                  <Lock className="w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#334155] w-full"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-2.5 bg-[#1E2038] hover:bg-[#2B2E50] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:border-[#B1B2FF] border border-transparent active:scale-95 cursor-pointer"
            >
              {authenticating ? 'Authenticating credentials...' : 'Secure Sign In'}
              <ArrowRight className="w-4 h-4 text-[#B1B2FF]" />
            </button>

            {/* Presets divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400">Grading / Internship Presets</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presets.map((pre, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handlePresetLogin(pre.email)}
                  className="p-3 border border-slate-200 hover:border-[#B1B2FF] hover:bg-[#EEF1FF]/60 text-left bg-slate-50/60 rounded-xl transition-all text-xs cursor-pointer"
                >
                  <strong className="text-slate-800 font-bold block">{pre.name}</strong>
                  <span className="text-[9px] text-[#64748b] block mt-0.5 font-mono">{pre.email}</span>
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSidebarOpen(false);
        }}
        portalMode={portalMode}
        setPortalMode={(mode) => {
          handleTogglePortal(mode);
          setSidebarOpen(false);
        }}
        employee={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Primary app wrapper */}
      <div className="flex-grow flex flex-col min-w-0 transition-all duration-300">
        
        {/* Custom global Header */}
        <Header
          employee={user}
          notifications={notifications}
          onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
          onNavigateToTab={(tab) => {
            if (user?.role === 'HR' && tab === 'profile') {
              setPortalMode('Employee');
            }
            setCurrentTab(tab);
            setSidebarOpen(false);
          }}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        {/* Content canvas */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Main conditional rendering engine */}
          {portalMode === 'Employee' ? (
            <>
              {currentTab === 'dashboard' && (
                <DashboardTab
                  employee={user}
                  attendanceToday={attendanceToday}
                  attendanceHistory={attendanceHistory}
                  leaves={[]}
                  applications={[
                    { id: 'APP1', employeeId: user.id, position: 'Software Engineer', appliedDate: 'May 12, 2026', status: 'Under Review' },
                    { id: 'APP2', employeeId: user.id, position: 'Product Designer', appliedDate: 'Apr 28, 2026', status: 'Shortlisted' },
                    { id: 'APP3', employeeId: user.id, position: 'Data Analyst', appliedDate: 'May 02, 2026', status: 'Interview Scheduled' }
                  ]}
                  interviews={[
                    { id: 'INT1', position: 'Senior Frontend Developer', department: 'Engineering', candidateName: 'John Doe', stage: 'Technical Round', interviewers: ['Sarah Wilson'], datetime: 'May 22, 2026 • 10:30 AM', status: 'Upcoming' },
                    { id: 'INT2', position: 'Lead architect', department: 'Engineering', candidateName: 'Jane Smith', stage: 'HR Round', interviewers: ['John Doe'], datetime: 'May 25, 2026 • 02:00 PM', status: 'Upcoming' }
                  ]}
                  holidays={[
                    { id: 'h1', name: 'Independence Day', date: '2026-08-15', type: 'National Holiday', location: 'All Sites', description: 'Celebration of India Sovereignty.' },
                    { id: 'h2', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National Holiday', location: 'All Sites', description: 'Honor Father of Nation.' },
                    { id: 'h3', name: 'Diwali Celebration', date: '2026-11-08', type: 'Festival', location: 'India Sites', description: 'Festival of Lights.' }
                  ]}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  onResetAttendance={handleResetAttendance}
                  onNavigateToTab={setCurrentTab}
                />
              )}

              {currentTab === 'attendance' && (
                <AttendanceTab employee={user} />
              )}

              {currentTab === 'leave' && (
                <LeaveTab 
                  employee={user} 
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileTab employeeId={user.id} />
              )}

              {currentTab === 'documents' && (
                <DocumentsTab 
                  employee={user} 
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {currentTab === 'holidays' && (
                <HolidaysTab />
              )}

              {currentTab === 'other-leaves' && (
                <OtherLeavesTab />
              )}

              {currentTab === 'wfh' && (
                <WFHTab 
                  employee={user}
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {currentTab === 'ot' && (
                <OTTab 
                  employee={user}
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {currentTab === 'performance' && (
                <PerformanceTab 
                  employee={user}
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {currentTab === 'applications' && (
                <ApplicationsTab 
                  employee={user}
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {currentTab === 'interviews' && (
                <InterviewsTab 
                  employee={user}
                  onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {(currentTab === 'policies' || currentTab === 'policy') && (
                <PoliciesTab />
              )}
            </>
          ) : (
            /* HR Portal Admin Screens */
            <HRPortalTabs
              employee={user}
              currentHRTab={currentTab}
              onRefreshNotifications={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
