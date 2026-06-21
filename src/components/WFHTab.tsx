/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, Plus, X, Search, Clock, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { WFHRequest, Employee } from '../types';
import { api } from '../lib/api';

interface WFHTabProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function WFHTab({ employee, onRefreshNotifications }: WFHTabProps) {
  const [wfhList, setWfhList] = useState<WFHRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form Fields
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, empList] = await Promise.all([
        api.getWFH(),
        api.getEmployees()
      ]);
      setWfhList(list);
      setEmployees(empList);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyWFH = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!fromDate || !toDate || !reason.trim()) {
      setFormError('All fields with asterisks are strictly required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.applyWFH({ fromDate, toDate, reason });
      setShowApplyModal(false);
      setFromDate('');
      setToDate('');
      setReason('');
      await loadData();
      onRefreshNotifications();
    } catch (err: any) {
      setFormError(err.message || 'WFH filing failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveWFH = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.updateWFHStatus(id, status);
      await loadData();
      onRefreshNotifications();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || `Employee ${empId}`;
  };

  return (
    <div className="space-y-6">
      {/* Target Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1E2038] tracking-tight">Work From Home (WFH) Management</h2>
          <p className="text-xs text-[#64748b]">Portal &gt; WFH Requests Sandbox</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2 bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Request WFH Period
        </button>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification lists (If HR and someone files, or show helpful summaries) */}
        {employee.role === 'HR' && (
          <div className="lg:col-span-3 bg-slate-50 border border-[#E0E2E5] p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-widest flex items-center gap-1.5 border-b border-[#E0E2E5] pb-2">
              <Clock className="w-4 h-4 text-[#B1B2FF]" />
              HR Pending WFH Verification Queue ({wfhList.filter(w => w.status === 'Pending').length})
            </h3>

            {wfhList.filter(w => w.status === 'Pending').length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold italic">There are no outstanding WFH request approvals inside your queue.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {wfhList.filter(w => w.status === 'Pending').map((req) => (
                  <div key={req.id} className="p-3 bg-white border border-[#E0E2E5] rounded-xl flex items-center justify-between gap-4 text-xs">
                    <div>
                      <strong className="text-slate-800 text-xs block">{getEmployeeName(req.employeeId)} ({req.employeeId})</strong>
                      <span className="text-[10px] text-slate-400 font-semibold">Planned: {req.fromDate} to {req.toDate}</span>
                      <p className="text-[11px] text-slate-600 italic block mt-1">Reason: "{req.reason}"</p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleResolveWFH(req.id, 'Approved')}
                        className="p-1 px-2.5 bg-[#3AD6A8] hover:bg-[#32b890] text-slate-900 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleResolveWFH(req.id, 'Rejected')}
                        className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] rounded-lg cursor-pointer transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Primary lists for current logged user */}
        <div className="lg:col-span-3 bg-white border border-[#E0E2E5] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4.5 h-4.5 text-[#B1B2FF]" />
              {employee.role === 'HR' ? 'Company-Wide WFH History' : 'My Personal WFH Requests Logs'}
            </h3>
            <span className="text-xs font-semibold text-slate-500">Filings Count: {wfhList.length}</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500 font-semibold">Loading WFH registries...</div>
          ) : wfhList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 italic">No working from home filings recorded on this account.</div>
          ) : (
            <div className="overflow-x-auto text-[#2E3033]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-500 font-bold uppercase">
                    {employee.role === 'HR' && <th className="px-6 py-2.5">Employee</th>}
                    <th className="px-6 py-2.5">WFH Request ID</th>
                    <th className="px-6 py-2.5 font-mono">From Date</th>
                    <th className="px-6 py-2.5 font-mono">To Date</th>
                    <th className="px-6 py-2.5">Reason Narrative</th>
                    <th className="px-6 py-2.5">Applied on</th>
                    <th className="px-6 py-2.5 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {wfhList.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      {employee.role === 'HR' && (
                        <td className="px-6 py-3 font-bold text-slate-800">{getEmployeeName(req.employeeId)}</td>
                      )}
                      <td className="px-6 py-3 font-mono font-medium text-slate-600">{req.id}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{req.fromDate}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{req.toDate}</td>
                      <td className="px-6 py-3 text-slate-600 italic">"{req.reason}"</td>
                      <td className="px-6 py-3 text-slate-400 font-mono text-[10px]">{req.appliedOn || 'N/A'}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                          req.status === 'Approved' ? 'bg-[#3AD6A8]/20 text-emerald-800' :
                          req.status === 'Pending' ? 'bg-[#B1B2FF]/20 text-indigo-900' :
                          'bg-red-150 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Requests apply modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-100">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Home className="w-5 h-5 text-[#B1B2FF]" />
                <h3 className="font-extrabold text-sm text-[#1E2038]">Filing for Telecommuting Work</h3>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyWFH} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Start Date *</span>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">End Date *</span>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Provide Justification *</span>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Remote system setup at local residence / Personal medical appointment nearby..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none placeholder:text-slate-450 focus:border-[#B1B2FF] transition-all font-semibold text-slate-700"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Filing form...' : 'Submit WFH Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
