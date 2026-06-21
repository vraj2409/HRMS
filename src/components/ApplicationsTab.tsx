/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, Send, ThumbsUp, RefreshCw, Layers, Calendar, ChevronRight } from 'lucide-react';
import { Application, Employee } from '../types';
import { api } from '../lib/api';

interface ApplicationsTabProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function ApplicationsTab({ employee, onRefreshNotifications }: ApplicationsTabProps) {
  const [apps, setApps] = useState<Application[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated internal openings
  const openings = [
    { title: 'Senior Backend Engineer', dept: 'Engineering', loc: 'Bengaluru, India', pkg: '₹18-24 LPA', exp: '5+ Yrs', desc: 'Own architectural improvements, cluster performance, and API delivery indexes.' },
    { title: 'Project Delivery Manager', dept: 'Product Group', loc: 'Delhi, India', pkg: '₹14-19 LPA', exp: '4+ Yrs', desc: 'Oversee agile milestones, client requirement validation, and team velocity.' },
    { title: 'Lead UX Specialist', dept: 'Design Studio', loc: 'Bengaluru, India', pkg: '₹15-22 LPA', exp: '6+ Yrs', desc: 'Guide typography standards, vector designs, and customer interactive prototypes.' },
    { title: 'Quality Assurance Architect', dept: 'Quality Assurance', loc: 'Hybrid Remote', pkg: '₹12-16 LPA', exp: '3+ Yrs', desc: 'Orchestrate automated test suites, Selenium validation runs, and telemetry pipelines.' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, emps] = await Promise.all([
        api.getApplications(),
        api.getEmployees()
      ]);
      setApps(list);
      setEmployees(emps);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyToOpening = async (title: string) => {
    try {
      // Simulate posting application for logged in user via alert
      alert(`Success: Your internal transition request for the position '${title}' has been logged in the HR compliance queue for evaluation!`);
      onRefreshNotifications();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || `Employee ${empId}`;
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1E2038] tracking-tight">Applications & Opportunities</h2>
          <p className="text-xs text-[#64748b]">Portal &gt; Career Transitions & Openings</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-slate-50 border border-[#E0E2E5] hover:bg-slate-100 text-[#1E2038] rounded-xl transition-all flex items-center justify-center cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: internal vacant positions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1.5 bg-slate-50 border border-[#E0E2E5] p-3.5 rounded-xl">
            <Layers className="w-4.5 h-4.5 text-[#B1B2FF]" />
            Hot Internal Job Openings ({openings.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openings.map((op, i) => (
              <div key={i} className="bg-white border border-[#E0E2E5] p-4 rounded-xl shadow-2xs hover:border-[#B1B2FF] hover:bg-[#EEF1FF] transition-all text-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#B1B2FF] bg-[#EEF1FF] px-1.5 py-0.5 rounded font-mono">{op.dept}</span>
                  <h4 className="font-bold text-[#1E2038]">{op.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{op.loc} • Exp: {op.exp} • Est: {op.pkg}</p>
                  <p className="text-[11px] text-[#64748b] leading-relaxed pt-1">{op.desc}</p>
                </div>
                
                <button
                  onClick={() => handleApplyToOpening(op.title)}
                  className="w-full py-1.5 bg-[#1E2038] hover:bg-[#B1B2FF] hover:text-[#1E2038] text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  Request Transfer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: logged candidates filings */}
        <div className="bg-white border border-[#E0E2E5] rounded-2xl shadow-xs overflow-hidden h-fit">
          <div className="p-4 border-b border-slate-100 bg-slate-55 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4.5 h-4.5 text-[#B1B2FF]" />
              {employee.role === 'HR' ? 'Active Transfer Filings' : 'My Personal Transition Status'}
            </h3>
            <span className="text-xs font-bold text-slate-500">{apps.length}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-semibold">Updating candidate queue...</div>
          ) : apps.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 italic">No transition filings submitted on this account.</div>
          ) : (
            <div className="divide-y divide-slate-100 p-3 space-y-2.5 max-h-[450px] overflow-y-auto">
              {apps.map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 border border-[#E0E2E5] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    {employee.role === 'HR' && (
                      <span className="font-extrabold text-slate-800 block leading-tight">{getEmployeeName(a.employeeId)}</span>
                    )}
                    <strong className="text-slate-700 block font-bold text-[11px]">{a.position}</strong>
                    <span className="text-[9px] text-slate-400 font-mono">ID: {a.id} • Filed {a.appliedDate}</span>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    a.status === 'Offer Made' ? 'bg-[#3AD6A8]/20 text-emerald-800' :
                    a.status === 'Shortlisted' ? 'bg-[#3AD6A8]/20 text-emerald-800 animate-pulse' :
                    a.status === 'Under Review' ? 'bg-[#B1B2FF]/20 text-indigo-900' :
                    a.status === 'Interview Scheduled' ? 'bg-indigo-150 text-indigo-800' : 'bg-red-50 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
