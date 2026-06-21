/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, Award, Calendar, ChevronRight, 
  User, CheckCircle2, AlertCircle, RefreshCw, Sun, Moon, ArrowRight 
} from 'lucide-react';
import { Employee, Attendance, Leave, Application, Interview, Holiday } from '../types';

interface DashboardTabProps {
  employee: Employee;
  attendanceToday: Attendance | null;
  attendanceHistory: Attendance[];
  leaves: Leave[];
  applications: Application[];
  interviews: Interview[];
  holidays: Holiday[];
  onClockIn: () => void;
  onClockOut: () => void;
  onResetAttendance?: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardTab({
  employee,
  attendanceToday,
  attendanceHistory,
  leaves,
  applications,
  interviews,
  holidays,
  onClockIn,
  onClockOut,
  onResetAttendance,
  onNavigateToTab
}: DashboardTabProps) {
  const [shift, setShift] = useState<'Day' | 'Night'>('Day');
  const [breakState, setBreakState] = useState<'none' | 'morning' | 'lunch' | 'evening'>('none');
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [workElapsed, setWorkElapsed] = useState('00:00:00');
  const [dashboardTime, setDashboardTime] = useState<Date>(new Date());

  // Live clock timer for dashboard banner
  useEffect(() => {
    const timer = setInterval(() => {
      setDashboardTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDashboardGreeting = () => {
    const hrs = dashboardTime.getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDashboardDate = dashboardTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedDashboardTime = dashboardTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Elapsed Work Timer since clockIn
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (attendanceToday && attendanceToday.checkIn && !attendanceToday.checkOut) {
      const updateTimer = () => {
        try {
          const checkInTime = attendanceToday.createdAt 
            ? new Date(attendanceToday.createdAt) 
            : (() => {
                const checkInStr = attendanceToday.checkIn || '';
                const parts = checkInStr.split(' ');
                const time = parts[0] || '00:00';
                const meridiem = parts[1];
                const parts2 = time.split(':').map(Number);
                let h = parts2[0] || 0;
                let m = parts2[1] || 0;
                let s = parts2[2] || 0;
                if (meridiem) {
                  if (meridiem.toUpperCase() === 'PM' && h !== 12) h += 12;
                  if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
                }
                const d = new Date();
                d.setHours(h, m, s, 0);
                return d;
              })();

          const now = new Date();
          const diffMs = now.getTime() - checkInTime.getTime();
          if (diffMs > 0) {
            const hrs = Math.floor(diffMs / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            const secs = Math.floor((diffMs % 60000) / 1000);
            setWorkElapsed(
              `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
            );
          } else {
            setWorkElapsed('00h 00m 00s');
          }
        } catch (e) {
          setWorkElapsed('00h 00m 00s');
        }
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else if (attendanceToday?.checkOut) {
      setWorkElapsed(attendanceToday.workHours || 'Completed');
    } else {
      setWorkElapsed('00h 00m 00s');
    }
    return () => clearInterval(interval);
  }, [attendanceToday]);

  // Break stopwatch seconds tracker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breakState !== 'none') {
      interval = setInterval(() => {
        setBreakSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setBreakSeconds(0);
    }
    return () => clearInterval(interval);
  }, [breakState]);

  const formatBreakTime = (secCount: number) => {
    const mins = Math.floor(secCount / 60);
    const secs = secCount % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Leaves numbers
  const casualAvailable = 12;
  const sickAvailable = 8;
  const privilegeAvailable = 15;
  const earnedAvailable = 5;

  return (
    <div className="space-y-6">
      {/* Intro Greetings Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getDashboardGreeting()}, {employee.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium font-sans">
            {formattedDashboardDate} • {formattedDashboardTime} • OriginEdge Head Office
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigateToTab('leave')}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            Apply Leave
          </button>
          <button 
            onClick={() => onNavigateToTab('profile')}
            className="px-3.5 py-1.5 bg-[#B1B2FF] text-slate-900 text-xs font-bold rounded-xl hover:bg-[#9FA0F0] hover:scale-102 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-900" />
            My Profile
          </button>
        </div>
      </div>

      {/* Main Grid: Working Hours, Breaks, Shift/User, Leaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Working Hours Clock-in widget */}
        <div className="bg-white border-2 border-[#AAC4FF]/30 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between" id="working-hours-widget">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#4A90E2]/10 text-[#4A90E2] rounded-lg">
                  <Clock className="w-4.5 h-4.5 text-[#4A90E2]" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Working Hours (IST)
                </h3>
              </div>
              {attendanceToday ? (
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider ${
                  attendanceToday.checkOut ? 'bg-slate-100 text-slate-650 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {!attendanceToday.checkOut && (
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  )}
                  <span>{attendanceToday.checkOut ? 'Completed' : 'Active Shift'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-50 text-amber-655 border border-amber-200">
                  Absent
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Start and End Times Display */}
              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-450 uppercase font-extrabold tracking-widest block">Start Time</span>
                  <span className="text-xs font-bold font-mono text-slate-800 mt-1.5 block leading-tight">
                    {attendanceToday?.checkIn ? (
                      <span className="text-indigo-900 bg-indigo-50 border border-indigo-100 px-1.5 py-1 rounded-md text-[10.5px]">
                        {attendanceToday.checkIn}
                      </span>
                    ) : (
                      <span className="text-slate-405 italic text-[11px] font-medium font-sans">--:--:--</span>
                    )}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-450 uppercase font-extrabold tracking-widest block">End Time</span>
                  <span className="text-xs font-bold font-mono text-slate-800 mt-1.5 block leading-tight">
                    {attendanceToday?.checkOut ? (
                      <span className="text-indigo-900 bg-indigo-50 border border-indigo-100 px-1.5 py-1 rounded-md text-[10.5px]">
                        {attendanceToday.checkOut}
                      </span>
                    ) : attendanceToday ? (
                      <span className="text-emerald-600 bg-emerald-100/50 border border-emerald-200 animate-pulse font-extrabold text-[9.5px] uppercase tracking-wider px-1.5 py-1 rounded-md">
                        Tracking
                      </span>
                    ) : (
                      <span className="text-slate-405 italic text-[11px] font-medium font-sans">--:--:--</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Work Duration Output Panel */}
              <div className="text-center py-4 bg-slate-50 border border-slate-105 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-[#4A90E2]"></div>
                <span className="text-[9px] text-[#4A90E2] uppercase font-bold tracking-widest block">
                  {attendanceToday?.checkOut ? 'Total Duration' : 'Active Clock Timer'}
                </span>
                <div className="text-2xl font-black font-mono text-slate-850 mt-1.5 tracking-tight flex items-center justify-center gap-1.5">
                  {attendanceToday && !attendanceToday.checkOut && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  )}
                  <span>
                    {attendanceToday?.checkOut ? (attendanceToday.workHours || workElapsed) : workElapsed}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {/* Simple dynamic Button */}
            {!attendanceToday ? (
              <button
                onClick={onClockIn}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Working (IST)
              </button>
            ) : !attendanceToday.checkOut ? (
              <button
                onClick={onClockOut}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-2 border border-red-500"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                Stop Working (IST)
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-center text-xs font-bold text-green-700 py-3.5 bg-green-50 border border-green-200/55 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Shift Completed!
                </div>
              </div>
            )}

            {onResetAttendance && (attendanceToday?.checkIn || attendanceToday?.checkOut) && (
              <button 
                onClick={onResetAttendance}
                className="w-full py-1.5 text-[9px] text-center font-bold text-slate-400 hover:text-red-500 hover:underline tracking-widest uppercase transition-all cursor-pointer block border border-transparent hover:border-slate-100 rounded-md"
              >
                Reset Shift (Demo Testing)
              </button>
            )}
          </div>
        </div>

        {/* Breaks Manager */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-850">Breaks Today</h3>
            {breakState !== 'none' && (
              <span className="animate-pulse bg-amber-500 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                ON BREAK {formatBreakTime(breakSeconds)}
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {/* Morning Break */}
            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              breakState === 'morning' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
            }`}>
              <div>
                <h4 className="text-xs font-bold text-slate-850">Morning Break</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Start break (Suggested: 15 mins)</p>
              </div>
              <button
                onClick={() => setBreakState(breakState === 'morning' ? 'none' : 'morning')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  breakState === 'morning' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {breakState === 'morning' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5 text-slate-400" />}
              </button>
            </div>

            {/* Lunch/Dinner Break */}
            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              breakState === 'lunch' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
            }`}>
              <div>
                <h4 className="text-xs font-bold text-slate-850">Lunch Break</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Middle day (Suggested: 45 mins)</p>
              </div>
              <button
                onClick={() => setBreakState(breakState === 'lunch' ? 'none' : 'lunch')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  breakState === 'lunch' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {breakState === 'lunch' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5 text-slate-400" />}
              </button>
            </div>

            {/* Evening Break */}
            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              breakState === 'evening' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
            }`}>
              <div>
                <h4 className="text-xs font-bold text-slate-850">Evening Break</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Quick break (Suggested: 15 mins)</p>
              </div>
              <button
                onClick={() => setBreakState(breakState === 'evening' ? 'none' : 'evening')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  breakState === 'evening' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {breakState === 'evening' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* User Persona Profile Card */}
        <div className="bg-slate-900 rounded-xl p-5 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle elegant design accents */}
          <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-[#B1B2FF]/10"></div>
          <div className="absolute -left-12 -bottom-12 w-24 h-24 rounded-full bg-[#AAC4FF]/10"></div>

          <div className="text-center z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 p-1 flex items-center justify-center border border-slate-700 relative">
              <span className="w-14 h-14 rounded-full bg-[#B1B2FF] flex items-center justify-center text-sm font-bold uppercase border border-[#B1B2FF] text-slate-900">
                JD
              </span>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center" title="Online">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>

            <h4 className="text-sm font-bold mt-3 leading-tight text-white">{employee.name}</h4>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider mt-1">{employee.title}</span>
            <span className="text-[11px] text-slate-500 font-mono mt-2 block">Wednesday • May 20, 2026</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 z-10">
            <button
              onClick={() => setShift('Day')}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                shift === 'Day'
                  ? 'bg-[#B1B2FF] text-slate-900 shadow-sm border border-[#B1B2FF]'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-755'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Day Shift
            </button>
            <button
              onClick={() => setShift('Night')}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                shift === 'Night'
                  ? 'bg-[#B1B2FF] text-slate-900 shadow-sm border border-[#B1B2FF]'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-755'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Night Shift
            </button>
          </div>
        </div>

        {/* Leave Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-805">Leave Summary</h3>
            <button 
              onClick={() => onNavigateToTab('leave')}
              className="text-[10px] font-bold text-[#4A90E2] hover:text-[#357abd] hover:underline uppercase tracking-wider cursor-pointer"
            >
              All Leaves
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#4A90E2]"></span>
                Casual Leave (CL)
              </span>
              <span className="text-xs font-extrabold text-slate-800">{casualAvailable} available</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-teal-500"></span>
                Sick Leave (SL)
              </span>
              <span className="text-xs font-extrabold text-slate-800">{sickAvailable} available</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-emerald-500"></span>
                Privilege Leave (PL)
              </span>
              <span className="text-xs font-extrabold text-slate-800">{privilegeAvailable} available</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-amber-500"></span>
                Earned Leave (EL)
              </span>
              <span className="text-xs font-extrabold text-slate-800">{earnedAvailable} available</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('leave')}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all block text-center"
          >
            Apply Leave
          </button>
        </div>
      </div>

      {/* Secondary Row: Applications Status Table & Upcoming Interviews List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Applications */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Active Job Openings & Submissions</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Internal positions you've filed details for</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('applications')}
              className="text-xs font-bold text-[#4A90E2] hover:text-[#357abd] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Browse Openings
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-505 uppercase font-bold tracking-wider bg-slate-50">
                  <th className="px-3 py-2.5">Career Opportunity</th>
                  <th className="px-3 py-2.5">Date Submitted</th>
                  <th className="px-3 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-semibold text-slate-800">{app.position}</td>
                    <td className="px-3 py-3 text-slate-500">{app.appliedDate}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`inline-block py-0.5 px-2 rounded font-bold text-[9px] uppercase ${
                        app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700' :
                        app.status === 'Interview Scheduled' ? 'bg-[#AAC4FF]/10 text-slate-805 border border-[#AAC4FF]/20' :
                        'bg-[#B1B2FF]/10 text-slate-805 border border-[#B1B2FF]/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interviews Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Candidate Interviews</h3>
            <button 
              onClick={() => onNavigateToTab('interviews')}
              className="text-xs font-bold text-[#4A90E2] hover:text-[#357abd] hover:underline cursor-pointer"
            >
              Agenda
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {interviews.slice(0, 3).map((it) => (
              <div key={it.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-700">{it.candidateName}</h4>
                  <span className={`text-[8px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded ${
                    it.status === 'Upcoming' ? 'bg-[#4A90E2]/10 text-slate-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {it.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{it.position} ({it.department})</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-slate-205">
                  <span className="text-[9px] text-[#4A90E2] font-mono font-bold leading-none">{it.datetime}</span>
                  <span className="text-[8px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded uppercase font-bold">{it.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Secluded Holiday and Team Leaves list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Leaves */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-850">Other Employees on Leave</h3>
            <button 
              onClick={() => onNavigateToTab('other-leaves')}
              className="text-xs font-bold text-[#4A90E2] hover:text-[#357abd] hover:underline cursor-pointer"
            >
              Full Calendar
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  SW
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Sarah Wilson</h5>
                  <p className="text-[9px] text-slate-400">HR Executive</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-700 font-bold bg-slate-200 px-2.5 py-1 rounded">
                May 21 – May 22
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                  MB
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Michael Brown</h5>
                  <p className="text-[9px] text-slate-400">Engineering Manager</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-700 font-bold bg-slate-200 px-2.5 py-1 rounded">
                May 20
              </span>
            </div>
          </div>
        </div>

        {/* Company Holidays */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-850">Company Holidays</h3>
            <button 
              onClick={() => onNavigateToTab('holidays')}
              className="text-xs font-bold text-[#4A90E2] hover:text-[#357abd] hover:underline cursor-pointer"
            >
              View Calendar
            </button>
          </div>
          <div className="space-y-2">
            {holidays.slice(0, 3).map((hol) => (
              <div key={hol.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <h5 className="text-xs font-bold text-slate-700">{hol.name}</h5>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">{hol.type} • {hol.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#4A90E2] font-mono block bg-[#4A90E2]/10 px-2 py-0.5 rounded uppercase font-bold">
                    {new Date(hol.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
