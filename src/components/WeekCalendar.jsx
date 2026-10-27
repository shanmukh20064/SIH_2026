import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarCheck2
} from 'lucide-react';

export default function WeekCalendar({ onSelectDay, showToast }) {
  // Current week anchor date (Defaults to Oct 8, 2026)
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2026, 9, 5)); // Oct 5, 2026 (Monday)
  const [selectedDateObj, setSelectedDateObj] = useState(new Date(2026, 9, 8)); // Oct 8, 2026 (Thursday)
  
  // Timeframe selector state
  const [timeframe, setTimeframe] = useState('Week');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Full Month Calendar Modal state
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);
  const [modalMonth, setModalMonth] = useState(9); // 9 = October (0-indexed)
  const [modalYear, setModalYear] = useState(2026);

  // Month names
  const monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate 7 days for the active week starting from currentWeekStart
  const generateWeekDays = () => {
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      
      // Determine status dot color based on simulated hearings
      let dotColor = '#9A8F89';
      if (d.getDate() === 8) dotColor = '#A8582F'; // Active hearing session
      else if (d.getDate() === 6 || d.getDate() === 20) dotColor = '#3F7D5B'; // Approved
      else if (d.getDate() === 7 || d.getDate() === 15) dotColor = '#C86432'; // In Scrutiny
      else if (d.getDate() === 9 || d.getDate() === 23) dotColor = '#C0392B'; // Deadline

      days.push({
        name: dayNames[i],
        date: d.getDate(),
        fullDate: d,
        month: d.getMonth(),
        year: d.getFullYear(),
        dotColor,
      });
    }
    return days;
  };

  const weekDays = generateWeekDays();

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
    showToast && showToast(`Showing scrutiny schedule: ${monthNames[prev.getMonth()]} ${prev.getFullYear()}`, 'info');
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
    showToast && showToast(`Showing scrutiny schedule: ${monthNames[next.getMonth()]} ${next.getFullYear()}`, 'info');
  };

  const handleSelectDay = (item) => {
    setSelectedDateObj(item.fullDate);
    if (onSelectDay) {
      onSelectDay(item);
    }
    showToast && showToast(`Active Scrutiny Hearings for ${item.name}, ${item.date} ${monthNames[item.month]} ${item.year}`, 'info');
  };

  const isSelected = (d) => {
    return (
      d.getDate() === selectedDateObj.getDate() &&
      d.getMonth() === selectedDateObj.getMonth() &&
      d.getFullYear() === selectedDateObj.getFullYear()
    );
  };

  // Full Month Calendar Days Generator
  const generateMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-based offset
    const startOffset = (firstDay + 6) % 7;
    const cells = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }
    return cells;
  };

  const hearingEvents = {
    5: { title: 'Dossier Pre-screening', type: 'info' },
    8: { title: '3 Scrutiny Hearings (Apex, XYZ, DEF)', type: 'active' },
    12: { title: 'Land Title Review Session', type: 'warning' },
    15: { title: 'Fire NOC Rectification Deadline', type: 'danger' },
    22: { title: 'Extension of Approval Board', type: 'success' },
    28: { title: 'Scrutiny Findings Gazetted', type: 'info' },
  };

  return (
    <div className="w-full h-[96px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.06)] px-4 py-2 flex items-center justify-between select-none transition-all relative">
      {/* 1. Month Navigator (< OCT 2026 >) */}
      <div className="flex items-center gap-1 min-w-[110px]">
        <button
          onClick={handlePrevWeek}
          title="Previous week"
          className="p-1.5 text-[#6B5F59] hover:text-[#2B2321] hover:bg-[#EDE4DC]/60 rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
        <span className="text-[12.5px] font-bold text-[#2B2321] tracking-wide whitespace-nowrap">
          {monthNames[weekDays[3].month]} {weekDays[3].year}
        </span>
        <button
          onClick={handleNextWeek}
          title="Next week"
          className="p-1.5 text-[#6B5F59] hover:text-[#2B2321] hover:bg-[#EDE4DC]/60 rounded-full transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. 7 Days Interactive Strip */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-1 max-w-[560px]">
        {weekDays.map((item) => {
          const active = isSelected(item.fullDate);
          return (
            <button
              key={`${item.month}-${item.date}`}
              onClick={() => handleSelectDay(item)}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                active
                  ? 'w-[52px] h-[66px] rounded-[10px] bg-[#A8582F] text-white shadow-md -translate-y-0.5 scale-105'
                  : 'w-[44px] h-[60px] rounded-[8px] hover:bg-[#EDE4DC]/60 text-[#2B2321]'
              }`}
            >
              <span
                className={`text-[11px] leading-tight ${
                  active ? 'text-white/90 font-medium' : 'text-[#8A7E78]'
                }`}
              >
                {item.name}
              </span>
              <span
                className={`text-[15px] font-bold mt-0.5 ${
                  active ? 'text-white' : 'text-[#2B2321]'
                }`}
              >
                {item.date}
              </span>
              {/* Dynamic Status Dot Indicator */}
              <span
                className="w-[4.5px] h-[4.5px] rounded-full mt-1 transition-all"
                style={{
                  backgroundColor: active ? '#FFFFFF' : item.dotColor,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* 3. Right: Full Calendar Button & Timeframe Dropdown */}
      <div className="flex items-center gap-2 relative">
        {/* Full Month Calendar Opener */}
        <button
          onClick={() => setIsFullCalendarOpen(true)}
          title="Open Master Scrutiny Calendar"
          className="w-[34px] h-[34px] rounded-[8px] bg-white border border-[#EDE4DC] flex items-center justify-center text-[#A8582F] hover:bg-[#F3DFD2]/40 hover:border-[#A8582F] transition-all shadow-xs cursor-pointer"
        >
          <CalendarIcon className="w-[16px] h-[16px] stroke-[2.2]" />
        </button>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            className="h-[34px] px-3 bg-white border border-[#EDE4DC] rounded-[8px] text-[12px] font-semibold text-[#2B2321] flex items-center gap-1.5 hover:bg-[#F3DFD2]/40 hover:border-[#A8582F] transition-all shadow-xs cursor-pointer"
          >
            <span>{timeframe}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8A7E78] transition-transform ${isTimeframeOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTimeframeOpen && (
            <div className="absolute right-0 top-[40px] w-[180px] bg-white border border-[#EDE4DC] rounded-[10px] shadow-xl py-1.5 z-50 text-[12px] animate-dropdown">
              {[
                { key: 'Day', label: 'Day (Daily Queue)' },
                { key: 'Week', label: 'Week (Dossier Schedule)' },
                { key: 'Month', label: 'Month (Cycle View)' },
                { key: 'Term', label: 'Annual Regulatory Term' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setTimeframe(opt.key);
                    setIsTimeframeOpen(false);
                    showToast && showToast(`Switched scrutiny view to: ${opt.label}`, 'info');
                  }}
                  className={`w-full text-left px-3.5 py-1.5 transition-colors cursor-pointer flex items-center justify-between ${
                    timeframe === opt.key ? 'bg-[#F3DFD2]/50 text-[#A8582F] font-bold' : 'text-[#2B2321] hover:bg-[#F7F2EE]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {timeframe === opt.key && <CheckCircle className="w-3.5 h-3.5 text-[#A8582F]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MASTER SCRUTINY FULL CALENDAR MODAL                         */}
      {/* ============================================================== */}
      {isFullCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-dropdown">
          <div className="bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[620px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
                  <CalendarCheck2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-serif text-[18px] font-bold text-[#2B2321]">
                    AICTE Master Scrutiny & Hearing Schedule
                  </h3>
                  <p className="text-xs text-[#8A7E78]">
                    Regulatory timeline for Extension of Approvals (2026-2027)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFullCalendarOpen(false)}
                className="p-1.5 rounded-full text-[#8A7E78] hover:text-[#2B2321] hover:bg-[#EDE4DC]/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Month & Year Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#F7F2EE] border-b border-[#EDE4DC]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (modalMonth === 0) {
                      setModalMonth(11);
                      setModalYear(modalYear - 1);
                    } else {
                      setModalMonth(modalMonth - 1);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-white text-[#2B2321] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-serif text-[15px] font-bold text-[#2B2321]">
                  {fullMonthNames[modalMonth]} {modalYear}
                </span>
                <button
                  onClick={() => {
                    if (modalMonth === 11) {
                      setModalMonth(0);
                      setModalYear(modalYear + 1);
                    } else {
                      setModalMonth(modalMonth + 1);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-white text-[#2B2321] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-semibold text-[#A8582F] bg-[#F3DFD2] px-2.5 py-1 rounded-full">
                Approval Session 2026
              </span>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11.5px] text-[#8A7E78] mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {generateMonthDays(modalYear, modalMonth).map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-[46px] rounded-[8px]" />;
                  }

                  const isCurSelected =
                    modalYear === selectedDateObj.getFullYear() &&
                    modalMonth === selectedDateObj.getMonth() &&
                    day === selectedDateObj.getDate();

                  const event = hearingEvents[day];

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const newD = new Date(modalYear, modalMonth, day);
                        setSelectedDateObj(newD);
                        // Also adjust week strip to this day
                        const monday = new Date(newD);
                        const dayOfWeek = (monday.getDay() + 6) % 7;
                        monday.setDate(monday.getDate() - dayOfWeek);
                        setCurrentWeekStart(monday);
                        setIsFullCalendarOpen(false);
                        showToast && showToast(`Selected scrutiny date: ${day} ${fullMonthNames[modalMonth]} ${modalYear}`, 'info');
                      }}
                      className={`h-[48px] rounded-[10px] p-1 flex flex-col items-center justify-between transition-all cursor-pointer border ${
                        isCurSelected
                          ? 'bg-[#A8582F] text-white border-[#A8582F] shadow-sm font-bold'
                          : event
                          ? 'bg-white border-[#A8582F]/40 hover:border-[#A8582F] text-[#2B2321]'
                          : 'bg-white border-[#EDE4DC] hover:bg-[#F3DFD2]/30 text-[#2B2321]'
                      }`}
                      title={event ? event.title : `Select ${day} ${fullMonthNames[modalMonth]}`}
                    >
                      <span className="text-[12px] font-semibold">{day}</span>
                      {event && (
                        <span
                          className={`w-[6px] h-[6px] rounded-full ${
                            isCurSelected ? 'bg-white' : event.type === 'danger' ? 'bg-[#C0392B]' : 'bg-[#A8582F]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scheduled Events Legend */}
              <div className="mt-5 pt-3 border-t border-[#EDE4DC] flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-[#2B2321]">Scrutiny Hearing Highlights:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5E524C]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A8582F]" />
                    <span>8 Oct: 3 Scrutiny Hearings Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
                    <span>15 Oct: Fire NOC Deficiency Deadline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3F7D5B]" />
                    <span>22 Oct: Extension of Approval Board</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0F3D36]" />
                    <span>28 Oct: Official Decisions Gazetted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#EDE4DC] bg-white flex justify-end">
              <button
                onClick={() => setIsFullCalendarOpen(false)}
                className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-semibold rounded-[8px] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
