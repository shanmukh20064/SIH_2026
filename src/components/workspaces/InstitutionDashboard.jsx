import React, { useState } from 'react';
import {
  Building2,
  FileText,
  Upload,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Receipt,
  Download,
  ArrowRight,
  FileCheck2,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  FileSearch,
  ChevronRight
} from 'lucide-react';
import Hero from '../Hero';
import KpiCard from '../KpiCard';

export default function InstitutionDashboard({
  currentUser,
  applications,
  statusFilter,
  setStatusFilter,
  onSelectApp,
  onOpenNewApp,
  onOpenUpload,
  onOpenTrack,
  onOpenReport,
  showToast
}) {
  const institutionProfile = {
    name: 'APEX INSTITUTE OF TECHNOLOGY',
    code: 'AICTE-1-10928374',
    category: 'Engineering & Technology (Undergraduate & Postgraduate)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    region: 'South-Western Region',
    address: '45 Knowledge Corridor, Whitefield, Bengaluru - 560066',
    accreditation: 'NBA Tier-1 Accredited • NAAC A+ Grade',
    currentCycle: 'Academic Year 2026–2027 Approval Cycle'
  };

  // Filter applications belonging only to this institution
  const myApplications = applications.filter((app) => {
    const instName = (app.institution || '').toUpperCase();
    return instName.includes('APEX') || instName.includes('TECH') || !app.institution;
  });

  const institutionKpis = [
    {
      id: 'total',
      value: myApplications.length.toString(),
      numValue: myApplications.length,
      label: 'My Applications',
      icon: 'FileText',
      trend: 'Active',
      trendType: 'info'
    },
    {
      id: 'review',
      value: myApplications.filter(a => a.status === 'Under Review' || a.status === 'IN_SCRUTINY' || a.status === 'SUBMITTED').length.toString(),
      numValue: myApplications.filter(a => a.status === 'Under Review' || a.status === 'IN_SCRUTINY' || a.status === 'SUBMITTED').length,
      label: 'Under Scrutiny',
      icon: 'Hourglass',
      trend: 'In Review',
      trendType: 'warning'
    },
    {
      id: 'verified',
      value: myApplications.filter(a => a.status === 'Verified' || a.status === 'APPROVED').length.toString(),
      numValue: myApplications.filter(a => a.status === 'Verified' || a.status === 'APPROVED').length,
      label: 'Approved / Cleared',
      icon: 'ShieldCheck',
      trend: 'Cleared',
      trendType: 'success'
    },
    {
      id: 'issues',
      value: myApplications.filter(a => a.status === 'Compliance Issue' || a.status === 'DEFICIENCY_ISSUED').length.toString(),
      numValue: myApplications.filter(a => a.status === 'Compliance Issue' || a.status === 'DEFICIENCY_ISSUED').length,
      label: 'Action Required',
      icon: 'AlertTriangle',
      trend: 'Deficiency',
      trendType: 'danger'
    }
  ];

  // Statutory Document Checklist for Extension of Approval (EOA)
  const checklist = [
    {
      id: 'chk-1',
      title: 'Land Ownership / Registered Lease Deed',
      category: 'LAND_REGISTRATION_DEED',
      status: 'VERIFIED',
      details: 'Registered Deed Doc #1892/2012, 12.5 Acres verified'
    },
    {
      id: 'chk-2',
      title: 'State Fire Department Safety Certificate / NOC',
      category: 'FIRE_SAFETY_NOC',
      status: 'DEFICIENT',
      details: 'Current NOC expired on 15-May-2025. Upload valid renewal for 2026-27.'
    },
    {
      id: 'chk-3',
      title: 'Structural Stability & Building Completion Certificate',
      category: 'BUILDING_COMPLETION_CERT',
      status: 'VERIFIED',
      details: 'Govt Chartered Engineer Certificate Form B authenticated'
    },
    {
      id: 'chk-4',
      title: 'Faculty Cadre Ratio & AICTE Pay Scale Compliance',
      category: 'FACULTY_CADRE_LIST',
      status: 'IN_SCRUTINY',
      details: 'Under automated cadre ratio scrutiny (1:15 Cadre compliance)'
    },
    {
      id: 'chk-5',
      title: 'Mandatory FDR / Joint Endowment Fund Proof',
      category: 'FDR_ENDOWMENT_PROOF',
      status: 'OPTIONAL',
      details: 'FDR proof for Rs. 50 Lakhs deposited with AICTE South-Western Office'
    }
  ];

  const filteredApps = myApplications.filter((app) => {
    if (statusFilter === 'review') {
      if (app.status !== 'Under Review' && app.status !== 'IN_SCRUTINY' && app.status !== 'SUBMITTED') return false;
    } else if (statusFilter === 'verified') {
      if (app.status !== 'Verified' && app.status !== 'APPROVED') return false;
    } else if (statusFilter === 'issues') {
      if (app.status !== 'Compliance Issue' && app.status !== 'DEFICIENCY_ISSUED') return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">
      {/* 1. WELCOME HERO (With Government Building Illustration from Image 1 & 2) */}
      <Hero currentUser={currentUser} />

      {/* 2. THE FOUR SUMMARY METRIC CARDS + INSTITUTION ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 items-stretch">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {institutionKpis.map((kpi) => (
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
                showToast && showToast(`Filtered my dossiers: ${kpi.label}`, 'info');
              }}
            />
          ))}
        </div>

        {/* Institution Action Buttons */}
        <div className="w-full flex flex-col justify-between h-[96px]">
          <button
            type="button"
            onClick={onOpenNewApp}
            className="w-full h-[46px] bg-[#B9784F] hover:bg-[#94491F] text-white rounded-[9px] px-3.5 flex items-center justify-between shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-white" />
              <span className="text-[13.5px] font-medium text-white">
                New Application / EOA
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full h-[42px] bg-white hover:bg-[#FDFBF9] border border-[#EDE4DC] rounded-[9px] px-3.5 flex items-center justify-between shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[#B9784F]" />
              <span className="text-[13px] font-medium text-[#2B2321]">
                Upload Rectified File
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A7E78]" />
          </button>
        </div>
      </div>

      {/* 3. DEFICIENCY RECTIFICATION CALLOUT (In warm Image 1 styling) */}
      <div className="bg-[#FAF7F2] border border-[#EDE4DC] border-l-4 border-l-[#C0392B] rounded-[12px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#2B2321] shadow-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-[#C0392B] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-[#C0392B] block text-xs">
              Action Required: Compliance Deficiency Notice Issued (Dossier APP-2026-0002 / EOA)
            </strong>
            <p className="text-[#5E524C] text-[11.5px] mt-0.5 leading-snug">
              Fire Safety Certificate expired on 15-May-2025. Please upload renewed NOC issued by Karnataka State Fire Services to proceed with technical scrutiny.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenUpload}
          className="px-3 py-1.5 rounded-lg bg-[#B9784F] hover:bg-[#94491F] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Renewed NOC
        </button>
      </div>

      {/* 4. REBALANCED CENTRAL LAYOUT: MY APPLICATIONS & CHECKLIST */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1.3fr] gap-3 items-start">
        {/* Left: My Applications Table */}
        <div className="bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#EDE4DC] flex items-center justify-between bg-white/60">
            <div>
              <h3 className="font-serif text-[16px] font-bold text-[#2B2321]">
                Institutional Approval Submissions
              </h3>
              <p className="text-[11.5px] text-[#8A7E78]">
                Dossiers submitted by {institutionProfile.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenTrack}
              className="text-xs text-[#B9784F] hover:underline font-semibold cursor-pointer"
            >
              Track Status →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1EAE3] h-[28px] text-[11px] font-semibold text-[#5E524C]">
                  <th className="pl-3">Application Ref</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4DC]">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#8A7E78]">
                      No applications found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApp(app)}
                      className="h-[34px] text-[11.5px] text-[#2B2321] transition-colors cursor-pointer table-row-hover hover:bg-[#F6EFE9]"
                    >
                      <td className="pl-3 font-semibold text-[#07372D]">
                        {app.id}
                      </td>
                      <td className="text-[#5E524C]">
                        {app.category ? app.category.replace(/_/g, ' ') : 'Extension of Approval'}
                      </td>
                      <td className="text-[#8A7E78] text-[11px]">
                        {app.submittedOn || '08 Oct 2026'}
                      </td>
                      <td>
                        {app.status === 'Verified' || app.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-[#1F7A4D] font-semibold bg-[#DCEBDD] px-2 py-0.5 rounded-[4px] text-[10.5px]">
                            Cleared (EOA Granted)
                          </span>
                        ) : app.status === 'Compliance Issue' || app.status === 'DEFICIENCY_ISSUED' ? (
                          <span className="inline-flex items-center gap-1 text-[#C0392B] font-semibold bg-[#F9D9D5] px-2 py-0.5 rounded-[4px] text-[10.5px]">
                            Deficiency Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#B5651D] font-semibold bg-[#F6E1CC] px-2 py-0.5 rounded-[4px] text-[10.5px]">
                            Under Scrutiny
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
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Statutory Document Checklist */}
        <div className="bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
            <div>
              <h4 className="font-serif text-[15px] font-bold text-[#2B2321] flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#B9784F]" />
                Statutory Document Checklist
              </h4>
              <p className="text-[11px] text-[#8A7E78]">Mandatory uploads for 2026-27 Approval</p>
            </div>
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-2.5 py-1 rounded bg-[#B9784F] hover:bg-[#94491F] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Upload Doc
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {checklist.map((doc) => (
              <div
                key={doc.id}
                className="p-2 rounded-lg border border-[#EDE4DC] bg-white flex flex-col gap-1 text-xs"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-semibold text-[#2B2321] leading-tight">
                    {doc.title}
                  </span>
                  {doc.status === 'VERIFIED' ? (
                    <span className="text-[10px] font-semibold text-[#1F7A4D] bg-[#DCEBDD] px-1.5 py-0.5 rounded flex-shrink-0">
                      Verified
                    </span>
                  ) : doc.status === 'DEFICIENT' ? (
                    <span className="text-[10px] font-semibold text-[#C0392B] bg-[#F9D9D5] px-1.5 py-0.5 rounded flex-shrink-0">
                      Expired
                    </span>
                  ) : doc.status === 'IN_SCRUTINY' ? (
                    <span className="text-[10px] font-semibold text-[#B5651D] bg-[#F6E1CC] px-1.5 py-0.5 rounded flex-shrink-0">
                      In Scrutiny
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#8A7E78] bg-[#EDE4DC] px-1.5 py-0.5 rounded flex-shrink-0">
                      Optional
                    </span>
                  )}
                </div>

                <p className="text-[10.5px] text-[#8A7E78] leading-tight">
                  {doc.details}
                </p>

                {doc.status === 'DEFICIENT' && (
                  <div className="pt-1 mt-0.5 border-t border-[#EDE4DC] flex justify-end">
                    <button
                      type="button"
                      onClick={onOpenUpload}
                      className="text-[10.5px] font-semibold text-[#C0392B] hover:underline cursor-pointer"
                    >
                      Replace Expired File →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
