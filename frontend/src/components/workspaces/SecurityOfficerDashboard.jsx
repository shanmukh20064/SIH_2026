import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  FolderCheck,
  Hourglass,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  MessageSquare,
  FileCheck,
  Network,
  Info,
  Clock,
  ArrowRight,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import Hero from '../Hero';
import KpiCard from '../KpiCard';

export default function SecurityOfficerDashboard({
  currentUser,
  kpiMetrics,
  applications,
  statusFilter,
  setStatusFilter,
  onSelectApp,
  onOpenVerify,
  onOpenReport,
  onOpenAudit,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Security officer KPI cards (Tailored labels for security officer in warm Image 1 palette)
  const securityKpis = [
    {
      id: 'total',
      value: applications.length.toString(),
      numValue: applications.length,
      label: 'Assigned Cases',
      icon: 'FileText',
      trend: 'Active',
      trendType: 'info'
    },
    {
      id: 'review',
      value: applications.filter(a => a.status === 'Under Review' || a.status === 'IN_SCRUTINY' || a.status === 'SUBMITTED').length.toString(),
      numValue: applications.filter(a => a.status === 'Under Review' || a.status === 'IN_SCRUTINY' || a.status === 'SUBMITTED').length,
      label: 'Documents Awaiting Verification',
      icon: 'Hourglass',
      trend: 'Pending',
      trendType: 'warning'
    },
    {
      id: 'issues',
      value: applications.filter(a => a.status === 'Compliance Issue' || a.status === 'DEFICIENCY_ISSUED').length.toString(),
      numValue: applications.filter(a => a.status === 'Compliance Issue' || a.status === 'DEFICIENCY_ISSUED').length,
      label: 'Potential Anomalies Flagged',
      icon: 'AlertTriangle',
      trend: 'Advisory',
      trendType: 'danger'
    },
    {
      id: 'verified',
      value: applications.filter(a => a.status === 'Verified' || a.status === 'APPROVED').length.toString(),
      numValue: applications.filter(a => a.status === 'Verified' || a.status === 'APPROVED').length,
      label: 'Cleared & Authenticated',
      icon: 'ShieldCheck',
      trend: 'Verified',
      trendType: 'success'
    }
  ];

  // Concrete sample anomalies linked to real evidence for security review
  const anomalyList = [
    {
      id: 'ANOM-2026-081',
      appId: 'APP-2026-0002',
      institution: 'ZENITH COLLEGE OF ENGINEERING',
      docType: 'FIRE_SAFETY_NOC',
      severity: 'CRITICAL',
      title: 'Expired Fire Safety NOC Certificate',
      reason: 'Extracted validity date "15-May-2025" has expired before the beginning of Academic Cycle 2026-27.',
      sourcePage: 'Page 1, Paragraph 3',
      evidenceSnippet: '...this Fire Safety Clearance is issued for a period of one year ending on 15/05/2025...',
    },
    {
      id: 'ANOM-2026-082',
      appId: 'APP-2026-0003',
      institution: 'APEX INSTITUTE OF TECHNOLOGY',
      docType: 'LAND_REGISTRATION_DEED',
      severity: 'MAJOR',
      title: 'Institutional Name Mismatch on Title Deed',
      reason: 'Fuzzy similarity between deed title holder ("Apex Educational Trust") and applicant institution is 74%.',
      sourcePage: 'Schedule B, Property Ownership',
      evidenceSnippet: '...conveyed unto the Purchaser M/s Apex Educational Trust for establishing educational premises...',
    },
    {
      id: 'ANOM-2026-083',
      appId: 'APP-2026-0002',
      institution: 'ZENITH COLLEGE OF ENGINEERING',
      docType: 'BUILDING_COMPLETION_CERT',
      severity: 'CRITICAL',
      title: 'Missing Mandatory Statutory Document',
      reason: 'Building Completion and Structural Stability Certificate not submitted in approval dossier.',
      sourcePage: 'Mandatory Checklist Rule BLD-001',
      evidenceSnippet: 'Statutory completion document file missing from uploaded dossier.',
    }
  ];

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'review') {
      if (app.status !== 'Under Review' && app.status !== 'IN_SCRUTINY' && app.status !== 'SUBMITTED') return false;
    } else if (statusFilter === 'verified') {
      if (app.status !== 'Verified' && app.status !== 'APPROVED') return false;
    } else if (statusFilter === 'issues') {
      if (app.status !== 'Compliance Issue' && app.status !== 'DEFICIENCY_ISSUED') return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        (app.id || '').toLowerCase().includes(q) ||
        (app.institution || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEscalateCase = (anom) => {
    showToast && showToast(`Case ${anom.appId} escalated to Competent Authority for physical inspection`, 'warning');
  };

  const handleRequestEvidence = (anom) => {
    showToast && showToast(`Deficiency clarification notice drafted for ${anom.institution}`, 'info');
  };

  const handleMarkVerified = (anom) => {
    showToast && showToast(`Officer observation saved: Anomaly resolved with manual confirmation`, 'success');
  };

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">
      {/* 1. WELCOME HERO (With Government Building Illustration from Image 1 & 2) */}
      <Hero currentUser={currentUser} />

      {/* 2. THE FOUR SUMMARY METRIC CARDS + OFFICER ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 items-stretch">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {securityKpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              data={kpi}
              isSelected={
                (kpi.id === 'total' && statusFilter === 'all') ||
                (kpi.id === 'review' && statusFilter === 'review') ||
                (kpi.id === 'verified' && statusFilter === 'verified') ||
                (kpi.id === 'issues' && statusFilter === 'issues')
              }
              onClick={() => {
                if (kpi.id === 'total') setStatusFilter('all');
                else if (kpi.id === 'review') setStatusFilter('review');
                else if (kpi.id === 'verified') setStatusFilter('verified');
                else if (kpi.id === 'issues') setStatusFilter('issues');
                showToast && showToast(`Filtered queue: ${kpi.label}`, 'info');
              }}
            />
          ))}
        </div>

        {/* Officer Action Buttons */}
        <div className="w-full flex flex-col justify-between h-[96px]">
          <button
            type="button"
            onClick={onOpenVerify}
            className="w-full h-[46px] bg-[#B9784F] hover:bg-[#94491F] text-white rounded-[9px] px-3.5 flex items-center justify-between shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <FolderCheck className="w-5 h-5 text-white" />
              <span className="text-[13.5px] font-medium text-white">
                Verify Registry
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="w-full h-[42px] bg-white hover:bg-[#FDFBF9] border border-[#EDE4DC] rounded-[9px] px-3.5 flex items-center justify-between shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#B9784F]" />
              <span className="text-[13px] font-medium text-[#2B2321]">
                Export Scrutiny Dossier
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A7E78]" />
          </button>
        </div>
      </div>

      {/* 3. MANDATORY ADVISORY NOTICE (Prompt Requirement: Advisory Tamper Heuristics) */}
      <div className="bg-[#FAF7F2] border border-[#EDE4DC] border-l-4 border-l-[#B9784F] rounded-[12px] p-3 flex items-start gap-2.5 text-xs text-[#2B2321] shadow-xs">
        <Info className="w-4 h-4 text-[#B9784F] flex-shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <strong className="font-semibold text-[#07372D]">Statutory Notice on Forensic AI Checks: </strong>
          Potential document tampering, metadata discrepancies, and seal anomalies flagged by the platform are strictly advisory heuristics. No application or document may be deemed definitively fraudulent without physical scrutiny or authenticated issuing-authority confirmation.
        </div>
      </div>

      {/* 4. SCRUTINY QUEUE & ANOMALY INVESTIGATION PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1.2fr] gap-3 items-start">
        {/* Left: Assigned Dossiers Queue */}
        <div className="bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#EDE4DC] flex items-center justify-between bg-white/60">
            <div>
              <h3 className="font-serif text-[16px] font-bold text-[#2B2321]">
                Assigned Dossiers Scrutiny Queue
              </h3>
              <p className="text-[11.5px] text-[#8A7E78]">
                Applications allocated for technical scrutiny ({filteredApps.length} cases)
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8A7E78] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search queue..."
                className="h-8 pl-8 pr-2.5 bg-white border border-[#EDE4DC] rounded-lg text-xs text-[#2B2321] placeholder-[#8A7E78] focus:outline-hidden focus:border-[#B9784F]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1EAE3] h-[28px] text-[11px] font-semibold text-[#5E524C]">
                  <th className="pl-3">Dossier ID</th>
                  <th>Institution Name</th>
                  <th>Priority</th>
                  <th>Anomalies</th>
                  <th className="pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4DC]">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#8A7E78]">
                      No dossiers match the filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApp(app)}
                      className="h-[34px] text-[11.5px] text-[#2B2321] transition-colors cursor-pointer table-row-hover hover:bg-[#F6EFE9]"
                    >
                      <td className="pl-3 font-semibold text-[#07372D]">
                        {app.id}
                      </td>
                      <td className="font-medium text-[#2B2321] max-w-[170px] truncate">
                        {app.institution}
                      </td>
                      <td>
                        {idx === 0 ? (
                          <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[#F9D9D5] text-[#C0392B]">
                            High Priority
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold bg-white border border-[#EDE4DC] text-[#5E524C]">
                            Normal
                          </span>
                        )}
                      </td>
                      <td>
                        {app.status === 'Compliance Issue' || app.status === 'DEFICIENCY_ISSUED' ? (
                          <span className="inline-flex items-center gap-1 text-[#C0392B] font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" /> 2 Flags
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#1F7A4D] font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Clear
                          </span>
                        )}
                      </td>
                      <td className="pr-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApp(app);
                          }}
                          className="px-2.5 py-1 rounded bg-[#07372D] hover:bg-[#0B3028] text-white text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          Open Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Anomaly & Tamper Review Cards */}
        <div className="bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
            <h4 className="font-serif text-[15px] font-bold text-[#2B2321] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#C0392B]" />
              Document Discrepancy Investigation
            </h4>
            <span className="text-[10px] font-bold text-[#C0392B] bg-[#F9D9D5] px-2 py-0.5 rounded-full">
              {anomalyList.length} Flagged
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {anomalyList.map((anom) => (
              <div
                key={anom.id}
                className="p-2.5 rounded-[12px] border border-[#EDE4DC] bg-white hover:border-[#B9784F] transition-all flex flex-col gap-1.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
                    <span className="text-[12px] font-bold text-[#2B2321]">{anom.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8A7E78] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#EDE4DC]">
                    {anom.appId}
                  </span>
                </div>

                <p className="text-[11px] text-[#5E524C] leading-snug">
                  {anom.reason}
                </p>

                {/* Evidence snippet box */}
                <div className="p-2 rounded bg-[#FAF7F2] border border-[#EDE4DC] text-[10.5px] font-mono text-[#2B2321]">
                  <span className="text-[#8A7E78] block text-[9px] font-sans font-semibold uppercase mb-0.5">
                    Evidence Snippet ({anom.sourcePage})
                  </span>
                  "{anom.evidenceSnippet}"
                </div>

                {/* Officer Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#EDE4DC]">
                  <button
                    type="button"
                    onClick={() => handleMarkVerified(anom)}
                    className="px-2 py-1 rounded bg-[#DCEBDD] text-[#1F7A4D] hover:bg-[#cde4cf] text-[10.5px] font-semibold transition-colors cursor-pointer"
                  >
                    Mark Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestEvidence(anom)}
                    className="px-2 py-1 rounded bg-[#F3DFD2] text-[#B9784F] hover:bg-[#eed3c3] text-[10.5px] font-semibold transition-colors cursor-pointer"
                  >
                    Request Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEscalateCase(anom)}
                    className="px-2 py-1 rounded bg-[#F9D9D5] text-[#C0392B] hover:bg-[#f5c6c0] text-[10.5px] font-semibold transition-colors cursor-pointer"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
