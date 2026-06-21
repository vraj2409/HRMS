/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Palmtree, Calendar, Search, MapPin, ChevronLeft, ChevronRight, Sparkles, BookOpen, Tag } from 'lucide-react';
import { Holiday } from '../types';
import { api } from '../lib/api';

export default function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Tab states: 'all' | 'upcoming' | 'hindu' | 'national'
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'hindu' | 'national'>('all');

  // Calendar states
  const TODAY = new Date('2026-06-20'); // Reference local date for HRMS 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // Default to June 2026 (0-indexed: 5)
  const [selectedDay, setSelectedDay] = useState<number | null>(20);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  // Month names list
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getHolidays();
        setHolidays(data);
        
        // Auto-select next upcoming holiday for detail panel
        const future = data.filter(h => new Date(h.date) >= TODAY);
        if (future.length > 0) {
          setSelectedHoliday(future[0]);
          // Align calendar with the selected holiday's month/year
          const hDate = new Date(future[0].date);
          setCurrentYear(hDate.getFullYear());
          setCurrentMonth(hDate.getMonth());
          setSelectedDay(hDate.getDate());
        } else if (data.length > 0) {
          setSelectedHoliday(data[0]);
        }
      } catch (e) {
        console.error("Failed to load holidays database:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter operations
  const filteredHolidays = holidays.filter(hol => {
    // Search keyword match
    const keyword = search.toLowerCase().trim();
    const matchesSearch = 
      (hol.name || '').toLowerCase().includes(keyword) ||
      (hol.type || '').toLowerCase().includes(keyword) ||
      (hol.description || '').toLowerCase().includes(keyword) ||
      (hol.location || '').toLowerCase().includes(keyword) ||
      (hol.hinduMonth || '').toLowerCase().includes(keyword) ||
      (hol.hinduTithi || '').toLowerCase().includes(keyword);

    if (!matchesSearch) return false;

    // Segment tab match
    if (activeTab === 'upcoming') {
      return new Date(hol.date) >= TODAY;
    }
    if (activeTab === 'hindu') {
      // It is a Hindu festival if it has a populated Hindu month or Tithi or is classified as Festival
      return !!(hol.hinduMonth || hol.hinduTithi);
    }
    if (activeTab === 'national') {
      return hol.type === 'National Holiday';
    }
    return true; // 'all'
  });

  // Dynamic counter metrics on all holidays
  const totalCount = holidays.length;
  const upcomingCount = holidays.filter(h => new Date(h.date) >= TODAY).length;
  const hinduCount = holidays.filter(h => h.hinduMonth || h.hinduTithi).length;
  const restrictedCount = holidays.filter(h => h.type === 'Restricted Holiday' || h.type === 'Optional Holiday').length;

  // Calendar helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  // Generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday, 6 is Saturday
  const prevDaysCount = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];

  // Previous month fallback dates representation
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevDaysCount - i,
      month: currentMonth === 0 ? 11 : currentMonth - 1,
      year: currentMonth === 0 ? currentYear - 1 : currentYear,
      isCurrentMonth: false
    });
  }

  // Current month dates
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true
    });
  }

  // Next month leading dates representation to fill grid of 42
  const totalCells = 42;
  const nextMonthCellsNeeded = totalCells - calendarCells.length;
  for (let i = 1; i <= nextMonthCellsNeeded; i++) {
    calendarCells.push({
      day: i,
      month: currentMonth === 11 ? 0 : currentMonth + 1,
      year: currentMonth === 11 ? currentYear + 1 : currentYear,
      isCurrentMonth: false
    });
  }

  // Helper to retrieve holidays on a specific date
  const getHolidaysForDate = (y: number, m: number, d: number) => {
    const formattedStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    return holidays.filter(h => h.date === formattedStr);
  };

  const handleDayClick = (cell: { day: number; month: number; year: number; isCurrentMonth: boolean }) => {
    setSelectedDay(cell.day);
    setCurrentMonth(cell.month);
    setCurrentYear(cell.year);
    
    const hList = getHolidaysForDate(cell.year, cell.month, cell.day);
    if (hList.length > 0) {
      setSelectedHoliday(hList[0]);
    } else {
      setSelectedHoliday(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
            <Palmtree className="w-5 h-5 text-emerald-600" />
            Company Holidays
          </h2>
          <p className="text-xs text-slate-500 font-medium">Dashboard &gt; Office Calendars &gt; India Holidays</p>
        </div>
        <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Reference Date: <span className="font-mono text-emerald-700">June 20, 2026</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-transform hover:scale-[1.01]">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Total Registry</span>
          <div className="text-2xl font-black text-slate-900">{loading ? '...' : totalCount}</div>
          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Whole Calendar Year 2026</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-transform hover:scale-[1.01]">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Upcoming Holidays</span>
          <div className="text-2xl font-black text-blue-600">{loading ? '...' : upcomingCount}</div>
          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Post June 20, 2026</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-transform hover:scale-[1.01]">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Hindu Festivals</span>
          <div className="text-2xl font-black text-amber-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            {loading ? '...' : hinduCount}
          </div>
          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Panchang Lunar Mapped</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-transform hover:scale-[1.01]">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Restricted/Optional</span>
          <div className="text-2xl font-black text-slate-600">{loading ? '...' : restrictedCount}</div>
          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">L2 Approval Requested</span>
        </div>
      </div>

      {/* Holiday Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left list of holidays (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 px-5 py-4 rounded-xl shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3.5 gap-3">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-500" />
                Holidays Catalog & Panchang
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">India Operations (Holiday Schedule 2026)</p>
            </div>
            
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-56 focus-within:border-emerald-500 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-450 shrink-0" />
              <input 
                type="text" 
                placeholder="Search name, month, tithi..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Filtering segments */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold text-center transition-all ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-950 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold text-center transition-all ${
                activeTab === 'upcoming' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab('hindu')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'hindu' 
                  ? 'bg-white text-amber-700 shadow-xs scale-102 border-l-2 border-amber-500' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Hindu Festivals ({hinduCount})
            </button>
            <button
              onClick={() => setActiveTab('national')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold text-center transition-all ${
                activeTab === 'national' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              National
            </button>
          </div>

          {/* Holidays List container */}
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-500 font-medium animate-pulse">
              Parsing secure holiday list from database...
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="py-24 text-center">
              <span className="p-3 bg-slate-50 rounded-full inline-block text-slate-350 mb-3">
                <Calendar className="w-6 h-6 mx-auto" />
              </span>
              <p className="text-xs text-slate-500 font-bold">No holiday matches your filters.</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
                Try widening your inquiry or search keyword (e.g. searching 'Kartika', 'Chaitra', or 'Ambedkar').
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredHolidays.map((hol) => {
                const hDate = new Date(hol.date);
                const isPast = hDate < TODAY;
                const matchesSelected = selectedHoliday && selectedHoliday.id === hol.id;
                
                return (
                  <div 
                    key={hol.id} 
                    onClick={() => {
                      setSelectedHoliday(hol);
                      setSelectedDay(hDate.getDate());
                      setCurrentMonth(hDate.getMonth());
                      setCurrentYear(hDate.getFullYear());
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex items-start justify-between gap-4 ${
                      matchesSelected 
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-100/50' 
                        : isPast 
                          ? 'bg-slate-50/40 border-slate-100 opacity-65 hover:opacity-100 hover:border-slate-205'
                          : 'bg-white border-slate-150 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{hol.name}</h4>
                        
                        {/* Type badges */}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          hol.type === 'National Holiday' ? 'bg-emerald-100 text-emerald-800' :
                          hol.type === 'Festival' ? 'bg-amber-100 text-amber-800' :
                          hol.type === 'Restricted Holiday' ? 'bg-rose-100 text-rose-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {hol.type}
                        </span>

                        {isPast && (
                          <span className="text-[8px] font-bold text-slate-400 bg-slate-200/50 px-1 py-0.2 rounded shrink-0">
                            Concluded
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold line-clamp-2">
                        {hol.description}
                      </p>

                      {/* Hindu calendar Vedic metadata details if present */}
                      {(hol.hinduMonth || hol.hinduTithi) && (
                        <div className="bg-amber-50/60 border border-amber-100 p-1.5 rounded-lg text-[9px] text-amber-805 flex flex-wrap gap-x-2.5 gap-y-1 mt-1 font-mono items-center">
                          <span className="font-bold flex items-center gap-1 text-amber-900">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            Hindu Month: <span className="font-sans font-extrabold">{hol.hinduMonth}</span>
                          </span>
                          <span className="hidden sm:inline text-amber-300">•</span>
                          <span className="text-slate-600 font-bold">
                            Tithi: <span className="font-sans font-medium text-amber-800">{hol.hinduTithi}</span>
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-405 shrink-0" />
                          {hol.location}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center bg-slate-100/70 border border-slate-200/80 rounded-xl px-2.5 py-2 min-w-[58px]">
                      <span className="text-[9px] font-black uppercase text-slate-550 leading-none">
                        {hDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-base font-mono font-black text-slate-800 leading-tight mt-0.5">
                        {hDate.getDate().toString().padStart(2, '0')}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 leading-none tracking-wider mt-0.5">
                        2026
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Holiday Calendar (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Calendar Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Durable Regional Tracker
              </h3>
              
              {/* Previous / Next selection control */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="text-xs font-extrabold text-slate-800 min-w-[95px] text-center uppercase tracking-wide">
                  {monthNames[currentMonth]} {currentYear}
                </div>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar grid widget */}
            <div className="border border-slate-200 p-3 rounded-2xl bg-slate-50/50 space-y-2">
              <div className="flex justify-between font-bold text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-1 rounded-lg">
                <span>Vedic Calendar View</span>
                <span>Active Region Match: India Office</span>
              </div>
              
              {/* Day of week headers */}
              <div className="grid grid-cols-7 text-center font-bold text-[9px] text-slate-400 uppercase py-1 border-b border-slate-100">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              
              {/* Cells list */}
              <div className="grid grid-cols-7 text-center gap-1.5 mt-1">
                {calendarCells.map((cell, index) => {
                  const dayHolidays = getHolidaysForDate(cell.year, cell.month, cell.day);
                  const isHoliday = dayHolidays.length > 0;
                  const isToday = TODAY.getFullYear() === cell.year && 
                                  TODAY.getMonth() === cell.month && 
                                  TODAY.getDate() === cell.day;
                  const isSelected = selectedDay === cell.day && currentMonth === cell.month && currentYear === cell.year;

                  const holidayType = isHoliday ? dayHolidays[0].type : null;

                  let cellColor = "text-slate-705 bg-white border border-slate-100";
                  if (!cell.isCurrentMonth) {
                    cellColor = "text-slate-300 font-light pointer-events-none";
                  } else if (isSelected) {
                    cellColor = "bg-blue-600 text-white font-bold shadow-sm border-blue-600 scale-102";
                  } else if (isHoliday) {
                    if (holidayType === 'National Holiday') {
                      cellColor = "bg-emerald-50 text-emerald-800 border-2 border-emerald-250 font-black cursor-pointer hover:bg-emerald-100/80";
                    } else if (holidayType === 'Festival') {
                      cellColor = "bg-amber-50 text-amber-805 border-2 border-amber-250 font-black cursor-pointer hover:bg-amber-100/80";
                    } else if (holidayType === 'Restricted Holiday') {
                      cellColor = "bg-rose-50 text-rose-800 border-2 border-rose-250 font-black cursor-pointer hover:bg-rose-100/80";
                    } else {
                      cellColor = "bg-sky-50 text-sky-850 border-2 border-sky-250 font-black cursor-pointer hover:bg-sky-100/80";
                    }
                  } else if (isToday) {
                    cellColor = "bg-slate-900 text-white font-bold shadow-xs";
                  } else {
                    cellColor = "bg-white border border-slate-150 text-slate-700 hover:border-slate-300 hover:bg-slate-100/20";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(cell)}
                      disabled={!cell.isCurrentMonth}
                      className={`relative min-h-[32px] sm:min-h-[34px] py-1 text-xs rounded-xl transition-all font-mono font-bold flex flex-col items-center justify-center ${cellColor}`}
                    >
                      <span>{cell.day}</span>
                      
                      {/* Interactive dot flags for holidays inside normal cells when not directly loaded */}
                      {isHoliday && !isSelected && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                          holidayType === 'National Holiday' ? 'bg-emerald-550' :
                          holidayType === 'Festival' ? 'bg-amber-550' :
                          'bg-slate-400'
                        }`} />
                      )}
                      
                      {isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active legend keys */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[9px] pt-1 text-slate-500 font-bold border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-250 inline-block"></span>
                National
              </span>
              <span className="flex items-center gap-1 animate-pulse">
                <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-250 inline-block"></span>
                Hindu Festival
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-50 border border-rose-250 inline-block"></span>
                Restricted
              </span>
              <span className="flex items-center gap-1 border-l pl-2 border-slate-200">
                <span className="w-2.5 h-2.5 rounded bg-slate-900 inline-block"></span>
                Today (Jun 20)
              </span>
            </div>
          </div>

          {/* Detailed Selected Holiday Card */}
          {selectedHoliday ? (
            <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-xl shadow-xs space-y-4 text-left relative overflow-hidden">
              <div className="absolute right-3 top-3 opacity-15">
                <Sparkles className="w-12 h-12 text-amber-600 animate-spin-slow" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] uppercase font-mono font-black text-amber-805 tracking-wider">
                    Holiday Focus Board
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                  {selectedHoliday.name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400">
                  Date Check: {new Date(selectedHoliday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Panchang Hindu lunar descriptors mapping */}
              {(selectedHoliday.hinduMonth || selectedHoliday.hinduTithi) ? (
                <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl p-3 border border-amber-250 space-y-1.5">
                  <h5 className="text-[10px] font-black text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Hindu Lunar Shaka Panchang
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-amber-950">
                    <div>
                      <span className="text-amber-700 block text-[8px] font-sans font-bold uppercase tracking-wider leading-none">Lunar Month</span>
                      <span className="font-bold">{selectedHoliday.hinduMonth || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 block text-[8px] font-sans font-bold uppercase tracking-wider leading-none">Vedic Tithi</span>
                      <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis block">{selectedHoliday.hinduTithi || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-600 font-medium leading-relaxed">
                  This calendar date falls under a civil administrative or global standard classification, bypasses Hindu lunar calendar alignment, and does not carry Shaka tithi attributes.
                </div>
              )}

              <div className="space-y-2 text-[11px] text-slate-650 leading-relaxed font-semibold">
                <p className="border-l-2 border-amber-400 pl-2.5 italic">
                  {selectedHoliday.description}
                </p>
                <div className="space-y-1 text-[10px] text-slate-500 pt-1 font-sans">
                  <div className="flex justify-between border-b border-amber-100/50 pb-1">
                    <span>Applicable Location:</span>
                    <span className="font-bold text-slate-700">{selectedHoliday.location}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Attendance Status:</span>
                    <span className="font-bold text-amber-800">Auto-Present (No deduction)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center text-xs text-slate-400 font-medium leading-relaxed">
              Click on a highlighted holiday date inside the calendar to explore Panchang lunar characteristics, regional alignments, and statutory policies.
            </div>
          )}

          <div className="bg-slate-50 border border-slate-220 p-4 rounded-xl space-y-2 text-[10px] sm:text-[11px] text-slate-600 leading-relaxed text-left">
            <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">India Statutory Holiday Policy</h4>
            <p>1. **General/Gazetted Holidays**: Festivals and major national holidays do not consume your privileged leave balance.</p>
            <p>2. **Restricted Holidays**: Up to two restricted holidays (RH) can be availed per year, requiring department head sign-off at least five days prior.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
