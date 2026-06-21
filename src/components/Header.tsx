/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, Check, Globe, X, Mail, Phone, MapPin, Calendar, Shield, Award, BookOpen, User, Eye, Menu, Building2 } from 'lucide-react';
import { Employee, Notification } from '../types';
import { api } from '../lib/api';

interface HeaderProps {
  employee: Employee;
  notifications: Notification[];
  onRefreshNotifications: () => void;
  onNavigateToTab?: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export default function Header({ 
  employee, 
  notifications, 
  onRefreshNotifications,
  onNavigateToTab,
  onToggleSidebar
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Clock Tickers (Realtime)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      onRefreshNotifications();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // Format greeting
  const getGreeting = () => {
    const hrs = currentTime.getHours();
    if (hrs < 12) return 'Good Morning,';
    if (hrs < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [workHoursConfig, setWorkHoursConfig] = useState(8);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [activeThemeAccent, setActiveThemeAccent] = useState('Classic Amber');
  const [selectedBrowseEmployee, setSelectedBrowseEmployee] = useState<Employee | null>(null);

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [availablePolicies, setAvailablePolicies] = useState<any[]>([]);

  // Fetch reference pools for instant search validation
  useEffect(() => {
    api.getEmployees().then(setAvailableEmployees).catch(console.error);
    api.getPolicies().then(setAvailablePolicies).catch(console.error);
  }, []);

  // Search filter math
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchEmployeeResults = trimmedQuery.length > 1
    ? availableEmployees.filter(emp => emp.name.toLowerCase().includes(trimmedQuery) || emp.department.toLowerCase().includes(trimmedQuery) || emp.title.toLowerCase().includes(trimmedQuery))
    : [];
  const searchPolicyResults = trimmedQuery.length > 1
    ? availablePolicies.filter(p => p.name.toLowerCase().includes(trimmedQuery) || p.category.toLowerCase().includes(trimmedQuery))
    : [];

  const hasSearchResults = searchEmployeeResults.length > 0 || searchPolicyResults.length > 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-10 font-sans text-slate-800">
      {/* Search & Greeting Section */}
      <div className="flex items-center gap-3 lg:gap-6 relative">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            aria-label="Open Navigation Drawer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Small branding icon for mobile viewport */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#B1B2FF] flex items-center justify-center text-slate-900 font-bold text-xs shadow-sm shrink-0">
            <Building2 className="w-4 h-4 text-slate-900" />
          </div>
          <span className="font-extrabold text-[#1E2038] tracking-tight leading-none text-xs hidden sm:inline-block">OriginEdge</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl w-64 bg-slate-50 focus-within:border-[#B1B2FF] focus-within:bg-white transition-all relative">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-700 w-full font-medium"
          />
        </div>

        {/* Global Search auto suggestions drop-down results */}
        {searchQuery.trim().length > 1 && (
          <div className="absolute left-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 p-4 space-y-3.5 max-h-[350px] overflow-y-auto animate-in fade-in duration-75">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Search Results</span>
              <button type="button" onClick={() => setSearchQuery('')} className="text-[9px] font-bold text-[#B1B2FF] hover:underline cursor-pointer">Clear</button>
            </div>

            {!hasSearchResults ? (
              <p className="text-[11px] text-slate-400 italic py-2">No matching employees, departments or corporate policies found.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {searchEmployeeResults.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-[#B1B2FF] uppercase tracking-wider block">Co-workers found ({searchEmployeeResults.length})</span>
                    <div className="space-y-1">
                      {searchEmployeeResults.slice(0, 5).map(emp => (
                        <button
                          type="button"
                          key={emp.id}
                          onClick={() => {
                            setSelectedBrowseEmployee(emp);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-2.5 bg-slate-50 hover:bg-[#B1B2FF]/10 rounded-lg flex items-center justify-between transition-all cursor-pointer group text-xs border border-transparent hover:border-[#B1B2FF]/30"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block group-hover:text-[#B1B2FF]">{emp.name}</span>
                            <span className="text-[9px] text-[#64748b] block">{emp.title} • {emp.department}</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-mono italic">{emp.location}</span>
                            <span className="text-[8px] font-bold text-[#B1B2FF] bg-[#EEF1FF] px-1 py-0.5 rounded mt-0.5 uppercase tracking-wide">View Profile</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchPolicyResults.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-[#3AD6A8] uppercase tracking-wider block">Matching Regulations ({searchPolicyResults.length})</span>
                    <div className="space-y-1">
                      {searchPolicyResults.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 hover:bg-[#3AD6A8]/10 rounded-lg">
                          <span className="font-bold text-slate-800 block">{p.name}</span>
                          <span className="text-[9px] text-[#64748b] block">{p.category} • Ver {p.version}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Alerts Center & Display Avatar */}
      <div className="flex items-center gap-5 text-xs">
        <div className="hidden lg:block text-right">
          <p className="text-sm font-semibold text-slate-900">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-[11px] text-slate-400 font-mono font-medium">{formattedTime} IST</p>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>

        {/* Global Live Portal Status indicator next to Notification Bell */}
        <div className="text-[10px] font-bold text-[#1E2038] bg-[#EEF1FF] border border-[#D2DAFF] px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
          <span>LIVE PORTAL</span>
        </div>

        {/* Dynamic Notification center dropdown list */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all relative cursor-pointer"
            aria-label="Notifications Panel"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#B1B2FF] text-slate-900 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-35 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-[#1E2038] text-white rounded-t-xl">
                <span className="text-xs font-bold uppercase tracking-wide">Inbox Alerts ({unreadCount})</span>
                <span className="text-[10px] text-slate-300 font-medium font-mono">Synced</span>
              </div>
              
              <div className="divide-y divide-slate-100 font-sans">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No messages inside inbox logs.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 hover:bg-slate-100 transition-all ${!notif.read ? 'bg-[#B1B2FF]/10' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-800">{notif.title}</h5>
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="p-0.5 bg-[#B1B2FF]/20 hover:bg-[#B1B2FF]/30 text-slate-900 rounded transition-all cursor-pointer animate-none"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 text-[#B1B2FF]" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-semibold">{notif.message}</p>
                      <span className="text-[9px] text-[#64748b] mt-1.5 block font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings button redirects to Profile Tab directly */}
        <button 
          onClick={() => {
            if (onNavigateToTab) {
              onNavigateToTab('profile');
            } else {
              setShowSettingsModal(true);
            }
          }}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer" 
          title="Open Profile"
          aria-label="Profile Settings"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User context badge */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <h3 className="text-xs font-semibold text-slate-800 leading-none">{employee.name}</h3>
            <span className="text-[10px] text-slate-400 font-medium leading-none block mt-1 uppercase tracking-tight">{employee.title}</span>
          </div>
          <div className="w-9 h-9 rounded bg-[#B1B2FF] flex items-center justify-center text-slate-900 font-extrabold text-sm shadow-sm">
            {employee.avatar ? (
              <img src={employee.avatar} alt="Avatar" className="w-full h-full rounded object-cover" />
            ) : (
              employee.name.split(' ').map((n: string) => n[0]).join('')
            )}
          </div>
        </div>
      </div>

      {/* Actual functional Settings Modal dialog */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#B1B2FF]" />
                <h3 className="font-extrabold text-sm text-[#1E2038]">HRMS Workspace Settings</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer">
                <Check className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                Configure local visual preferences, active reporting timelines, and compliance rules directly inside this sandbox terminal.
              </p>

              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Default Official Work Day</span>
                  <div className="flex gap-2">
                    {[7, 8, 9].map((hr) => (
                       <button
                         key={hr}
                         onClick={() => setWorkHoursConfig(hr)}
                         className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                           workHoursConfig === hr 
                             ? 'bg-[#B1B2FF]/10 text-[#B1B2FF] border-[#B1B2FF]' 
                             : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                         }`}
                       >
                         {hr} Hours / Day
                       </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Language Index Preference</span>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-800 focus:border-[#B1B2FF] transition-all"
                  >
                    <option value="English">English (United States) — Standard</option>
                    <option value="Hindi">हिन्दी (Hindi) — Regional</option>
                    <option value="Spanish">Español (Castilian) — Global</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Active Corporate Palette Accent</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#B1B2FF]"></span>
                      <span>Lavender & Periwinkle Palette</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wide bg-[#3AD6A8]/20 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Verified Active</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    alert("Settings successfully synchronized with MongoDB database schema parameters!");
                    setShowSettingsModal(false);
                  }}
                  className="py-2.5 px-5 bg-[#1E2038] hover:bg-[#2B2E50] hover:border-[#B1B2FF] border border-transparent text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Save & Apply Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Profile Preview Modal for Search Results */}
      {selectedBrowseEmployee && (
        <div className="fixed inset-0 bg-[#0f172a]/70 flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
            
            {/* Modal Header banner */}
            <div className="px-6 py-4 border-b border-slate-100 bg-[#1E2038] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B1B2FF]/10 border border-[#B1B2FF]/20 flex items-center justify-center text-[#B1B2FF]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">Co-worker Digital Identity Card</h3>
                  <p className="text-[10px] text-slate-350">HR Verified Profile Record ({selectedBrowseEmployee.id})</p>
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
                  <p className="text-xs text-slate-500 font-semibold">{selectedBrowseEmployee.title} • {selectedBrowseEmployee.department}</p>
                  <p className="text-[10px] text-slate-405 font-mono">{selectedBrowseEmployee.email}</p>
                </div>
                <div className="md:ml-auto text-center md:text-right shrink-0">
                  <span className="inline-block py-1 px-2.5 bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-md font-bold text-[10px] uppercase tracking-wider">
                    {selectedBrowseEmployee.role} View
                  </span>
                  <p className="text-[9px] text-slate-400 font-medium font-mono mt-1">Joined: {selectedBrowseEmployee.dateOfJoining}</p>
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
                      <span className="text-slate-450 font-medium font-mono">Mobile Contact Line</span>
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
                    Administrative & National IDs
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
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium font-mono">Passport Credentials</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.personalInfo.passportNo || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55">
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
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-450 font-medium">Birthdate Index</span>
                      <strong className="text-slate-705 font-mono">{selectedBrowseEmployee.personalInfo.dob}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-55">
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
                    <div className="flex justify-between py-1 border-b border-slate-55">
                      <span className="text-slate-450 font-medium font-mono font-bold">Priority Emergency Phone</span>
                      <strong className="text-slate-755 font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                        {selectedBrowseEmployee.emergencyContact.phone}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Skills Area */}
              <div className="bg-slate-50/60 p-4 border border-slate-205 rounded-xl space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Acquired Professional Capability Skills Index</span>
                <div className="flex flex-wrap gap-2">
                  {selectedBrowseEmployee.skills && selectedBrowseEmployee.skills.length > 0 ? (
                    selectedBrowseEmployee.skills.map((skill, index) => (
                      <div key={index} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center gap-2 font-semibold">
                        <span className="text-slate-800">{skill.name}</span>
                        <span className="text-[#B1B2FF] font-mono text-[10px] font-extrabold bg-[#EEF1FF] px-1 rounded">{skill.percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No professional skill badges declared.</span>
                  )}
                </div>
              </div>

              {/* Academic Portfolio section */}
              <div className="bg-white p-4.5 border border-slate-150 rounded-xl space-y-3 shadow-xs">
                <h5 className="border-b border-slate-100 pb-1.5 text-[10px] uppercase font-extrabold text-[#1E2038] tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Educational Curriculum Matrix
                </h5>
                <div className="space-y-2">
                  {selectedBrowseEmployee.education && selectedBrowseEmployee.education.length > 0 ? (
                    selectedBrowseEmployee.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100 text-[11px]">
                        <div>
                          <span className="font-extrabold text-slate-800 block">{edu.degree}</span>
                          <span className="text-slate-500 font-medium mt-0.5 block">{edu.school}</span>
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
                className="py-2.5 px-6 bg-[#1E2038] hover:bg-[#2B2E50] text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Close Profile Panel
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
