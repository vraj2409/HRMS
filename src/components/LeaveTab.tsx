/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Palmtree, Plus, Info, CheckCircle, Clock, AlertTriangle, FileSpreadsheet, X, Filter, RotateCcw 
} from 'lucide-react';
import { Leave, Employee } from '../types';
import { api } from '../lib/api';

interface LeaveTabProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function LeaveTab({ employee, onRefreshNotifications }: LeaveTabProps) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Leave Form Fields
  const [leaveType, setLeaveType] = useState<'Privilege Leave' | 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Comp Off'>('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Search Filters
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadLeaves = async () => {
    try {
      const list = await api.getLeaves();
      setLeaves(list);
      setFilteredLeaves(list);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Recalculate days count automatically
  useEffect(() => {
    if (fromDate && toDate) {
      const f = new Date(fromDate);
      const t = new Date(toDate);
      const diffTime = Math.abs(t.getTime() - f.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (!isNaN(diffDays) && diffDays > 0) {
        setTotalDays(diffDays);
      }
    }
  }, [fromDate, toDate]);

  const handleApplyFilters = () => {
    let result = [...leaves];
    if (filterType !== 'All') {
      result = result.filter(lv => lv.leaveType === filterType);
    }
    if (filterStatus !== 'All') {
      result = result.filter(lv => lv.status === filterStatus);
    }
    setFilteredLeaves(result);
  };

  const handleResetFilters = () => {
    setFilterType('All');
    setFilterStatus('All');
    setFilteredLeaves(leaves);
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!fromDate || !toDate || !reason.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.applyLeave({
        leaveType,
        fromDate,
        toDate,
        totalDays,
        reason
      });
      // succcess
      setShowApplyModal(false);
      // clear form
      setFromDate('');
      setToDate('');
      setReason('');
      setTotalDays(1);
      // Reload lists
      await loadLeaves();
      onRefreshNotifications();
    } catch (err: any) {
      setFormError(err.message || 'Filing request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Leave Balances (as seen on screenshots page 5)
  const balances = {
    'Privilege Leave': { allowed: 20, used: 5, color: 'bg-emerald-500 border-l-emerald-500' },
    'Sick Leave': { allowed: 12, used: 4, color: 'bg-indigo-500 border-l-indigo-500' },
    'Casual Leave': { allowed: 18, used: 6, color: 'bg-teal-500 border-l-teal-500' },
    'Earned Leave': { allowed: 10, used: 5, color: 'bg-amber-500 border-l-amber-500' },
    'Comp Off': { allowed: 6, used: 2, color: 'bg-slate-500 border-l-slate-500' }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Leave Management</h2>
          <p className="text-xs text-[#64748b]">Dashboard &gt; Leave Management</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2 bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Apply New Leave
        </button>
      </div>

      {/* Balances Board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(balances).map(([type, stats]) => {
          const avail = stats.allowed - stats.used;
          return (
            <div key={type} className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-xs border-l-4 border-l-[#1e40af]">
              <span className="text-[10px] text-[#64748b] font-bold block uppercase tracking-wider mb-1 truncate">{type}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-[#0f172a]">{avail.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-400 font-semibold">of {stats.allowed} Available</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters row */}
      <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-wrap gap-4 items-end shadow-xs justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Leave Type filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#64748b] block">Leave Type</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-1.5 text-xs text-[#334155] outline-none"
            >
              <option value="All">All types</option>
              <option value="Privilege Leave">Privilege Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Comp Off">Comp Off</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#64748b] block">Approval Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-1.5 text-xs text-[#334155] outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-3.5 py-1.5 bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-xs rounded-xl"
            >
              Apply Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <span className="text-[10px] text-slate-500 font-semibold italic">Total balanced allocations used: 17 of 56 Days</span>
      </div>

      {/* Leave History List */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1e293b]">Leave Filing History</h3>
          <span className="text-xs font-semibold text-[#64748b]">Count of records: {filteredLeaves.length}</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500">Retrieving filings...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No leaves requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] text-[#64748b] font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Leave ID</th>
                  <th className="px-6 py-3">Leave Type</th>
                  <th className="px-6 py-3">From Date</th>
                  <th className="px-6 py-3">To Date</th>
                  <th className="px-6 py-3 text-center">Total Days</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Applied On</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLeaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-3.5 font-mono font-medium text-[#1e40af]">{lv.id}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-[#334155]">{lv.leaveType}</span>
                    </td>
                    <td className="px-6 py-3.5 text-[#64748b] font-mono">{lv.fromDate}</td>
                    <td className="px-6 py-3.5 text-[#64748b] font-mono">{lv.toDate}</td>
                    <td className="px-6 py-3.5 font-bold text-center text-slate-700">{lv.totalDays}</td>
                    <td className="px-6 py-3.5 text-[#64748b] max-w-xs truncate" title={lv.reason}>{lv.reason}</td>
                    <td className="px-6 py-3.5 text-[#94a3b8] font-mono">{lv.appliedOn}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-block py-0.5 px-2.5 rounded-full font-bold text-[9px] ${
                        lv.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        lv.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Apply Modal Drawer */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1e40af]" />
                <h3 className="font-bold text-sm text-[#0f172a]">Apply for Leave Absence</h3>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitLeave} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Leave Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748b]">Select Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 text-xs text-[#334155] focus:border-blue-400 outline-none transition-all font-semibold"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Privilege Leave">Privilege Leave (PL)</option>
                  <option value="Earned Leave">Earned Leave (EL)</option>
                  <option value="Comp Off">Comp Off (CO)</option>
                </select>
              </div>

              {/* Date Box Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#64748b]">From Date *</label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2 text-xs text-[#334155] focus:border-blue-400 outline-none font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#64748b]">To Date *</label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2 text-xs text-[#334155] focus:border-blue-400 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Days Calculated banner info */}
              {fromDate && toDate && (
                <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl flex items-center justify-between text-xs text-[#1e40af]">
                  <span className="font-semibold">Absence Period Span:</span>
                  <span className="font-mono font-extrabold text-sm">{totalDays} Working Day(s)</span>
                </div>
              )}

              {/* Reason description text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748b]">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain reasoning clearly for HR review..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 text-xs text-[#334155] focus:border-blue-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                ></textarea>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
