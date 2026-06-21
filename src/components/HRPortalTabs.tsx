/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Check, X, ShieldCheck, Mail, ShieldAlert, Award, FileText, Plus, UserPlus, Clock, RefreshCw, HelpCircle, UserCheck2, Shield, BookOpen, User, Eye
} from 'lucide-react';
import { Employee, Leave, Attendance, Interview } from '../types';
import { api } from '../lib/api';

interface HRPortalTabsProps {
  employee: Employee;
  currentHRTab: string;
  onRefreshNotifications: () => void;
}

export default function HRPortalTabs({ employee, currentHRTab, onRefreshNotifications }: HRPortalTabsProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrowseEmployee, setSelectedBrowseEmployee] = useState<Employee | null>(null);

  // Form State: Add new Colleague
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState<'Employee' | 'HR'>('Employee');
  const [newJoining, setNewJoining] = useState('Jun 20, 2026');
  const [newPhone, setNewPhone] = useState('+91 99000 11222');
  const [newManager, setNewManager] = useState('Michael Brown');
  const [postingColleague, setPostingColleague] = useState(false);
  const [colleagueFeedback, setColleagueFeedback] = useState('');

  // Form State: Schedule Interview
  const [candName, setCandName] = useState('');
  const [candPos, setCandPos] = useState('');
  const [candDept, setCandDept] = useState('Engineering');
  const [candStage, setCandStage] = useState<'Screening' | 'Technical Round' | 'HR Round'>('Screening');
  const [candDateTime, setCandDateTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Form State: Create Performance Review
  const [revEmpId, setRevEmpId] = useState('');
  const [revPeriod, setRevPeriod] = useState('Annual Review 2025-26');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [postingReview, setPostingReview] = useState(false);

  const loadHRData = async () => {
    setLoading(true);
    try {
      const [empList, lvList, attList, itList] = await Promise.all([
        api.getEmployees(),
        api.getLeaves(),
        api.getAttendance(),
        api.getInterviews()
      ]);
      setEmployees(empList);
      setLeaves(lvList);
      setAttendance(attList);
      setInterviews(itList);
    } catch (err: any) {
      console.error("Error retrieving admin details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, [currentHRTab]);

  // Approve / Reject Leave
  const handleResolveLeave = async (id: string, action: 'Approved' | 'Rejected') => {
    try {
      await api.updateLeaveStatus(id, action);
      await loadHRData();
      onRefreshNotifications();
    } catch (err: any) {
      alert("Leave approval failed: " + err.message);
    }
  };

  // Add Employee Submission
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setColleagueFeedback('');
    if (!newId || !newName || !newEmail || !newTitle) {
      setColleagueFeedback('Required parameters are missing.');
      return;
    }

    setPostingColleague(true);
    try {
      await api.createEmployee({
        id: newId,
        name: newName,
        email: newEmail.toLowerCase().trim(),
        title: newTitle,
        department: newDept,
        role: newRole,
        dateOfJoining: newJoining,
        phone: newPhone,
        reportingManager: newManager,
        personalInfo: {
          fatherName: "Mr. Parent", motherName: "Mrs. Parent", dob: "May 12, 1996",
          maritalStatus: "Single", bloodGroup: "O+", nationality: "Indian",
          panCode: "ABCDE1122F", aadhaarCode: "8888 9999 0000", passportNo: "P0022334",
          drivingLicense: "KA01 2020", languages: ["English"]
        },
        contactAddress: "Bengaluru, India",
        emergencyContact: { name: "Relative", relation: "Uncle", phone: "+91 99000 88776" },
        skills: [{ name: "Professional Skills", percentage: 85 }],
        education: [{ degree: "Graduate", school: "University College", years: "2015-18", grade: "A" }],
        certificates: []
      });

      setColleagueFeedback(`Success! Registered colleague '${newName}' as context Role '${newRole}' in HR Database successfully.`);
      // Clear forms
      setNewId('');
      setNewName('');
      setNewEmail('');
      setNewTitle('');
      await loadHRData();
      onRefreshNotifications();
    } catch (err: any) {
      setColleagueFeedback(`Error: ${err.message}`);
    } finally {
      setPostingColleague(false);
    }
  };

  // Create Review Submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revEmpId || !revComment.trim()) {
      alert("Please select employee and fill comments");
      return;
    }
    setPostingReview(true);
    try {
      await api.createPerformanceReview({
        employeeId: revEmpId,
        period: revPeriod,
        rating: Number(revRating),
        comments: revComment
      });
      alert(`Success: Created ratings evaluation index for colleague ID ${revEmpId}`);
      setRevComment('');
      await loadHRData();
      onRefreshNotifications();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setPostingReview(false);
    }
  };

  // Add Candidate Interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candPos || !candDateTime) {
      alert("Please enter target parameters");
      return;
    }
    setScheduling(true);
    try {
      await api.scheduleInterview({
        candidateName: candName,
        position: candPos,
        department: candDept,
        stage: candStage,
        interviewers: ["Sarah Wilson", "John Doe"],
        datetime: candDateTime
      });
      alert(`Candidate scheduled! Registered interview details for candidate: '${candName}'`);
      setCandName('');
      setCandPos('');
      setCandDateTime('');
      await loadHRData();
      onRefreshNotifications();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Context Switcher */}
      <div>
        <h2 className="text-xl font-bold text-[#0f172a] capitalize tracking-tight">
          {currentHRTab.replace('hr-', 'HR Portal > ')} Console
        </h2>
        <p className="text-xs text-[#64748b]">Administrative Role-Based Access Control Area (HR Privilege Only)</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1e40af]" />
          Synchronizing HR Admin catalog database...
        </div>
      ) : (
        <>
          {/* TAB 1: HR EMPLOYEES DIRECTORY */}
          {currentHRTab === 'hr-employees' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Directory display */}
              <div className="lg:col-span-2 bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1e40af]" />
                  Active Employee Database Directory ({employees.length})
                </h3>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {employees.map(emp => (
                    <button
                      type="button"
                      key={emp.id}
                      onClick={() => setSelectedBrowseEmployee(emp)}
                      className="w-full text-left p-3.5 bg-slate-50 hover:bg-[#1e40af]/5 border border-slate-100 hover:border-[#1e40af]/30 rounded-xl flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 text-[#1e40af] text-xs font-black flex items-center justify-center uppercase group-hover:bg-[#1e40af] group-hover:text-white transition-all">
                          {emp.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs leading-none group-hover:text-[#1e40af] transition-colors">{emp.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold tracking-tight mt-1 inline-block uppercase">
                            {emp.title} • {emp.department}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{emp.email}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className={`inline-block py-0.5 px-2 rounded font-bold text-[9px] ${
                          emp.role === 'HR' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {emp.role} ID: {emp.id}
                        </span>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Eye className="w-3 h-3 text-slate-400 group-hover:text-[#1e40af]" />
                          <span className="text-[9px] text-[#2563eb] font-bold group-hover:underline">Detailed Profile</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Add New Employee Form */}
              <div className="bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2.5 mb-3.5 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#2563eb]" />
                  Register New Employee
                </h3>

                {colleagueFeedback && (
                  <div className="p-3 bg-blue-50 border border-blue-100 text-slate-700 text-xs leading-relaxed rounded-xl font-medium mb-3">
                    {colleagueFeedback}
                  </div>
                )}

                <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#64748b]">Employee ID*</span>
                      <input 
                        type="text" 
                        required 
                        placeholder="EMP007" 
                        value={newId}
                        onChange={(e) => setNewId(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#64748b]">System Role*</span>
                      <select
                        value={newRole}
                        onChange={(e: any) => setNewRole(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-semibold"
                      >
                        <option value="Employee">Employee Portal</option>
                        <option value="HR">HR Admin Portal</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64748b]">Full Name*</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="Jane Smith" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-semibold text-[#1e293b]"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64748b]">Company Email*</span>
                    <input 
                      type="email" 
                      required 
                      placeholder="jane.smith@originedge.com" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64748b]">Designation / Job Title*</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="Senior Full Stack Engineer" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#64748b]">Department*</span>
                      <select
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Design">Design</option>
                        <option value="Business Analysis">Business Analysis</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#64748b]">Mobile Contact</span>
                      <input 
                        type="text" 
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={postingColleague}
                    className="w-full py-2 bg-[#1e40af] hover:bg-blue-800 text-white font-bold rounded-lg transition-all"
                  >
                    {postingColleague ? 'Registering colleague...' : 'Register and Seed Employee'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: HR LEAVES VERIFICATION */}
          {currentHRTab === 'hr-leaves' && (
            <div className="bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2">
                Employee Leave Applications - Verification Queue
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-2.5">Requester</th>
                      <th className="px-6 py-2.5">Leave Type Details</th>
                      <th className="px-6 py-2.5 font-mono">From / To Period</th>
                      <th className="px-6 py-2.5 text-center">Days</th>
                      <th className="px-6 py-2.5">Filing Reason</th>
                      <th className="px-6 py-2.5 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {leaves.filter(lv => lv.status === 'Pending').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-slate-400 font-semibold">
                          Excellent! All leave requests have been verified. No pending items inside the inbox queue!
                        </td>
                      </tr>
                    ) : (
                      leaves.filter(lv => lv.status === 'Pending').map((lv) => {
                        const requester = employees.find(e => e.id === lv.employeeId) || { name: 'Teammate Absent/Removed', title: 'Employee' };
                        return (
                          <tr key={lv.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-[#334155]">{requester.name} ({lv.employeeId})</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 text-[10px]">
                                {lv.leaveType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{lv.fromDate} to {lv.toDate}</td>
                            <td className="px-6 py-4 text-center font-bold text-slate-700">{lv.totalDays}</td>
                            <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={lv.reason}>{lv.reason}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleResolveLeave(lv.id, 'Approved')}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleResolveLeave(lv.id, 'Rejected')}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE SHEETS OVERVIEW */}
          {currentHRTab === 'hr-attendance' && (
            <div className="bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-gray-100 pb-2">
                All Employees Live Punch Clocking Records
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Employee Name</th>
                      <th className="px-6 py-3">Employee ID</th>
                      <th className="px-6 py-3">Workday Date</th>
                      <th className="px-6 py-3">Punch-In Stamp</th>
                      <th className="px-6 py-3">Punch-Out Stamp</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Elapsed Duty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {attendance.map((att) => {
                      const req = employees.find(e => e.id === att.employeeId) || { name: 'Colleague' };
                      return (
                        <tr key={att.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-bold text-slate-700">{req.name}</td>
                          <td className="px-6 py-3 font-mono text-slate-500">{att.employeeId}</td>
                          <td className="px-6 py-3 text-[#64748b] font-mono">{att.date}</td>
                          <td className="px-6 py-3 font-mono text-[#334155]">{att.checkIn || '--'}</td>
                          <td className="px-6 py-3 font-mono text-[#334155]">{att.checkOut || '--'}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                              att.status === 'Present' ? 'bg-green-100 text-green-800' :
                              att.status === 'Late' ? 'bg-orange-100 text-orange-800 animate-pulse' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right font-mono font-bold text-slate-600">{att.workHours || '--'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RECRUITMENT INTERVIEW TRACKER */}
          {currentHRTab === 'hr-interviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left active interviews panel */}
              <div className="lg:col-span-2 bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2">
                  Active Recruitment Schedules ({interviews.length})
                </h3>

                <div className="space-y-3">
                  {interviews.map(it => (
                    <div key={it.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-all flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{it.candidateName}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Position: {it.position} ({it.department})</p>
                        <div className="flex gap-2 pt-1.5 flex-wrap">
                          <span className="text-[9px] text-[#1e40af] bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                            🕑 {it.datetime}
                          </span>
                          <span className="text-[9px] text-[#64748b] bg-slate-100 px-1.5 py-0.5 rounded font-bold mt-1 inline-block uppercase">
                            Stage: {it.stage}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                          it.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {it.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right forms scheduler */}
              <div className="bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2 mb-3">
                  Schedule New Interview
                </h3>

                <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64748b]">Candidate Name*</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Alex Mercer" 
                      value={candName}
                      onChange={(e) => setCandName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64748b]">Positional Title*</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Senior Frontend Dev" 
                      value={candPos}
                      onChange={(e) => setCandPos(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-semibold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#64748b]">Department*</span>
                      <select
                        value={candDept}
                        onChange={(e) => setCandDept(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Business Layout">Business Layout</option>
                        <option value="HR">HR Department</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#64748b]">Stage Round*</span>
                      <select
                        value={candStage}
                        onChange={(e: any) => setCandStage(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none"
                      >
                        <option value="Screening">1. Screening</option>
                        <option value="Technical Round">2. Technical</option>
                        <option value="HR Round">3. HR Panel</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64748b]">Date & Time Slot*</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Jun 25, 2026 • 11:30 AM" 
                      value={candDateTime}
                      onChange={(e) => setCandDateTime(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-1.5 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={scheduling}
                    className="w-full py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                  >
                    {scheduling ? 'Scheduling...' : 'Schedule Interview Agenda'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: REVIEW PERFORMANCE SUBMISSION */}
          {currentHRTab === 'hr-performance' && (
            <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs max-w-2xl mx-auto space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Submit Teammate Performance Evaluation Rating
              </h3>

              <form onSubmit={handleAddReview} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Pick Employee Target *</span>
                    <select
                      value={revEmpId}
                      required
                      onChange={(e) => setRevEmpId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-700"
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Rating Scale (1-5 Star) *</span>
                    <select
                      value={revRating}
                      onChange={(e: any) => setRevRating(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-mono font-extrabold text-[#1e40af]"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - High Performer)</option>
                      <option value={3}>⭐⭐⭐ (3 - Satisfactory)</option>
                      <option value={2}>⭐⭐ (2 - Needs Training)</option>
                      <option value={1}>⭐ (1 - Low Delivery)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Project Period Span *</span>
                  <input
                    type="text"
                    required
                    value={revPeriod}
                    onChange={(e) => setRevPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Performance Feedback Narrative Summary *</span>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe specific key wins, agility scores, and development notes for compliance folder..."
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none placeholder:text-slate-400 font-semibold text-slate-700 leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={postingReview}
                  className="w-full py-2.5 bg-[#1e40af] hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  {postingReview ? 'Logging review...' : 'Publish Performance Review Rating'}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* Employee Profile Preview Modal for HR and directory clicks */}
      {selectedBrowseEmployee && (
        <div className="fixed inset-0 bg-[#0f172a]/70 flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
            
            {/* Modal Header banner */}
            <div className="px-6 py-4 border-b border-slate-100 bg-[#2E3033] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">Co-worker Digital Identity Card</h3>
                  <p className="text-[10px] text-slate-350">HR Admin Detailed Profile Record ({selectedBrowseEmployee.id})</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedBrowseEmployee(null)} 
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile body content scroll area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 font-sans">
              
              {/* Primary Intro Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-lg font-black flex items-center justify-center uppercase shadow-xs shrink-0">
                  {selectedBrowseEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900 leading-none">{selectedBrowseEmployee.name}</h4>
                  <p className="text-xs text-slate-505 font-semibold">{selectedBrowseEmployee.title} • {selectedBrowseEmployee.department}</p>
                  <p className="text-[10px] text-slate-405 font-mono">{selectedBrowseEmployee.email}</p>
                </div>
                <div className="md:ml-auto text-center md:text-right shrink-0">
                  <span className="inline-block py-1 px-2.5 bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-md font-bold text-[10px] uppercase tracking-wider">
                    {selectedBrowseEmployee.role} Account Status
                  </span>
                  <p className="text-[9px] text-slate-400 font-medium font-mono mt-1 font-semibold">Joined: {selectedBrowseEmployee.dateOfJoining}</p>
                </div>
              </div>

              {/* Information Grid Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Card: Essential Professional Profile */}
                <div className="bg-white border border-slate-150 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                  <h5 className="border-b border-slate-100 pb-1.5 text-[10px] uppercase font-extrabold text-amber-600 tracking-wider flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    Essential Workplace Context
                  </h5>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Duty Location</span>
                      <strong className="text-slate-705">{selectedBrowseEmployee.location}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Reporting Line Manager</span>
                      <strong className="text-slate-705">{selectedBrowseEmployee.reportingManager}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium font-mono font-bold">Mobile Contact Line</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.phone}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55">
                      <span className="text-slate-450 font-medium">Permanent Address</span>
                      <strong className="text-slate-705 max-w-[180px] text-right truncate" title={selectedBrowseEmployee.contactAddress}>
                        {selectedBrowseEmployee.contactAddress}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Right Card: National Identifiers */}
                <div className="bg-white border border-slate-150 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                  <h5 className="border-b border-slate-100 pb-1.5 text-[10px] uppercase font-extrabold text-emerald-600 tracking-wider flex items-center gap-2">
                    <Award className="w-3.5 h-3.5" />
                    Administrative & National IDs (PAN & Aadhaar)
                  </h5>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium font-mono">Indian PAN Code</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.personalInfo.panCode || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium font-mono">Aadhaar National ID</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.personalInfo.aadhaarCode || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55">
                      <span className="text-slate-450 font-medium font-mono">Passport Credentials</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.personalInfo.passportNo || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55 border-b-transparent">
                      <span className="text-slate-450 font-medium">Blood Group Accent</span>
                      <strong className="text-slate-705 font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded">
                        {selectedBrowseEmployee.personalInfo.bloodGroup}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Left Card: Personal Profile details */}
                <div className="bg-white border border-slate-150 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                  <h5 className="border-b border-slate-100 pb-1.5 text-[10px] uppercase font-extrabold text-[#1e40af] tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Family & Bio Records
                  </h5>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Father's Full Name</span>
                      <strong className="text-slate-705">{selectedBrowseEmployee.personalInfo.fatherName || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Mother's Full Name</span>
                      <strong className="text-slate-705">{selectedBrowseEmployee.personalInfo.motherName || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55">
                      <span className="text-slate-450 font-medium">Birthdate Index</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.personalInfo.dob}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55 border-b-transparent">
                      <span className="text-slate-450 font-medium">Marital Status Status</span>
                      <strong className="text-slate-705">{selectedBrowseEmployee.personalInfo.maritalStatus}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Right Card: Emergency Contacts */}
                <div className="bg-white border border-slate-150 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                  <h5 className="border-b border-slate-100 pb-1.5 text-[10px] uppercase font-extrabold text-blue-600 tracking-wider flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Emergency Contact Person
                  </h5>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Contact Person Name</span>
                      <strong className="text-slate-705">{selectedBrowseEmployee.emergencyContact.name}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Relation Detail</span>
                      <strong className="text-slate-755">{selectedBrowseEmployee.emergencyContact.relation}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55 border-b-transparent">
                      <span className="text-slate-450 font-medium font-mono font-bold">Priority Emergency Phone</span>
                      <strong className="text-slate-755 font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                        {selectedBrowseEmployee.emergencyContact.phone}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Skills Area */}
              <div className="bg-slate-50/65 p-4 border border-slate-205 rounded-xl space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Acquired Professional Capability Skills Index</span>
                <div className="flex flex-wrap gap-2">
                  {selectedBrowseEmployee.skills && selectedBrowseEmployee.skills.length > 0 ? (
                    selectedBrowseEmployee.skills.map((skill, index) => (
                      <div key={index} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center gap-2 font-semibold">
                        <span className="text-slate-800">{skill.name}</span>
                        <span className="text-amber-805 font-mono text-[10px] font-extrabold bg-amber-50 px-1 rounded">{skill.percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No professional skill badges declared.</span>
                  )}
                </div>
              </div>

              {/* Academic Portfolio section */}
              <div className="bg-white p-4.5 border border-slate-150 rounded-xl space-y-3 shadow-xs">
                <h5 className="border-b border-slate-100 pb-1.5 text-[10px] uppercase font-extrabold text-[#2E3033] tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Educational Curriculum Matrix
                </h5>
                <div className="space-y-2">
                  {selectedBrowseEmployee.education && selectedBrowseEmployee.education.length > 0 ? (
                    selectedBrowseEmployee.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100 text-[11px]">
                        <div>
                          <span className="font-extrabold text-slate-800 block">{edu.degree}</span>
                          <span className="text-slate-504 font-medium mt-0.5 block">{edu.school}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-mono block">Timeline: {edu.years}</span>
                          <span className="text-slate-705 font-bold block mt-0.5">Aggregate Result: {edu.grade}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-405 italic">No formal educational portfolio listed.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <button 
                type="button" 
                onClick={() => setSelectedBrowseEmployee(null)}
                className="py-2.5 px-6 bg-[#2E3033] hover:bg-[#43464a] text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Close Profile Panel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
