/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, UserSquare2, Search, Plus, ThumbsUp, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { Interview, Employee } from '../types';
import { api } from '../lib/api';

interface InterviewsProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function InterviewsTab({ employee, onRefreshNotifications }: InterviewsProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states to schedule new candidate interview (HR only)
  const [candName, setCandName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [stage, setStage] = useState<'Screening' | 'Technical Round' | 'HR Round' | 'Final Round' | 'Offer'>('Screening');
  const [datetime, setDatetime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await api.getInterviews();
      setInterviews(list);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!candName || !position || !datetime) {
      setFormError('All fields with asterisks are mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      await api.scheduleInterview({
        candidateName: candName,
        position,
        department,
        stage,
        interviewers: [employee.name, 'Emily Johnson'],
        datetime
      });
      setShowScheduleModal(false);
      setCandName('');
      setPosition('');
      setDatetime('');
      await loadData();
      onRefreshNotifications();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred recording interview.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Title Header */}
      <div className="flex items-center justify-between font-sans text-slate-800">
        <div>
          <h2 className="text-xl font-bold text-[#1E2038] tracking-tight">Recruitment & Interviews</h2>
          <p className="text-xs text-[#64748b]">Portal &gt; Talent Acquisition & Schedules</p>
        </div>
        
        <div className="flex gap-2">
          {employee.role === 'HR' && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-in fade-in"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              Schedule Interview slot
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-50 border border-[#E0E2E5] hover:bg-slate-100 text-[#1E2038] rounded-xl transition-all flex items-center justify-center cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E0E2E5] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-55 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <UserSquare2 className="w-4.5 h-4.5 text-[#B1B2FF]" />
            Active Interview Catalogs ({interviews.length})
          </h3>
          <span className="text-xs font-bold text-[#B1B2FF] bg-[#EEF1FF] px-2 py-0.5 rounded font-mono">HR Console Synchronized</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500 font-semibold">Updating candidate files...</div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">No interview slots listed. Click button above to schedule.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {interviews.map((item) => (
              <div key={item.id} className="p-4 border border-[#E0E2E5] hover:border-[#B1B2FF] hover:bg-[#EEF1FF] rounded-2xl transition-all space-y-4 text-xs bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-[#1E2038] text-sm">{item.candidateName}</h4>
                      <span className="text-[10px] text-slate-400 block font-mono">Interview ID: {item.id}</span>
                    </div>

                    <span className={`inline-block py-0.5 px-2.5 rounded-full font-bold text-[9px] uppercase ${
                      item.status === 'Upcoming' ? 'bg-[#3AD6A8]/20 text-emerald-800' :
                      item.status === 'Feedback Pending' ? 'bg-[#B1B2FF]/20 text-indigo-900 animate-pulse' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Panel fields details */}
                  <div className="bg-white border border-slate-200 p-3 rounded-xl mt-3.5 space-y-2">
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">Job position:</span> <span className="font-bold text-slate-700">{item.position}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">Department:</span> <span className="font-semibold text-slate-700">{item.department}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">Stage Level:</span> <span className="text-[#B1B2FF] font-bold">{item.stage}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">Time Schedule:</span> <span className="text-slate-700 font-bold font-mono">{item.datetime}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#1E2038]">
                  <span className="text-slate-400 font-semibold">Assign Panel:</span>
                  <strong className="font-extrabold truncate max-w-[150px]">{item.interviewers.join(', ')}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating schedule modal window (HR Privilege) */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-55 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-[#B1B2FF]" />
                <h3 className="font-extrabold text-sm text-[#1E2038]">Publish Candidate Session</h3>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="p-5 space-y-4 text-xs font-sans">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-750 p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-650" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Candidate Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Gupta"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Job Title / Vacancy Position *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior UX Architect"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Department *</span>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none text-[#1E2038]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="HR Layout">HR Department</option>
                    <option value="Design">Design Studio</option>
                    <option value="Business">Business analysis</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Review Stage *</span>
                  <select
                    value={stage}
                    onChange={(e: any) => setStage(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none text-[#1E2038]"
                  >
                    <option value="Screening">1. Screening</option>
                    <option value="Technical Round">2. Technical</option>
                    <option value="HR Round">3. HR Panel</option>
                    <option value="Final Round">4. Director Board</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Time Slot Coordinates *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jun 25, 2026 • 11:30 AM"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 outline-none focus:border-[#B1B2FF] font-mono text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Publish Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
