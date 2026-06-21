/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Download, Check, Eye, HelpCircle, FileText, Bookmark, BookOpen } from 'lucide-react';
import { Policy } from '../types';
import { api } from '../lib/api';

export default function PoliciesTab() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acknowledgedList, setAcknowledgedList] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPolicies();
        setPolicies(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAcknowledge = (id: string, name: string) => {
    if (acknowledgedList.includes(id)) return;
    setAcknowledgedList(prev => [...prev, id]);
    setSuccessMsg(`Thank you! You have logged your acknowledgement for '${name}'. This has been recorded on the HR compliance log.`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const filtered = policies.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#2E3033] tracking-tight">Company Policy</h2>
        <p className="text-xs text-[#64748b]">Dashboard &gt; Company Policy</p>
      </div>

      {/* Quick Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs py-3 px-4 rounded-xl font-medium flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Total Policies Catalog</span>
          <div className="text-xl font-extrabold text-[#0f172a]">24</div>
          <span className="text-[9px] text-[#64748b] font-medium block mt-0.5">Across All Categories</span>
        </div>

        <div className="bg-white border border-[#E0E2E5] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Mandatory Frameworks</span>
          <div className="text-xl font-extrabold text-[#1E2038]">12</div>
          <span className="text-[9px] text-[#B1B2FF] font-bold bg-[#EEF1FF] px-2 py-0.5 mt-1 rounded inline-block">Requires Acknowledgement</span>
        </div>

        <div className="bg-white border border-[#E0E2E5] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Last Updated Stamp</span>
          <div className="text-xl font-extrabold text-[#3AD6A8] font-mono">May 10, 2026</div>
          <span className="text-[9px] text-[#64748b] font-medium block mt-0.5">Systems sync complete</span>
        </div>

        <div className="bg-white border border-[#E0E2E5] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Recent Catalog Downloads</span>
          <div className="text-xl font-extrabold text-[#2E3033]">156</div>
          <span className="text-[9px] text-[#64748b] font-medium block mt-0.5">Last 30 Days</span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left main directory list */}
        <div className="lg:col-span-2 bg-white border border-[#E0E2E5] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-[#2E3033]">Published Policies</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl w-56">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search policy name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-2">Policy Structure</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2 text-center">Version</th>
                  <th className="px-4 py-2">Importance</th>
                  <th className="px-4 py-2 text-right">Action Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-slate-400">Loading regulations...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-slate-400">No matching frameworks found.</td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isAcked = acknowledgedList.includes(p.id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3.5 font-bold text-[#334155] flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#B1B2FF]" />
                          <span>{p.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-semibold">{p.category}</td>
                        <td className="px-4 py-3.5 text-center font-mono text-slate-500">{p.version}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                            p.status === 'Mandatory' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                          {p.status === 'Mandatory' && (
                            <button
                              disabled={isAcked}
                              onClick={() => handleAcknowledge(p.id, p.name)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                isAcked 
                                  ? 'bg-green-50 text-[#3AD6A8] border-green-200' 
                                  : 'bg-[#B1B2FF] hover:bg-[#9FA0F0] text-slate-900 border-[#B1B2FF]'
                              }`}
                            >
                              {isAcked ? '✓ Logged' : 'Acknowledge'}
                            </button>
                          )}
                          <button className="p-1.5 hover:bg-slate-100 text-[#64748b] rounded-lg transition-all" title="View PDF">
                            <Eye className="w-3.5 h-3.5" />
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

        {/* Right Categories index list */}
        <div className="bg-white border border-[#E0E2E5] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <BookOpen className="w-4 h-4 text-[#B1B2FF]" />
            <h3 className="text-sm font-bold text-[#1E2038]">Policy Categories</h3>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Workplace Conduct', count: 6 },
              { label: 'Workplace Rules', count: 3 },
              { label: 'Leave Allowances', count: 3 },
              { label: 'Flexible Working', count: 2 },
              { label: 'Compensation Metrics', count: 2 },
              { label: 'Performance Standards', count: 2 },
              { label: 'Information Security Protocols', count: 2 },
              { label: 'Financial Compliance', count: 1 },
              { label: 'Others', count: 2 }
            ].map((cat, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[#334155] font-semibold">{cat.label}</span>
                <span className="font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{cat.count}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#B1B2FF]/10 p-4 border border-[#B1B2FF]/30 rounded-xl space-y-2">
            <h4 className="text-[11px] font-bold text-[#1E2038] uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#B1B2FF]" />
              Need Compliance Help?
            </h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              For any clarifying questions about workplace frameworks or labor rules, please reach out directly to <a href="mailto:hr@originedge.com" className="text-[#B1B2FF] underline font-bold">hr@originedge.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
