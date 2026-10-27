import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import KpiActionRow from './components/KpiActionRow';
import StatusFlowCard from './components/StatusFlowCard';
import NeedsAttentionCard from './components/NeedsAttentionCard';
import ApplicationTrendsChart from './components/ApplicationTrendsChart';
import ApplicationTypesDonut from './components/ApplicationTypesDonut';

// Login & Role Selection Components
import LoginPage from './components/LoginPage';
import ProfileSelectionModal from './components/ProfileSelectionModal';

// Dedicated Role Workspaces
import SecurityOfficerDashboard from './components/workspaces/SecurityOfficerDashboard';
import InstitutionDashboard from './components/workspaces/InstitutionDashboard';

// Modals & Toast
import NewApplicationModal from './components/modals/NewApplicationModal';
import UploadDocumentModal from './components/modals/UploadDocumentModal';
import TrackApplicationModal from './components/modals/TrackApplicationModal';
import VerifyDocumentModal from './components/modals/VerifyDocumentModal';
import ComplianceRulesModal from './components/modals/ComplianceRulesModal';
import GenerateReportModal from './components/modals/GenerateReportModal';
import ScrutinyWorkspaceModal from './components/modals/ScrutinyWorkspaceModal';
import AuditTrailModal from './components/modals/AuditTrailModal';
import UserSwitchModal from './components/modals/UserSwitchModal';
import StorageFilesModal from './components/modals/StorageFilesModal';
import InstitutionsModal from './components/modals/InstitutionsModal';
import SettingsModal from './components/modals/SettingsModal';
import AiValidationWorkflowModal from './components/modals/AiValidationWorkflowModal';
import AiVerificationWalkthroughModal from './components/modals/AiVerificationWalkthroughModal';
import AiVerificationBanner from './components/AiVerificationBanner';
import Toast from './components/Toast';
import { isSupabaseConfigured, subscribeToTable, unsubscribeChannel } from './supabase';

import { initialKpiMetrics, recentApplications as initialApplications, currentUser as defaultUser } from './data/mockData';
import { getApplications, getDashboardSummary, ensureAuth, clearAuthSession } from './api';

export default function App() {
  // Always display the Login Page when opening the website
  const [currentUser, setCurrentUser] = useState(null);

  // Post-login profile selection state
  const [pendingAuth, setPendingAuth] = useState(null);
  const [isProfileSelectOpen, setIsProfileSelectOpen] = useState(false);

  // Status Filter state for dashboards
  const [statusFilter, setStatusFilter] = useState('all');

  // Applications list state
  const [applications, setApplications] = useState(initialApplications);
  const [selectedAppForScrutiny, setSelectedAppForScrutiny] = useState(null);

  // Dynamic KPI Metrics state
  const [kpiMetrics, setKpiMetrics] = useState({
    total: { value: '1,248', numValue: 1248 },
    review: { value: '324', numValue: 324 },
    verified: { value: '812', numValue: 812 },
  });

  // Modals state
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isScrutinyOpen, setIsScrutinyOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [isStorageFilesOpen, setIsStorageFilesOpen] = useState(false);
  const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiWorkflowOpen, setIsAiWorkflowOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [aiWorkflowInitialApp, setAiWorkflowInitialApp] = useState('APP-2026-0001');

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load real backend data on mount and on real-time update
  const fetchDashboardData = useCallback(() => {
    ensureAuth().then(() => {
      // Fetch live dashboard KPIs
      getDashboardSummary().then((summary) => {
        if (summary) {
          setKpiMetrics({
            total: {
              value: (summary.total_applications || 1248).toLocaleString(),
              numValue: summary.total_applications || 1248,
            },
            review: {
              value: (summary.pending_scrutiny || 324).toLocaleString(),
              numValue: summary.pending_scrutiny || 324,
            },
            verified: {
              value: (summary.approved_applications || 812).toLocaleString(),
              numValue: summary.approved_applications || 812,
            },
          });
        }
      });

      // Fetch live applications
      getApplications().then((apps) => {
        if (apps && apps.length > 0) {
          const mapped = apps.map((a) => ({
            id: a.application_number || `AICTE-2026-${a.id}`,
            institution: a.institution ? a.institution.name : 'Apex Engineering College',
            status: a.status === 'APPROVED' ? 'Verified' : a.status === 'DEFICIENCY_ISSUED' ? 'Compliance Issue' : 'Under Review',
            statusType: a.status === 'APPROVED' ? 'success' : a.status === 'DEFICIENCY_ISSUED' ? 'danger' : 'warning',
            submittedOn: a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '08 Oct 2026',
            category: a.category,
          }));
          setApplications(mapped);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchDashboardData();

    // Supabase Real-time subscriptions
    if (isSupabaseConfigured) {
      const appChannel = subscribeToTable('applications', (payload) => {
        fetchDashboardData();
        const actionType = payload.eventType === 'INSERT' ? 'Created' : payload.eventType === 'UPDATE' ? 'Updated' : 'Modified';
        showToast(`Real-Time Update: Application dossier ${actionType}`, 'info');
      });

      const findingChannel = subscribeToTable('findings', () => {
        fetchDashboardData();
        showToast('Real-Time Update: New scrutiny finding recorded', 'warning');
      });

      const auditChannel = subscribeToTable('audit_events', (payload) => {
        if (payload?.new?.action) {
          showToast(`Audit Stream: ${payload.new.action}`, 'info');
        }
      });

      return () => {
        unsubscribeChannel(appChannel);
        unsubscribeChannel(findingChannel);
        unsubscribeChannel(auditChannel);
      };
    }
  }, [currentUser, fetchDashboardData]);

  // Handlers
  const handleCreateAppSuccess = (newApp) => {
    setApplications((prev) => [newApp, ...prev]);
    setKpiMetrics((prev) => ({
      ...prev,
      total: {
        value: (prev.total.numValue + 1).toLocaleString(),
        numValue: prev.total.numValue + 1,
      },
    }));
    showToast(`Dossier ${newApp.id} created successfully for ${newApp.institution}`, 'success');
  };

  const handleUploadSuccess = (fileName, docType) => {
    showToast(`Uploaded ${fileName} [${docType}]. Cryptographic SHA-256 hash verified.`, 'success');
  };

  const handleSelectApp = (app) => {
    setSelectedAppForScrutiny(app);
    setIsScrutinyOpen(true);
  };

  const handleStatusUpdate = (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: newStatus,
              statusType: newStatus === 'Verified' ? 'success' : newStatus === 'Compliance Issue' ? 'danger' : 'warning',
            }
          : a
      )
    );
    showToast(`Application ${appId} updated to: ${newStatus}`, 'success');
  };

  const handleOpenAiWorkflow = (appId = null) => {
    if (appId) setAiWorkflowInitialApp(appId);
    setIsAiWorkflowOpen(true);
  };

  const handleOpenStorageFiles = async () => {
    setIsStorageFilesOpen(true);
    try {
      fetch('/api/open-storage');
    } catch (e) {
      console.error(e);
    }
  };

  // Login & Profile Handlers
  const handleLoginSuccess = (authData) => {
    setPendingAuth(authData);
    setIsProfileSelectOpen(true);
  };

  const handleSelectProfile = (profile) => {
    setCurrentUser(profile);
    setIsProfileSelectOpen(false);
    setPendingAuth(null);
    showToast(`Welcome back, ${profile.name}! Active Workspace: ${profile.role}.`, 'success');
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setPendingAuth(null);
    setIsProfileSelectOpen(false);
    showToast('Signed out successfully. Please sign in to continue.', 'info');
  };

  // If user is unauthenticated, show the Login Page and Profile Selection
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5EFE8]">
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
        <ProfileSelectionModal
          isOpen={isProfileSelectOpen}
          authenticatedUser={pendingAuth}
          onSelectProfile={handleSelectProfile}
          onBackToLogin={() => {
            setIsProfileSelectOpen(false);
            setPendingAuth(null);
          }}
          showToast={showToast}
        />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  const userRole = (currentUser?.role || '').toLowerCase();
  const isSecurityOfficer = userRole.includes('officer') || userRole.includes('reviewer') || userRole.includes('security');
  const isInstitution = userRole.includes('institution') || userRole.includes('representative');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5EFE8] via-[#F0EAE1] to-[#EFE8DF] text-[#1E1815] flex p-3 lg:p-4 select-none font-sans">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (Matching Image 1 EXACTLY)                    */}
      {/* ============================================================== */}
      <div className="hidden lg:block flex-shrink-0 sticky top-3 z-[60]">
        <Sidebar
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenNewApp={() => {
            if (currentUser?.role?.toLowerCase().includes('institution')) {
              handleOpenAiWorkflow();
            } else {
              setIsNewAppOpen(true);
            }
          }}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenTrack={() => setIsTrackOpen(true)}
          onOpenVerify={() => setIsVerifyOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenStorageFiles={handleOpenStorageFiles}
          onOpenUserSwitch={() => setIsUserSwitchOpen(true)}
          onOpenInstitutions={() => setIsInstitutionsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAiWorkflow={handleOpenAiWorkflow}
          onOpenAiWalkthrough={() => setIsWalkthroughOpen(true)}
          onOpenScrutiny={(app) => {
            if (app) setSelectedAppForScrutiny(app);
            else if (!selectedAppForScrutiny && applications.length > 0) setSelectedAppForScrutiny(applications[0]);
            setIsScrutinyOpen(true);
          }}
          showToast={showToast}
        />
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                                 */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col gap-[14px] min-w-0 pl-0 lg:pl-4 max-w-[1536px]">
        {/* Top Navbar: Search Input + Top Hoverboard + Notification Bell + User Profile */}
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenUserSwitch={() => setIsUserSwitchOpen(true)}
          onOpenNewApp={() => setIsNewAppOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenTrack={() => setIsTrackOpen(true)}
          onOpenVerify={() => setIsVerifyOpen(true)}
          onOpenAiWorkflow={handleOpenAiWorkflow}
          onOpenAiWalkthrough={() => setIsWalkthroughOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenInstitutions={() => setIsInstitutionsOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenStorageFiles={handleOpenStorageFiles}
          onSearch={(q) => {
            if (q.trim()) {
              const matched = applications.find(
                (a) => a.id.toLowerCase().includes(q.toLowerCase()) || a.institution.toLowerCase().includes(q.toLowerCase())
              );
              if (matched) {
                handleSelectApp(matched);
              }
            }
          }}
          showToast={showToast}
        />

        {/* Central Workspace Switching */}
        {isInstitution ? (
          <InstitutionDashboard
            currentUser={currentUser}
            applications={applications}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSelectApp={handleSelectApp}
            onOpenNewApp={() => handleOpenAiWorkflow()}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenTrack={() => setIsTrackOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
            showToast={showToast}
          />
        ) : isSecurityOfficer ? (
          <SecurityOfficerDashboard
            currentUser={currentUser}
            kpiMetrics={kpiMetrics}
            applications={applications}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSelectApp={handleSelectApp}
            onOpenVerify={() => setIsVerifyOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenAudit={() => setIsAuditOpen(true)}
            showToast={showToast}
          />
        ) : (
          /* Administrator Dashboard (Preserved exactly as current) */
          <>
            {/* Row 1: Hero Welcome Banner with Building & Quote Card */}
            <Hero currentUser={currentUser} />

            {/* Prominent AI Document Verification Banner */}
            <AiVerificationBanner
              onExploreWalkthrough={() => setIsWalkthroughOpen(true)}
              onStartRealVerification={() => handleOpenAiWorkflow()}
              showToast={showToast}
            />

            {/* Row 2: 3 KPI Cards + 2 Action Buttons matching Image 1 */}
            <KpiActionRow
              metrics={kpiMetrics}
              onOpenNewApp={() => setIsNewAppOpen(true)}
              onOpenUpload={() => setIsUploadOpen(true)}
              showToast={showToast}
            />

            {/* Row 3: Application Status Flow (Left) + Needs Attention (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.58fr_1fr] gap-[14px] items-stretch">
              <StatusFlowCard
                onSelectStage={(stage) => showToast(`Filtered dossiers in stage: ${stage}`, 'info')}
                showToast={showToast}
              />
              <NeedsAttentionCard
                onSelectDossier={(item) => {
                  const app = applications.find((a) => a.id === item.id) || {
                    id: item.id,
                    institution: 'Apex Engineering Institute',
                    status: 'Under Review',
                    submittedOn: '08 Oct 2026',
                  };
                  handleSelectApp(app);
                }}
                onViewAll={() => {
                  handleSelectApp(applications[0]);
                }}
                showToast={showToast}
              />
            </div>

            {/* Row 4: Application Trends Multi-line Chart (Left) + Application Types Donut (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.58fr_1fr] gap-[14px] items-stretch">
              <ApplicationTrendsChart showToast={showToast} />
              <ApplicationTypesDonut
                onViewAll={() => {
                  handleSelectApp(applications[0]);
                }}
                showToast={showToast}
              />
            </div>
          </>
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. INTERACTIVE MODALS & WORKSPACES                            */}
      {/* ============================================================== */}
      <NewApplicationModal
        isOpen={isNewAppOpen}
        onClose={() => setIsNewAppOpen(false)}
        onSubmitSuccess={handleCreateAppSuccess}
      />

      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        applications={applications}
      />

      <TrackApplicationModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        onSelectApp={handleSelectApp}
      />

      <VerifyDocumentModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      <ComplianceRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        onSave={() => showToast('Compliance rules configuration updated successfully', 'success')}
      />

      <GenerateReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onDownload={(fn) => showToast(`Report exported: ${fn}`, 'success')}
        applications={applications}
      />

      <ScrutinyWorkspaceModal
        isOpen={isScrutinyOpen}
        onClose={() => setIsScrutinyOpen(false)}
        application={selectedAppForScrutiny}
        onStatusUpdate={handleStatusUpdate}
      />

      <AuditTrailModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      <UserSwitchModal
        isOpen={isUserSwitchOpen}
        onClose={() => setIsUserSwitchOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast(`Switched active profile to ${u.name} (${u.role})`, 'info');
        }}
      />

      <StorageFilesModal
        isOpen={isStorageFilesOpen}
        onClose={() => setIsStorageFilesOpen(false)}
        showToast={showToast}
      />

      <InstitutionsModal
        isOpen={isInstitutionsOpen}
        onClose={() => setIsInstitutionsOpen(false)}
        currentUser={currentUser}
        showToast={showToast}
      />

      <AiValidationWorkflowModal
        isOpen={isAiWorkflowOpen}
        onClose={() => setIsAiWorkflowOpen(false)}
        initialAppId={aiWorkflowInitialApp}
        applications={applications}
        showToast={showToast}
        onWorkflowComplete={(appId) => {
          showToast(`Application ${appId || ''} submitted to Senior Scrutiny Officer queue.`, 'success');
        }}
      />

      <AiVerificationWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onLaunchRealVerification={() => {
          setIsWalkthroughOpen(false);
          handleOpenAiWorkflow();
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />

      {/* Toast Feedback */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
