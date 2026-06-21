/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Search, RotateCcw, Filter, FileSpreadsheet, MoreVertical, CheckCircle, AlertTriangle, Eye, Calendar } from 'lucide-react';
import { Attendance, Employee } from '../types';
import { api } from '../lib/api';

interface AttendanceTabProps {
  employee: Employee;
}

export default function AttendanceTab({ employee }: AttendanceTabProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [attList, empList] = await Promise.all([
          api.getAttendance(),
          api.getEmployees()
        ]);
        setAttendance(attList);
        setEmployees(empList);
        setFilteredAttendance(attList);
      } catch (err: any) {
        console.error("Error loading attendance records:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter Trigger
  const handleApplyFilters = () => {
    let filtered = [...attendance];

    // Filter by department
    if (selectedDept !== 'All Departments') {
      const matchEmpIds = employees
        .filter(emp => emp.department === selectedDept)
        .map(emp => emp.id);
      filtered = filtered.filter(att => matchEmpIds.includes(att.employeeId));
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(att => att.status === selectedStatus);
    }

    // Filter by search query (Employee name/id)
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase().trim();
      const matchEmpIds = employees
        .filter(emp => emp.name.toLowerCase().includes(term) || emp.id.toLowerCase().includes(term))
        .map(emp => emp.id);
      filtered = filtered.filter(att => matchEmpIds.includes(att.employeeId));
    }

    setFilteredAttendance(filtered);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedDept('All Departments');
    setSelectedStatus('All');
    setFilteredAttendance(attendance);
  };

  // Stats calculation
  const totalEmployees = 128; // Constant representation from screenshot
  const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Early Exit').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const leaveCount = attendance.filter(a => a.status === 'On Leave').length;
  const lateCount = attendance.filter(a => a.status === 'Late' || (a.lateMinutes && a.lateMinutes > 5)).length;
  const earlyCount = attendance.filter(a => a.status === 'Early Exit').length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Attendance Report</h2>
        <p className="text-xs text-[#64748b]">Dashboard &gt; Attendance Report</p>
      </div>

      {/* Stats row resembling Page 2 screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Total Employees</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#0f172a]">{totalEmployees}</span>
            <span className="text-[10px] text-slate-400 font-medium">FTEs</span>
          </div>
        </div>

        {/* Present */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs border-l-4 border-l-green-500">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Present Today</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[0f172a]">{68 + presentCount}</span>
            <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded">75.0%</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs border-l-4 border-l-red-500">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Absent</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[0f172a]">{15 + absentCount}</span>
            <span className="text-[9px] text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded">15.6%</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">On Leave</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#0f172a]">{8 + leaveCount}</span>
            <span className="text-[9px] text-[#b45309] font-bold bg-amber-50 px-1 py-0.5 rounded">7.8%</span>
          </div>
        </div>

        {/* Late */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs border-l-4 border-l-orange-500">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Late Arrivals</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#0f172a]">{10 + lateCount}</span>
            <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1 py-0.5 rounded">9.3%</span>
          </div>
        </div>

        {/* Early Exit */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs border-l-4 border-l-blue-500">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Early Exits</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#0f172a]">{6 + earlyCount}</span>
            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded">6.2%</span>
          </div>
        </div>
      </div>

      {/* Filters Board */}
      <div className="bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filter Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Employee Name/ID Search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b]">Search Employee</label>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] focus-within:border-blue-400 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#334155] w-full"
              />
            </div>
          </div>

          {/* Department dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b]">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-1.5 text-xs text-[#334155] outline-none"
            >
              <option value="All Departments">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design">Design</option>
              <option value="Business Analysis">Business Analysis</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b]">Status Type</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-1.5 text-xs text-[#334155] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
              <option value="Late">Late</option>
              <option value="Early Exit">Early Exit</option>
            </select>
          </div>

          {/* Buttons trigger list */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-1.5 bg-[#1e40af] hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Apply Filter
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
              title="Reset configuration"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0f172a]">Attendance Details</h3>
          <button className="px-3 py-1.5 border border-[#e2e8f0] hover:bg-slate-50 text-[#334155] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Export Report
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Querying records...</div>
        ) : filteredAttendance.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No matching attendance logs found with current parameters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] text-[#64748b] font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Employee Details</th>
                  <th className="px-6 py-3">Employee ID</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Check In</th>
                  <th className="px-6 py-3">Check Out</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Work Hours</th>
                  <th className="px-6 py-3">Late Min</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAttendance.map((att) => {
                  const emp = employees.find(e => e.id === att.employeeId) || {
                    name: 'Unknown Colleague',
                    department: 'N/A',
                    avatar: undefined
                  };
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase text-slate-600">
                            {emp.avatar ? (
                              <img src={emp.avatar} alt="emp" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              emp.name.split(' ').map((n: string) => n[0]).join('')
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#334155]">{emp.name}</h4>
                            <span className="text-[10px] text-[#64748b] font-medium leading-none mt-0.5 block">{emp.department}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono font-medium text-slate-600">{att.employeeId}</td>
                      <td className="px-6 py-3 text-slate-600">{emp.department}</td>
                      <td className="px-6 py-3 font-mono text-[#334155]">{att.checkIn || '--'}</td>
                      <td className="px-6 py-3 font-mono text-[#334155]">{att.checkOut || '--'}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                          att.status === 'Present' ? 'bg-green-100 text-green-800' :
                          att.status === 'Late' ? 'bg-orange-100 text-orange-800' :
                          att.status === 'Early Exit' ? 'bg-blue-100 text-blue-800' :
                          att.status === 'On Leave' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-600">{att.workHours || '--'}</td>
                      <td className="px-6 py-3 font-mono text-red-600">{att.lateMinutes ? `${att.lateMinutes}m` : '0m'}</td>
                      <td className="px-6 py-3 text-right">
                        <button className="p-1.5 hover:bg-slate-100 text-[#64748b] hover:text-[#0f172a] rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
