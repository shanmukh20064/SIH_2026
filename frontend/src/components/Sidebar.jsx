import React, { useState, useRef } from 'react';
import {
  Home,
  FileText,
  FolderCheck,
  ShieldCheck,
  Building2,
  BarChart3,
  History,
  Users,
  Settings,
  AlertTriangle,
  Hourglass,
  ArrowUpRight,
  Bell,
  User,
  PlusCircle,
  Upload,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileSearch,
  CheckSquare,
  Network,
  Activity,
  LogOut
} from 'lucide-react';
import SidebarWatermark from './SidebarWatermark';
import Hoverboard from './Hoverboard';

export default function Sidebar({
  currentUser,
  activeNav,
  setActiveNav,
  onLogout,
  onOpenNewApp,
  onOpenUpload,
  onOpenTrack,
  onOpenVerify,
  onOpenRules,
  onOpenReport,
  onOpenAudit,
  onOpenStorageFiles,
  onOpenUserSwitch,
  onOpenInstitutions,
  onOpenSettings,
  onOpenAiWorkflow,
  onOpenAiWalkthrough,
  onOpenScrutiny,
  showToast,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen
}) {
  const [isHoverboardOpen, setIsHoverboardOpen] = useState(false);
  const [hoverboardPos, setHoverboardPos] = useState({ top: 120, left: 280 });
  const applicationsRef = useRef(null);
  const hoverboardTimerRef = useRef(null);

  const userRole = (currentUser?.role || '').toLowerCase();
  const isAdmin = !userRole || userRole.includes('admin') || userRole.includes('administrator');
  const isSecurityOfficer = userRole.includes('officer') || userRole.includes('reviewer') || userRole.includes('security');

  const handleMouseEnterApplications = (e) => {
    if (hoverboardTimerRef.current) {
      clearTimeout(hoverboardTimerRef.current);
      hoverboardTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverboardPos({
      top: Math.max(16, Math.min(window.innerHeight - 340, rect.top - 10)),
      left: rect.right + 12,
    });
    setIsHoverboardOpen(true);
  };

  const handleMouseLeaveApplications = () => {
    hoverboardTimerRef.current = setTimeout(() => {
      setIsHoverboardOpen(false);
    }, 320);
  };

  const handleHoverboardMouseEnter = () => {
    if (hoverboardTimerRef.current) {
      clearTimeout(hoverboardTimerRef.current);
      hoverboardTimerRef.current = null;
    }
  };

  const handleHoverboardMouseLeave = () => {
    hoverboardTimerRef.current = setTimeout(() => {
      setIsHoverboardOpen(false);
    }, 250);
  };

  // Role-Specific Navigation Configurations (Matching Image 1 & Prompt specifications)
  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'verification', label: 'Document Verification', icon: FolderCheck },
    { id: 'rules', label: 'Compliance Check', icon: ShieldCheck },
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const securityMenu = [
    { id: 'dashboard', label: 'My Dashboard', icon: Home },
    { id: 'applications', label: 'Assigned Cases', icon: FileText, badge: '3' },
    { id: 'verification', label: 'Document Verification', icon: FolderCheck },
    { id: 'anomalies', label: 'Anomaly Review', icon: AlertTriangle, badge: '2', badgeColor: 'bg-[#B9784F]' },
    { id: 'authority_checks', label: 'Authority Checks', icon: Network },
    { id: 'manual_queue', label: 'Manual Queue', icon: Hourglass },
    { id: 'escalated', label: 'Escalated Cases', icon: ArrowUpRight },
    { id: 'history', label: 'Review History', icon: History },
    { id: 'health', label: 'Document Storage', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '2' },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const institutionMenu = [
    { id: 'dashboard', label: 'My Dashboard', icon: Home },
    { id: 'institution_profile', label: 'Institution Profile', icon: Building2 },
    { id: 'new_application', label: 'New Application', icon: PlusCircle, isAction: true },
    { id: 'my_applications', label: 'My Applications', icon: FileText, badge: '2' },
    { id: 'document_uploads', label: 'Document Uploads', icon: Upload },
    { id: 'validation_results', label: 'Validation Results', icon: ShieldCheck },
    { id: 'rectification', label: 'Deficiencies', icon: AlertTriangle, badge: '1', badgeColor: 'bg-[#B9784F]' },
    { id: 'tracking', label: 'Application Tracking', icon: FileSearch },
    { id: 'health', label: 'Document Storage', icon: Building2 },
    { id: 'receipts', label: 'Submission Receipts', icon: Receipt },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const currentMenuItems = isAdmin
    ? adminMenu
    : isSecurityOfficer
    ? securityMenu
    : institutionMenu;

  const handleNavClick = (item, e) => {
    if (item.isAction) {
      if (item.id === 'new_application') {
        if (onOpenAiWorkflow) {
          onOpenAiWorkflow();
        } else {
          onOpenNewApp();
        }
      }
      return;
    }

    if (setActiveNav) setActiveNav(item.id);
    if (setIsMobileOpen) setIsMobileOpen(false);

    switch (item.id) {
      case 'dashboard':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Viewing Regulatory Scrutiny Dashboard', 'info');
        break;
      case 'applications':
        if (isSecurityOfficer) {
          if (onOpenScrutiny) onOpenScrutiny();
          else onOpenTrack();
        } else {
          if (e && e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverboardPos({
              top: Math.max(16, Math.min(window.innerHeight - 340, rect.top - 10)),
              left: rect.right + 12,
            });
          }
          setIsHoverboardOpen((prev) => !prev);
        }
        break;
      case 'my_applications':
      case 'tracking':
        onOpenTrack();
        break;
      case 'verification':
      case 'authority_checks':
        onOpenVerify();
        break;
      case 'anomalies':
      case 'manual_queue':
      case 'escalated':
        if (onOpenScrutiny) onOpenScrutiny();
        break;
      case 'validation_results':
        if (onOpenAiWalkthrough) onOpenAiWalkthrough();
        else if (onOpenAiWorkflow) onOpenAiWorkflow();
        break;
      case 'rectification':
        if (onOpenAiWorkflow) onOpenAiWorkflow();
        break;
      case 'rules':
      case 'checklists':
        onOpenRules();
        break;
      case 'settings':
        if (onOpenSettings) onOpenSettings();
        else if (onOpenRules) onOpenRules();
        break;
      case 'institutions':
      case 'institution_profile':
        onOpenInstitutions();
        break;
      case 'users':
      case 'profile':
        onOpenUserSwitch();
        break;
      case 'reports':
      case 'receipts':
        onOpenReport();
        break;
      case 'audit':
      case 'history':
        onOpenAudit();
        break;
      case 'document_uploads':
        onOpenUpload();
        break;
      case 'health':
        onOpenStorageFiles();
        break;
      case 'notifications':
        showToast && showToast('Regulatory Alerts: 2 critical findings requiring verification', 'info');
        break;
      default:
        break;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between relative z-10">
      <div>
        {/* 1. TOP BRANDING: Official State Emblem of India + AICTE Name (Image 1 match) */}
        <div
          onClick={() => {
            if (setActiveNav) setActiveNav('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast && showToast('AICTE Regulatory Scrutiny Platform • Ministry of Education', 'info');
          }}
          className="px-3.5 pt-4 pb-4 border-b border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors rounded-t-[22px]"
          title="All India Council for Technical Education • Ministry of Education"
        >
          <div className="w-[36px] h-[46px] flex-shrink-0 flex items-center justify-center">
            <img
              src="/assets/emblem_official.svg"
              alt="State Emblem of India"
              className="max-h-full max-w-full object-contain filter brightness-200 contrast-125 opacity-95"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left leading-none min-w-0 pr-1">
              <span className="font-serif text-[18px] font-bold text-white tracking-wider">
                AICTE
              </span>
              <span className="text-[10.5px] font-medium text-white/95 leading-tight mt-1 whitespace-nowrap">
                All India Council for Technical Education
              </span>
              <span className="text-[9.5px] text-[#A2C7BD] leading-tight mt-0.5 whitespace-nowrap">
                Ministry of Education • Govt. of India
              </span>
            </div>
          )}
        </div>

        {/* 2. NAVIGATION MENU ITEMS */}
        <nav className="p-2 flex flex-col gap-1 w-full" aria-label="Sidebar Navigation">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const isApplications = item.id === 'applications';

            return (
              <button
                key={item.id}
                ref={isApplications ? applicationsRef : undefined}
                type="button"
                onClick={(e) => handleNavClick(item, e)}
                onMouseEnter={isApplications ? handleMouseEnterApplications : undefined}
                onMouseLeave={isApplications ? handleMouseLeaveApplications : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`w-full text-left rounded-[9px] flex items-center gap-3 transition-all duration-150 px-3 cursor-pointer group relative ${
                  isActive
                    ? 'bg-[#0E453A] text-white shadow-xs h-[39px] border-l-[4px] border-[#B9784F] font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/6 h-[37px] font-medium'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}
                  strokeWidth={1.8}
                />
                {!isCollapsed && (
                  <span className="text-[13px] truncate flex-1">{item.label}</span>
                )}
                {!isCollapsed && isApplications && (
                  <span className="text-[9.5px] font-semibold text-[#A2C7BD] bg-white/10 group-hover:bg-[#B9784F] group-hover:text-white px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5">
                    <span>Menu</span>
                    <ChevronRight className="w-3 h-3 inline" />
                  </span>
                )}
                {!isCollapsed && item.badge && !isApplications && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${
                      item.badgeColor || 'bg-[#B9784F]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. LOWER SIDEBAR: SUBDUED CERTIFICATION ARTWORK (Image 1 match) */}
      <div className="relative w-full h-[160px] overflow-hidden pointer-events-none select-none mt-auto flex items-center justify-center">
        <SidebarWatermark className="w-[195px] h-auto transform -rotate-4 translate-y-2 opacity-35" />
      </div>

      {/* 4. BOTTOM BAR: TRICOLOR ACCENT & COLLAPSE TOGGLE */}
      <div className="px-3.5 py-2.5 border-t border-white/10 flex items-center justify-between relative z-20">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex w-[48px] h-[3px] rounded-full overflow-hidden opacity-80 shadow-xs">
              <span className="w-1/3 h-full bg-[#E8832A]" title="Saffron" />
              <span className="w-1/3 h-full bg-[#FFFFFF]" title="White" />
              <span className="w-1/3 h-full bg-[#1F7A4D]" title="Green" />
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out to Login Page"
                className="ml-2 flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out to Login Page"
                className="w-[28px] h-[28px] rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors mb-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {setIsCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-[28px] h-[28px] rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-gradient-to-b from-[#07372D] via-[#093229] to-[#06241E] rounded-[22px] shadow-xl text-white select-none transition-all duration-300 relative overflow-hidden sticky top-[16px] ${
          isCollapsed ? 'w-[68px]' : 'w-[264px]'
        }`}
        style={{ minHeight: 'calc(100vh - 32px)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Responsive) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-[260px] max-w-[85%] bg-gradient-to-b from-[#07372D] via-[#093229] to-[#06241E] text-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-[#A2C7BD] uppercase tracking-wider">Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Floating Hoverboard Menu for Applications */}
      {isHoverboardOpen && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsHoverboardOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: `${hoverboardPos.top}px`,
              left: `${hoverboardPos.left}px`,
              zIndex: 80,
            }}
            onMouseEnter={handleHoverboardMouseEnter}
            onMouseLeave={handleHoverboardMouseLeave}
          >
            <Hoverboard
              isOpen={isHoverboardOpen}
              onClose={() => setIsHoverboardOpen(false)}
              onOpenNewApp={() => {
                setIsHoverboardOpen(false);
                onOpenNewApp && onOpenNewApp();
              }}
              onOpenUpload={() => {
                setIsHoverboardOpen(false);
                onOpenUpload && onOpenUpload();
              }}
              onOpenTrack={() => {
                setIsHoverboardOpen(false);
                onOpenTrack && onOpenTrack();
              }}
              onOpenVerify={() => {
                setIsHoverboardOpen(false);
                onOpenVerify && onOpenVerify();
              }}
              onOpenAiWorkflow={() => {
                setIsHoverboardOpen(false);
                onOpenAiWorkflow && onOpenAiWorkflow();
              }}
              showToast={showToast}
            />
          </div>
        </>
      )}
    </>
  );
}
