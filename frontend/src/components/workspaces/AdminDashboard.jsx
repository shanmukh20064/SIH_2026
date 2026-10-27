import React, { useState } from 'react';
import {
  FileText,
  Hourglass,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  Settings,
  BarChart3,
  History,
  CheckCircle2,
  Search,
  Filter,
  Network,
  Cpu,
  ArrowRight
} from 'lucide-react';
import Hero from '../Hero';
import KpiCard from '../KpiCard';
import ActionButtons from '../ActionButtons';
import StatusFlow from '../StatusFlow';
import NeedsAttention from '../NeedsAttention';

export default function AdminDashboard({
  currentUser,
  kpiMetrics,
  applications,
  statusFilter,
  setStatusFilter,
  onSelectApp,
  onOpenNewApp,
  onOpenUpload,
  onOpenRules,
  onOpenInstitutions,
  onOpenUserSwitch,
  onOpenReport,
  onOpenAudit,
  onOpenStorageFiles,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Filter applications by search, category, and KPI status card selection
  const filteredApps = applications.filter((app) => {
    // 1. KPI Status filter
    if (statusFilter === 'review') {
      if (app.status !== 'Under Review' && app.status !== 'IN_SCRUTINY' && app.status !== 'SUBMITTED') return false;
    } else if (statusFilter === 'verified') {
      if (app.status !== 'Verified' && app.status !== 'APPROVED') return false;
    } else if (statusFilter === 'issues') {
      if (app.status !== 'Compliance Issue' && app.status !== 'DEFICIENCY_ISSUED') return false;
    }

    // 2. Category filter
    if (categoryFilter !== 'ALL') {
      if ((app.category || '').toUpperCase() !== categoryFilter.toUpperCase()) return false;
    }

    // 3. Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = (app.id || '').toLowerCase().includes(q);
      const matchInst = (app.institution || '').toLowerCase().includes(q);
      const matchCat = (app.category || '').toLowerCase().includes(q);
      if (!matchId && !matchInst && !matchCat) return false;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('VERIFIED') || s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#DCEBDD] text-[#3F7D5B]">
          Verified
        </span>
      );
    }
    if (s.includes('DEFICIENCY') || s.includes('ISSUE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#F9D9D5] text-[#C0392B]">
          Compliance Issue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#F6E1CC] text-[#B5651D]">
        Under Review
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">
      {/* ROW 1: WELCOME HERO (With Government Building Illustration from Image 1 & 2) */}
      <Hero currentUser={currentUser} />

      {/* ROW 2: THE FOUR SUMMARY METRIC CARDS + PRIMARY ACTION BUTTONS (Image 1 match) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 items-stretch">
        {/* Left: 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {kpiMetrics.map((kpi) => (
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
                showToast && showToast(`Filtered dossiers by: ${kpi.label}`, 'info');
              }}
            />
          ))}
        </div>

        {/* Right: Action Buttons (New Application & Upload Documents) */}
        <ActionButtons
          onOpenNewApp={onOpenNewApp}
          onOpenUpload={onOpenUpload}
        />
      </div>

      {/* Active Filter Indicator Bar */}
      {statusFilter !== 'all' && (
        <div className="px-3.5 py-2 bg-[#FAF7F2] border border-[#B9784F]/40 rounded-[12px] flex items-center justify-between text-xs text-[#2B2321] shadow-xs">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#B9784F]" />
            Active Filter: <strong className="capitalize">{statusFilter === 'review' ? 'Under Review' : statusFilter === 'verified' ? 'Verified & Compliant' : 'Compliance Issues'}</strong> ({filteredApps.length} records matching)
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className="text-[#B9784F] hover:underline font-bold cursor-pointer"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* ROW 3: APPLICATION STATUS FLOW + NEEDS ATTENTION QUEUE (Exact Image 1 layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 items-stretch">
        <StatusFlow
          onFilterStage={(stageId) => {
            if (stageId === 'submitted' || stageId === 'validation' || stageId === 'verification') {
              setStatusFilter('review');
            } else if (stageId === 'decision') {
              setStatusFilter('issues');
            } else {
              setStatusFilter('verified');
            }
          }}
          showToast={showToast}
        />
        <NeedsAttention
          onSelectCase={(item) => {
            const matched = applications.find(a => a.id === item.appId);
            if (matched) {
              onSelectApp(matched);
            } else {
              showToast && showToast(`Viewing dossier ${item.appId} for ${item.title}`, 'info');
            }
          }}
          onOpenViewAll={() => {
            setStatusFilter('issues');
            showToast && showToast('Showing all dossiers requiring compliance attention', 'info');
          }}
          showToast={showToast}
        />
      </div>

      {/* ROW 4: REBALANCED OPERATIONAL AREA (No graph! High-utility applications table & integrations) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-3 items-start">
        {/* Left: Master Application Queue Table */}
        <div className="bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#EDE4DC] flex flex-wrap items-center justify-between gap-2.5 bg-white/60">
            <div>
              <h3 className="font-serif text-[16px] font-bold text-[#2B2321]">
                Central Application Scrutiny Register
              </h3>
              <p className="text-[11.5px] text-[#8A7E78]">
                Approval dossiers under regulatory review ({filteredApps.length} active)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8A7E78] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter ref, college..."
                  className="h-8 pl-8 pr-2.5 bg-white border border-[#EDE4DC] rounded-lg text-xs text-[#2B2321] placeholder-[#8A7E78] focus:outline-hidden focus:border-[#B9784F]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 px-2 bg-white border border-[#EDE4DC] rounded-lg text-xs text-[#5E524C] focus:outline-hidden focus:border-[#B9784F]"
              >
                <option value="ALL">All Categories</option>
                <option value="EXTENSION_OF_APPROVAL">Extension of Approval</option>
                <option value="NEW_COURSE">New Course</option>
                <option value="INCREASE_INTAKE">Seat Increase</option>
                <option value="NEW_INSTITUTION">New Institution</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1EAE3] h-[28px] text-[11px] font-semibold text-[#5E524C]">
                  <th className="pl-3">Application ID</th>
                  <th>Institution Name</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4DC]">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#8A7E78]">
                      No applications found matching filter.
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
                      <td className="font-medium text-[#2B2321] max-w-[180px] truncate">
                        {app.institution}
                      </td>
                      <td className="text-[#5E524C]">
                        {app.category ? app.category.replace(/_/g, ' ') : 'EOA'}
                      </td>
                      <td className="text-[#8A7E78] text-[11px]">
                        {app.submittedOn || '08 Oct 2026'}
                      </td>
                      <td>
                        {getStatusBadge(app.status)}
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
                          Scrutiny Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Verification Source Integrations & Rules Summary */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] p-3.5 shadow-[0_2px_10px_rgba(120,80,50,0.05)]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EDE4DC]">
              <h4 className="font-serif text-[15px] font-bold text-[#2B2321] flex items-center gap-1.5">
                <Network className="w-4 h-4 text-[#B9784F]" />
                Registry Integrations Health
              </h4>
              <span className="w-2 h-2 rounded-full bg-[#1F7A4D]" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-lg bg-white border border-[#EDE4DC] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#2B2321]">State Land Revenue Records</div>
                  <div className="text-[10px] text-[#8A7E78]">Land Deed Ownership Registry</div>
                </div>
                <span className="text-[10px] font-semibold text-[#1F7A4D] bg-[#DCEBDD] px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-[#EDE4DC] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#2B2321]">State Fire & Rescue NOC Service</div>
                  <div className="text-[10px] text-[#8A7E78]">Statutory Safety Verification</div>
                </div>
                <span className="text-[10px] font-semibold text-[#1F7A4D] bg-[#DCEBDD] px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-[#EDE4DC] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#2B2321]">Local PyMuPDF & Hash Engine</div>
                  <div className="text-[10px] text-[#8A7E78]">SHA-256 Tamper Integrity Guard</div>
                </div>
                <span className="text-[10px] font-semibold text-[#1F7A4D] bg-[#DCEBDD] px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenRules}
              className="w-full mt-3 px-3 py-1.5 rounded-lg border border-[#EDE4DC] bg-white hover:bg-[#F3DFD2]/40 text-xs font-semibold text-[#2B2321] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              Configure Regulatory Rules →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
