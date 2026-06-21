/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, Star, Search, Plus, ThumbsUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { PerformanceReview, Employee } from '../types';
import { api } from '../lib/api';

interface PerformanceTabProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function PerformanceTab({ employee, onRefreshNotifications }: PerformanceTabProps) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for HR creation
  const [targetEmpId, setTargetEmpId] = useState('');
  const [period, setPeriod] = useState('Annual Evaluation 2025-26');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [revs, emps] = await Promise.all([
        api.getPerformanceReviews(),
        api.getEmployees()
      ]);
      setReviews(revs);
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

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!targetEmpId || !comments.trim()) {
      alert('Please fill in all details.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createPerformanceReview({
        employeeId: targetEmpId,
        period,
        rating,
        comments
      });
      setSuccessMsg('Successfully published evaluation indices!');
      setComments('');
      setTargetEmpId('');
      await loadData();
      onRefreshNotifications();
    } catch (err: any) {
      alert('Review posting failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || `Employee ${empId}`;
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < count ? 'text-[#B1B2FF] fill-[#B1B2FF]' : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1E2038] tracking-tight">Performance Review Portfolio</h2>
          <p className="text-xs text-[#64748b]">Portal &gt; Evaluations & Achievements</p>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 bg-[#1E2038] hover:bg-[#2B2E50] text-white rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-slate-800">
        
        {/* HR Evaluation Form */}
        {employee.role === 'HR' && (
          <form onSubmit={handleCreateReview} className="bg-white border border-[#E0E2E5] p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Plus className="w-4 h-4 text-[#B1B2FF]" />
              Publish Performance Indices
            </h3>

            {successMsg && (
              <div className="p-3 bg-[#3AD6A8]/10 border border-[#3AD6A8]/30 rounded-xl text-emerald-800 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Select Employee *</span>
              <select
                required
                value={targetEmpId}
                onChange={(e) => setTargetEmpId(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E2E5] rounded-xl p-2.5 outline-none font-semibold focus:border-[#B1B2FF] text-slate-700"
              >
                <option value="">-- Click to select colleague --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Rating Index *</span>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-50 border border-[#E0E2E5] rounded-xl p-2.5 outline-none font-semibold focus:border-[#B1B2FF] text-slate-750"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional Talent)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Consistent High Performer)</option>
                <option value={3}>⭐⭐⭐ (3 - Valued Core Deliveries)</option>
                <option value={2}>⭐⭐ (2 - Requires Skill Coaching)</option>
                <option value={1}>⭐ (1 - Non Performance Issue)</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Evaluation Term Duration *</span>
              <input
                type="text"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E2E5] rounded-xl p-2.5 outline-none font-semibold focus:border-[#B1B2FF]"
              />
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Narrative Feedback *</span>
              <textarea
                required
                rows={3}
                placeholder="List major success items, client commendations, and skills growth index..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E2E5] rounded-xl p-2.5 outline-none placeholder:text-slate-400 focus:border-[#B1B2FF] transition-all font-semibold leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing evaluation...' : 'Register Evaluation Star'}
            </button>
          </form>
        )}

        {/* Existing review list */}
        <div className={`${employee.role === 'HR' ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#E0E2E5] rounded-2xl shadow-xs overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 bg-slate-55 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-[#B1B2FF]" />
              {employee.role === 'HR' ? 'Archived Performance Registers' : 'My Career Evaluation History'}
            </h3>
            <span className="text-xs font-bold text-slate-500">Reviews: {reviews.length}</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500 font-semibold">Updating indexes...</div>
          ) : reviews.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 italic">No formal performance registers logged. Get outstanding milestones from HR.</div>
          ) : (
            <div className="divide-y divide-slate-100 p-4 space-y-4 max-h-[550px] overflow-y-auto">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-[#E0E2E5] rounded-xl space-y-3 transition-all relative">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                      {employee.role === 'HR' && (
                        <strong className="text-slate-800 text-xs block font-extrabold">{getEmployeeName(rev.employeeId)} ({rev.employeeId})</strong>
                      )}
                      <span className="text-xs font-bold text-slate-600 block">{rev.period}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Author evaluator: {rev.reviewer} • {rev.completedOn}</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-end gap-1">
                      {renderStars(rev.rating)}
                      <span className="text-[9px] uppercase font-bold text-[#B1B2FF]">Score Code: {rev.rating}/5</span>
                    </div>
                  </div>

                  <div className="bg-white px-3.5 py-2.5 border border-slate-100 rounded-xl leading-relaxed text-xs text-slate-700 font-medium">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#3AD6A8] inline-block mr-1.5 mb-0.5 flex-shrink-0" />
                    "{rev.comments}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
