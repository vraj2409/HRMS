/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Hourglass, Plus, X, Search, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { OTRequest, Employee } from '../types';
import { api } from '../lib/api';

interface OTTabProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function OTTab({ employee, onRefreshNotifications }: OTTabProps) {
  const [otList, setOtList] = useState<OTRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form Fields
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, empList] = await Promise.all([
        api.getOvertime(),
        api.getEmployees()
      ]);
      setOtList(list);
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

  const handleApplyOT = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!date || !hours || !reason.trim()) {
      setFormError('All fields marked with an asterisk must be filled out.');
      return;
    }

    if (hours <= 0 || hours > 16) {
      setFormError('Overtime hours logged must be a positive number up to 16 hours.');
      return;
    }

    setSubmitting(true);
    try {
      await api.logOvertime({ date, hours: Number(hours), reason });
      setShowApplyModal(false);
      setDate('');
      setHours(1);
      setReason('');
      await loadData();
      onRefreshNotifications();
    } catch (err: any) {
      setFormError(err.message || 'OT registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveOT = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.updateOTStatus(id, status);
      await loadData();
      onRefreshNotifications();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || `Employee ${empId}`;
  };

  // Stats summaries
  const totalApprovedHours = otList
    .filter(req => req.status === 'Approved' && (employee.role === 'HR' || req.employeeId === employee.id))
    .reduce((sum, req) => sum + req.hours, 0);

  return (
    <div className="space-y-6">
      {/* Target Title Header */}
      <div className="flex items-center justify-between font-sans text-slate-800">
        <div>
          <h2 className="text-xl font-bold text-[#1E2038] tracking-tight">Overtime (OT) Management</h2>
          <p className="text-xs text-[#64748b]">Portal &gt; Timesheet Compensation Ledger</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2 bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          Log Overtime Hours
        </button>
      </div>

      {/* Overview Stat Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E0E2E5] p-5 rounded-2xl flex items-center justify-between shadow-xs border-l-4 border-l-[#B1B2FF]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Signed Off Compensation Duty</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#1E2038]">{totalApprovedHours} hours</span>
              <span className="text-[10px] text-slate-400 font-bold">Total Approved</span>
            </div>
          </div>
          <Hourglass className="w-8 h-8 text-[#B1B2FF]/50" />
        </div>

        <div className="bg-white border border-[#E0E2E5] p-5 rounded-2xl flex items-center justify-between shadow-xs border-l-4 border-l-[#3AD6A8]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Company Hourly Rates</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#1E2038]">1.5x Base Pay</span>
              <span className="text-[10px] text-slate-400 font-bold">Overtime Policy</span>
            </div>
          </div>
          <Clock className="w-8 h-8 text-[#3AD6A8]/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification list (HR Admin Screen) */}
        {employee.role === 'HR' && (
          <div className="lg:col-span-3 bg-slate-50 border border-[#E0E2E5] p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-widest flex items-center gap-1.5 border-b border-[#E0E2E5] pb-2">
              <Clock className="w-4 h-4 text-[#B1B2FF]" />
              HR Timesheet Overtime approvals queue ({otList.filter(o => o.status === 'Pending').length})
            </h3>

            {otList.filter(o => o.status === 'Pending').length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold italic">There are no outstanding Overtime timesheets waiting for your verification.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {otList.filter(o => o.status === 'Pending').map((req) => (
                  <div key={req.id} className="p-3 bg-white border border-[#E0E2E5] rounded-xl flex items-center justify-between gap-4 text-xs">
                    <div>
                      <strong className="text-slate-800 text-xs block">{getEmployeeName(req.employeeId)} ({req.employeeId})</strong>
                      <span className="text-[10px] text-[#B1B2FF] font-bold font-mono">Date: {req.date} • Session: {req.hours} Hrs logged</span>
                      <p className="text-[11px] text-slate-600 block mt-1 italic">Deliverable: "{req.reason}"</p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleResolveOT(req.id, 'Approved')}
                        className="p-1 px-3 bg-[#3AD6A8] hover:bg-[#32b890] text-slate-900 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all border border-[#3AD6A8]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleResolveOT(req.id, 'Rejected')}
                        className="p-1 px-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] rounded-lg cursor-pointer transition-all"
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

        {/* Primary logs lists */}
        <div className="lg:col-span-3 bg-white border border-[#E0E2E5] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1.5">
              <Hourglass className="w-4.5 h-4.5 text-[#B1B2FF]" />
              {employee.role === 'HR' ? 'Company-Wide Overtime Logs' : 'My Logged Overtime Slots'}
            </h3>
            <span className="text-xs font-semibold text-slate-500">Total logs: {otList.length}</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500 font-semibold">Loading timesheet records...</div>
          ) : otList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 italic">No Overtime logs saved on this personnel.</div>
          ) : (
            <div className="overflow-x-auto text-[#1E2038]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-500 font-bold uppercase">
                    {employee.role === 'HR' && <th className="px-6 py-2.5">Employee</th>}
                    <th className="px-6 py-2.5">Slot ID</th>
                    <th className="px-6 py-2.5 font-mono text-center">Work Shift Date</th>
                    <th className="px-6 py-2.5 text-center">Hours Worked</th>
                    <th className="px-6 py-2.5">Task Description Achievements</th>
                    <th className="px-6 py-2.5">Applied on</th>
                    <th className="px-6 py-2.5 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {otList.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      {employee.role === 'HR' && (
                        <td className="px-6 py-3 font-bold text-slate-800">{getEmployeeName(req.employeeId)}</td>
                      )}
                      <td className="px-6 py-3 font-mono font-medium text-slate-600">{req.id}</td>
                      <td className="px-6 py-3 font-mono text-center text-slate-500">{req.date}</td>
                      <td className="px-6 py-3 font-black text-center text-[#1E2038]">{req.hours} hrs</td>
                      <td className="px-6 py-3 text-slate-600">"{req.reason}"</td>
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

      {/* Modal overlay */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Hourglass className="w-5 h-5 text-[#B1B2FF]" />
                <h3 className="font-extrabold text-sm text-[#1E2038]">Publish Overtime Shift</h3>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyOT} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Overtime Date *</span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Total Hours Worked *</span>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    required
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] transition-all font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Detailed task log achievements *</span>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Critical database hotfix validation or client deployment assistance after standard hours..."
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
                  {submitting ? 'Registering...' : 'Register Overtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
