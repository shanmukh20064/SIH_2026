import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  FileText,
  Building2,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Phone,
  Activity,
  X,
  FileCheck2,
  UploadCloud,
  FilePlus,
  Clock,
  MessageSquareCode,
  LogOut
} from 'lucide-react';
import Hoverboard from './Hoverboard';

export default function Navbar({
  currentUser,
  activeNav = 'home',
  setActiveNav,
  onOpenUserSwitch,
  onLogout,
  onOpenNewApp,
  onOpenUpload,
  onOpenTrack,
  onOpenVerify,
  onOpenAiWorkflow,
  onOpenAiWalkthrough,
  onOpenRules,
  onOpenReport,
  onOpenInstitutions,
  onOpenAudit,
  onOpenStorageFiles,
  onSearch,
  showToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'applications' | 'institutions' | 'regulatory' | 'reports' | 'help' | null
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownTimerRef = useRef(null);
  const containerRef = useRef(null);

  const notifications = [
    { id: 1, title: 'Fire NOC Discrepancy Flagged', app: 'AICTE-2026-001243', time: '10 min ago', unread: true },
    { id: 2, title: 'Building Completion Verified', app: 'AICTE-2026-001244', time: '1 hour ago', unread: true },
    { id: 3, title: 'New Application Ingested', app: 'AICTE-2026-001245', time: '2 hours ago', unread: false },
  ];

  const handleMouseEnter = (menuKey) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setIsSearchOpen(false);
    setIsNotificationOpen(false);
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 280);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
    showToast && showToast(`Searching dossiers matching "${searchQuery}"`, 'info');
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsNotificationOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="relative z-50 w-full flex flex-col gap-2 select-none" ref={containerRef}>
      {/* ============================================================== */}
      {/* 1. TOP HORIZONTAL NAVIGATION STRIP (Phase 1 match)             */}
      {/* ============================================================== */}
      <div className="w-full h-[50px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] px-2.5 lg:px-3.5 flex items-center justify-between shadow-[0_2px_10px_rgba(120,80,50,0.04)] relative z-40 overflow-visible">
        {/* Horizontal Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-5 py-1 flex-shrink-0 overflow-visible">
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(null);
              setIsSearchOpen(false);
              setIsNotificationOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showToast && showToast('AICTE Regulatory Portal • Dashboard Overview', 'info');
            }}
            className="px-2 py-1 rounded-[8px] text-[12.5px] lg:text-[13px] font-medium text-[#2B2321] hover:text-[#B35E35] hover:bg-[#F3DFD2]/40 transition-colors cursor-pointer whitespace-nowrap"
          >
            Home
          </button>

          {/* Applications ▾ (Hoverboard trigger - Active copper button matching Image 2) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('applications')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsNotificationOpen(false);
                setActiveDropdown(activeDropdown === 'applications' ? null : 'applications');
              }}
              className={`px-3 py-1.5 rounded-[9px] text-[12.5px] lg:text-[13px] font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                activeDropdown === 'applications'
                  ? 'bg-[#9E4D27] text-white ring-2 ring-[#B35E35]/30'
                  : 'bg-[#B35E35] hover:bg-[#9E4D27] text-white'
              }`}
            >
              <span>Applications</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/90 transition-transform ${activeDropdown === 'applications' ? 'rotate-180' : ''}`} />
            </button>

            {/* Applications Hoverboard Dropdown */}
            {activeDropdown === 'applications' && (
              <div
                className="absolute left-0 top-[42px] z-50 animate-dropdown"
                onMouseEnter={() => handleMouseEnter('applications')}
                onMouseLeave={handleMouseLeave}
              >
                <Hoverboard
                  isOpen={true}
                  onClose={() => setActiveDropdown(null)}
                  onOpenNewApp={() => {
                    setActiveDropdown(null);
                    onOpenNewApp && onOpenNewApp();
                  }}
                  onOpenUpload={() => {
                    setActiveDropdown(null);
                    onOpenUpload && onOpenUpload();
                  }}
                  onOpenTrack={() => {
                    setActiveDropdown(null);
                    onOpenTrack && onOpenTrack();
                  }}
                  onOpenVerify={() => {
                    setActiveDropdown(null);
                    onOpenVerify && onOpenVerify();
                  }}
                  onOpenAiWorkflow={() => {
                    setActiveDropdown(null);
                    onOpenAiWorkflow && onOpenAiWorkflow();
                  }}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* Institutions ▾ */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('institutions')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsNotificationOpen(false);
                setActiveDropdown(activeDropdown === 'institutions' ? null : 'institutions');
              }}
              className={`px-2 py-1 rounded-[8px] text-[12.5px] lg:text-[13px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeDropdown === 'institutions'
                  ? 'bg-[#0E453A] text-white shadow-xs'
                  : 'text-[#2B2321] hover:text-[#B35E35] hover:bg-[#F3DFD2]/40'
              }`}
            >
              <span>Institutions</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'institutions' ? 'rotate-180 text-white' : 'text-[#8A7E78]'}`} />
            </button>

            {activeDropdown === 'institutions' && (
              <div
                className="absolute left-0 top-[42px] z-50 w-[280px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-2xl p-2.5 animate-dropdown"
                onMouseEnter={() => handleMouseEnter('institutions')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="pb-1.5 mb-1.5 border-b border-[#EDE4DC] px-2 text-[11px] font-bold text-[#8A7E78] uppercase tracking-wider">
                  Institutional Portals
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenInstitutions && onOpenInstitutions();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#A8582F]" />
                  <div className="flex flex-col">
                    <span>Authorized Institution Profile</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">PID AICTE-1-10928374 Apex Tech</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenInstitutions && onOpenInstitutions();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0E453A]" />
                  <div className="flex flex-col">
                    <span>Colleges Registry Directory</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Accredited Technical Institutes</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    showToast && showToast('Intake Capacity Matrix: 600 Approved Seats for 2026-27', 'info');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <div className="flex flex-col">
                    <span>Intake &amp; Programs Matrix</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Undergraduate &amp; Postgrad Allotments</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Regulatory Services ▾ */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('regulatory')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsNotificationOpen(false);
                setActiveDropdown(activeDropdown === 'regulatory' ? null : 'regulatory');
              }}
              className={`px-2 py-1 rounded-[8px] text-[12.5px] lg:text-[13px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeDropdown === 'regulatory'
                  ? 'bg-[#0E453A] text-white shadow-xs'
                  : 'text-[#2B2321] hover:text-[#B35E35] hover:bg-[#F3DFD2]/40'
              }`}
            >
              <span>Regulatory Services</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'regulatory' ? 'rotate-180 text-white' : 'text-[#8A7E78]'}`} />
            </button>

            {activeDropdown === 'regulatory' && (
              <div
                className="absolute left-0 top-[42px] z-50 w-[310px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-2xl p-2.5 animate-dropdown"
                onMouseEnter={() => handleMouseEnter('regulatory')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="pb-1.5 mb-1.5 border-b border-[#EDE4DC] px-2 text-[11px] font-bold text-[#8A7E78] uppercase tracking-wider">
                  Verification &amp; Compliance Engines
                </div>

                {/* AI Walkthrough Entry */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenAiWalkthrough && onOpenAiWalkthrough();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] bg-[#FAF5F0] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 border border-[#B35E35]/30 transition-colors cursor-pointer mb-1 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-[#A8582F]" />
                  <div className="flex flex-col">
                    <span className="text-[#A8582F] font-bold">AI Document Verification Walkthrough</span>
                    <span className="text-[10.5px] font-normal text-[#5E524C]">Step-by-step interactive explanation</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenAiWorkflow && onOpenAiWorkflow();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#0E453A]" />
                  <div className="flex flex-col">
                    <span>Live AI Scrutiny Pipeline</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Run automated validation on dossier</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenRules && onOpenRules();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#C86432]" />
                  <div className="flex flex-col">
                    <span>Compliance Rules &amp; Checklists</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Approval Process Handbook 2026-27</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenVerify && onOpenVerify();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <div className="flex flex-col">
                    <span>Registry Verification Adapters</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Issuing authority API status checks</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Reports (Image 2 style) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('reports')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsNotificationOpen(false);
                setActiveDropdown(activeDropdown === 'reports' ? null : 'reports');
              }}
              className={`px-2 py-1 rounded-[8px] text-[12.5px] lg:text-[13px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeDropdown === 'reports'
                  ? 'bg-[#0E453A] text-white shadow-xs'
                  : 'text-[#2B2321] hover:text-[#B35E35] hover:bg-[#F3DFD2]/40'
              }`}
            >
              <span>Reports</span>
            </button>

            {activeDropdown === 'reports' && (
              <div
                className="absolute left-0 top-[42px] z-50 w-[270px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-2xl p-2.5 animate-dropdown"
                onMouseEnter={() => handleMouseEnter('reports')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="pb-1.5 mb-1.5 border-b border-[#EDE4DC] px-2 text-[11px] font-bold text-[#8A7E78] uppercase tracking-wider">
                  Regulatory Publications
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenReport && onOpenReport();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#A8582F]" />
                  <div className="flex flex-col">
                    <span>Export Approval Dossier Report</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">PDF / CSV compliance summary</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenAudit && onOpenAudit();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#0E453A]" />
                  <div className="flex flex-col">
                    <span>Immutable Audit Log</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">SHA-256 event integrity trail</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Help & Support ▾ */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('help')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsNotificationOpen(false);
                setActiveDropdown(activeDropdown === 'help' ? null : 'help');
              }}
              className={`px-2 py-1 rounded-[8px] text-[12.5px] lg:text-[13px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeDropdown === 'help'
                  ? 'bg-[#0E453A] text-white shadow-xs'
                  : 'text-[#2B2321] hover:text-[#B35E35] hover:bg-[#F3DFD2]/40'
              }`}
            >
              <span>Help &amp; Support</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'help' ? 'rotate-180 text-white' : 'text-[#8A7E78]'}`} />
            </button>

            {activeDropdown === 'help' && (
              <div
                className="absolute left-0 top-[42px] z-50 w-[290px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-2xl p-2.5 animate-dropdown"
                onMouseEnter={() => handleMouseEnter('help')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="pb-1.5 mb-1.5 border-b border-[#EDE4DC] px-2 text-[11px] font-bold text-[#8A7E78] uppercase tracking-wider">
                  Assistance &amp; Diagnostics
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenAiWalkthrough && onOpenAiWalkthrough();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A8582F]" />
                  <div className="flex flex-col">
                    <span>AI Verification Walkthrough Guide</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">How AI checks and validates documents</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    showToast && showToast('Nodal Officer Helpdesk: Toll-Free 1800-11-2244 (09:30–17:30 IST)', 'info');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0E453A]" />
                  <div className="flex flex-col">
                    <span>AICTE Nodal Helpdesk</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Technical Support &amp; Queries</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenStorageFiles && onOpenStorageFiles();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] hover:bg-white text-xs font-semibold text-[#1E1815] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <div className="flex flex-col">
                    <span>System Health &amp; Storage</span>
                    <span className="text-[10px] font-normal text-[#8A7E78]">Open local storage directory</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Search Icon, Notification Bell & User Profile (Exact Image 2 match) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto pl-3">
          {/* Search Icon Button (Clean icon button matching Image 2, opens floating popover) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsNotificationOpen(false);
                setActiveDropdown(null);
              }}
              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isSearchOpen
                  ? 'bg-[#B35E35] text-white shadow-xs'
                  : 'text-[#3E3430] hover:text-[#B35E35] hover:bg-[#F3DFD2]/50'
              }`}
              title="Search applications, institutions, documents"
            >
              <Search className="w-4 h-4 stroke-[1.8]" />
            </button>

            {isSearchOpen && (
              <div className="absolute right-0 top-[42px] w-[320px] sm:w-[380px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-2xl p-3 z-50 animate-dropdown">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="w-4 h-4 text-[#8A7E78] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (onSearch) onSearch(e.target.value);
                    }}
                    placeholder="Search applications, institutions, PID, rules..."
                    className="w-full h-[38px] pl-9 pr-8 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] placeholder-[#8A7E78] focus:outline-none focus:border-[#B35E35] shadow-2xs font-sans transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        if (onSearch) onSearch('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A7E78] hover:text-[#1E1815] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>
                <div className="mt-2 pt-2 border-t border-[#EDE4DC] flex items-center justify-between text-[11px] text-[#8A7E78]">
                  <span>Press <kbd className="px-1 py-0.5 rounded bg-white border border-[#EDE4DC] text-[10px] font-mono">Esc</kbd> to close</span>
                  <span
                    className="text-[#B35E35] font-semibold hover:underline cursor-pointer"
                    onClick={() => {
                      setIsSearchOpen(false);
                      if (onSearch) onSearch('APP-2026');
                    }}
                  >
                    Browse All Dossiers
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsSearchOpen(false);
                setActiveDropdown(null);
              }}
              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                isNotificationOpen
                  ? 'bg-[#0E453A] text-white shadow-xs'
                  : 'text-[#3E3430] hover:text-[#B35E35] hover:bg-[#F3DFD2]/50'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              <span className="w-2 h-2 rounded-full bg-[#B35E35] absolute top-1.5 right-1.5 ring-2 ring-[#FBF8F5]" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-[42px] w-[320px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[16px] shadow-2xl p-3 z-50 animate-dropdown">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC] px-1">
                  <span className="text-xs font-bold text-[#1E1815]">Regulatory Notifications</span>
                  <span className="text-[10px] font-semibold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded-full tabular-nums">
                    2 Unread
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotificationOpen(false);
                        showToast && showToast(`Viewing alert: ${n.title} (${n.app})`, 'info');
                      }}
                      className={`p-2.5 rounded-[10px] flex flex-col gap-0.5 cursor-pointer transition-colors border ${
                        n.unread ? 'bg-white border-l-4 border-[#A8582F] border-t-[#EDE4DC] border-r-[#EDE4DC] border-b-[#EDE4DC]' : 'bg-white/60 border-[#EDE4DC] hover:bg-white'
                      }`}
                    >
                      <span className="text-[12px] font-bold text-[#1E1815]">{n.title}</span>
                      <div className="flex items-center justify-between text-[10.5px] text-[#8A7E78]">
                        <span className="font-mono text-[#06241E] font-medium">{n.app}</span>
                        <span className="tabular-nums">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-[1px] bg-[#EDE4DC]" />

          {/* User Profile Pill */}
          <button
            onClick={onOpenUserSwitch}
            title="Switch Active Regulatory User Profile"
            className="flex items-center gap-2 pl-1 pr-1.5 py-0.5 rounded-full hover:bg-[#F3DFD2]/40 transition-all cursor-pointer group flex-shrink-0"
          >
            <div className="w-[30px] h-[30px] rounded-full bg-[#B86B43] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {currentUser?.avatar || 'S'}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[12.5px] font-bold text-[#1E1815] leading-tight">
                {currentUser?.name || 'Shanmukh'}
              </span>
              <span className="text-[10px] text-[#8A7E78] leading-tight mt-0.5">
                {currentUser?.role || 'Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A7E78]" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out to Login Page"
              className="p-1.5 rounded-full text-[#8A7E78] hover:text-[#A8582F] hover:bg-[#F3DFD2]/50 transition-colors cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
