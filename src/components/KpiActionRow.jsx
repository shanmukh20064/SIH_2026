import React from 'react';
import {
  FileText,
  Hourglass,
  ShieldCheck,
  PlusCircle,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function KpiActionRow({
  metrics,
  onOpenNewApp,
  onOpenUpload,
  showToast
}) {
  const kpis = [
    {
      id: 'total',
      label: 'Total Applications',
      value: metrics?.total?.value || '1,248',
      change: '12%',
      isPositive: true,
      icon: 'file',
    },
    {
      id: 'review',
      label: 'Under Review',
      value: metrics?.review?.value || '324',
      change: '6%',
      isPositive: false,
      icon: 'hourglass',
    },
    {
      id: 'verified',
      label: 'Verified & Compliant',
      value: metrics?.verified?.value || '812',
      change: '18%',
      isPositive: true,
      icon: 'shield',
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-[14px] items-stretch select-none">
      {/* Left: 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={() => showToast && showToast(`Viewing breakdown for ${kpi.label}: ${kpi.value} dossiers`, 'info')}
            className="bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-4 flex items-center gap-3.5 hover:border-[#A8582F] transition-all cursor-pointer group"
          >
            {/* Left Icon Square */}
            <div
              className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                kpi.icon === 'file'
                  ? 'bg-[#F6EEE8] text-[#A8582F]'
                  : kpi.icon === 'hourglass'
                  ? 'bg-[#FAF1E8] text-[#C86432]'
                  : 'bg-[#EBF3ED] text-[#2E7D32]'
              }`}
            >
              {kpi.icon === 'file' && <FileText className="w-6 h-6 stroke-[1.8]" />}
              {kpi.icon === 'hourglass' && <Hourglass className="w-6 h-6 stroke-[1.8]" />}
              {kpi.icon === 'shield' && <ShieldCheck className="w-6 h-6 stroke-[1.8]" />}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[12px] font-semibold text-[#6B615B] leading-tight">
                {kpi.label}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-sans text-[28px] font-bold text-[#1E1815] leading-none tabular-nums tracking-tight">
                  {kpi.value}
                </span>
                <div className="flex items-center gap-0.5 text-[11px] font-bold tabular-nums">
                  {kpi.isPositive ? (
                    <span className="flex items-center text-[#2E7D32]">
                      <TrendingUp className="w-3 h-3 stroke-[2.5] mr-0.5" />
                      {kpi.change}
                    </span>
                  ) : (
                    <span className="flex items-center text-[#C0392B]">
                      <TrendingDown className="w-3 h-3 stroke-[2.5] mr-0.5" />
                      {kpi.change}
                    </span>
                  )}
                  <span className="text-[10px] text-[#8A7E78] font-normal ml-0.5">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right: 2 Action Buttons matching Image 1 */}
      <div className="flex flex-col gap-2.5 justify-between">
        {/* New Application Button (Solid Terracotta) */}
        <button
          onClick={onOpenNewApp}
          className="w-full h-[48px] px-4 rounded-[14px] bg-[#B35E35] hover:bg-[#9E4D27] text-white flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 stroke-[2] group-hover:rotate-90 transition-transform" />
            <span className="font-sans text-[13.5px] font-bold tracking-tight">
              New Application
            </span>
          </div>
          <ChevronRight className="w-4 h-4 stroke-[2.5] text-white/80 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Upload Documents Button (Outlined pill) */}
        <button
          onClick={onOpenUpload}
          className="w-full h-[48px] px-4 rounded-[14px] bg-white/80 hover:bg-white border border-[#B35E35]/40 text-[#2B2321] flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 stroke-[2] text-[#B35E35] group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-sans text-[13.5px] font-bold text-[#2B2321] tracking-tight">
              Upload Documents
            </span>
          </div>
          <ChevronRight className="w-4 h-4 stroke-[2.5] text-[#8A7E78] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
