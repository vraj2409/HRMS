/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Search, Filter, RefreshCw, Palmtree } from 'lucide-react';
import { Leave, Employee } from '../types';
import { api } from '../lib/api';

export default function OtherLeavesTab() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allLeaves, allEmployees] = await Promise.all([
        api.getLeaves(),
        api.getEmployees()
      ]);
      setLeaves(allLeaves);
      setEmployees(allEmployees);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeDetails = (empId: string) => {
    return employees.find(e => e.id === empId) || { name: 'Unknown Employee', department: 'Engineering', title: 'Specialist' };
  };

  // Filter approved/pending leaves of OTHER employees
  const filteredLeaves = leaves.filter(lv => {
    const emp = getEmployeeDetails(lv.employeeId);
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lv.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1E2038] tracking-tight">Other Employees Leave</h2>
          <p className="text-xs text-[#64748b]">Dashboard &gt; Other Employees Leave Calendar</p>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 bg-[#1E2038] hover:bg-[#2B2E50] text-white rounded-xl transition-all shadow-md flex items-center justify-center"
          title="Refresh Leaves Database"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info card */}
      <div className="p-4 bg-[#B1B2FF]/10 border border-[#B1B2FF]/30 text-[#1E2038] rounded-xl flex items-start gap-3">
        <Palmtree className="w-5 h-5 text-[#B1B2FF] mt-0.5" />
        <div>
          <h4 className="text-xs font-bold">Planned Coworker Absences</h4>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Use this view to align project timelines, meeting slots, and handovers with out-of-office schedules across multiple departments.
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white border border-[#E0E2E5] p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full max-w-md focus-within:border-[#B1B2FF] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by coworker name or leave type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#64748b] uppercase">Filter Department</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-[#E0E2E5] rounded-xl p-1.5 text-xs text-[#1E2038] outline-none font-semibold focus:border-[#B1B2FF]"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Design">Design</option>
            <option value="Business Analysis">Business Analysis</option>
            <option value="Quality Assurance">Quality Assurance</option>
          </select>
        </div>
      </div>

      {/* Table & Timeline */}
      <div className="bg-white border border-[#E0E2E5] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-55/40">
          <h3 className="text-sm font-bold text-[#1E2038] flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-[#B1B2FF]" />
            Absenteeism Index
          </h3>
          <span className="text-xs font-bold text-slate-500">Record Count: {filteredLeaves.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#B1B2FF]" />
            Loading coworkers list...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400">
            No absences logged matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto text-[#1E2038]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Coworker</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Type of Leave</th>
                  <th className="px-6 py-3 font-mono text-center">Span Period</th>
                  <th className="px-6 py-3 text-center">Days absent</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLeaves.map((lv) => {
                  const coworker = getEmployeeDetails(lv.employeeId);
                  return (
                    <tr key={lv.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#B1B2FF]/20 text-[#1E2038] text-[10px] font-black flex items-center justify-center uppercase">
                            {coworker.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-bold block text-slate-800">{coworker.name}</span>
                            <span className="text-[9px] text-[#64748b] block">{coworker.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{coworker.department}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium rounded">
                          {lv.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-[10px] text-slate-500">
                        {lv.fromDate} ➔ {lv.toDate}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{lv.totalDays}</td>
                      <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate" title={lv.reason}>
                        "{lv.reason}"
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block py-0.5 px-2 bg-gradient-to-r rounded text-[9px] font-bold ${
                          lv.status === 'Approved' ? 'from-[#3AD6A8]/20 to-[#3AD6A8]/30 text-emerald-800' :
                          lv.status === 'Pending' ? 'from-[#B1B2FF]/20 to-[#B1B2FF]/30 text-indigo-900' :
                          'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {lv.status}
                        </span>
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
