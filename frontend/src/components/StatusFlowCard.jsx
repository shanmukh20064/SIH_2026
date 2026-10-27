import React, { useState } from 'react';
import {
  BarChart2,
  FileText,
  FileCheck2,
  ShieldCheck,
  Search,
  Flag,
  ArrowRight,
  ChevronDown,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function StatusFlowCard({ onSelectStage, showToast }) {
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const stages = [
    {
      id: 'submitted',
      label: 'Submitted',
      count: '1,248',
      percentage: '100%',
      icon: 'FileText',
      isFirst: true,
      iconBg: 'bg-[#B35E35] text-white ring-4 ring-[#B35E35]/15',
    },
    {
      id: 'validation',
      label: 'Document Validation',
      count: '892',
      percentage: '71.5%',
      icon: 'FileCheck2',
      iconBg: 'bg-[#FAF5F0] text-[#B35E35] border border-[#EDE4DC]',
    },
    {
      id: 'compliance',
      label: 'Compliance Check',
      count: '514',
      percentage: '41.2%',
      icon: 'ShieldCheck',
      iconBg: 'bg-[#EBF3ED] text-[#0E453A] border border-[#A2C7BD]/50',
    },
    {
      id: 'verification',
      label: 'Verification',
      count: '324',
      percentage: '26.0%',
      icon: 'Search',
      iconBg: 'bg-[#FAF7F3] text-[#1E1815] border border-[#EDE4DC]',
    },
    {
      id: 'decision',
      label: 'Review & Decision',
      count: '186',
      percentage: '14.9%',
      icon: 'Flag',
      iconBg: 'bg-[#FAF5F0] text-[#B35E35] border border-[#EDE4DC]',
    },
  ];

  const getStageIcon = (iconName, isFirst) => {
    const iconClass = `w-[20px] h-[20px]`;
    switch (iconName) {
      case 'FileText':
        return <FileText className={iconClass} strokeWidth={isFirst ? 2 : 1.8} />;
      case 'FileCheck2':
        return <FileCheck2 className={iconClass} strokeWidth={1.8} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} strokeWidth={1.8} />;
      case 'Search':
        return <Search className={iconClass} strokeWidth={1.8} />;
      case 'Flag':
        return <Flag className={iconClass} strokeWidth={1.8} />;
      default:
        return <FileText className={iconClass} strokeWidth={1.8} />;
    }
  };

  return (
    <div className="w-full bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-4 sm:p-5 flex flex-col justify-between h-full select-none">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-[#F3DFD2]/60 text-[#A8582F] mt-0.5">
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-[17px] font-bold text-[#1E1815] leading-tight">
              Application Status Flow
            </h3>
            <p className="text-[11.5px] text-[#8A7E78] leading-tight mt-0.5">
              From submission to final decision
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-[30px] px-3 bg-white border border-[#EDE4DC] rounded-full text-[12px] font-semibold text-[#2B2321] flex items-center gap-1.5 hover:border-[#A8582F] transition-all shadow-2xs cursor-pointer"
          >
            <span>{selectedMonth}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8A7E78] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[36px] w-[140px] bg-white border border-[#EDE4DC] rounded-[12px] shadow-xl py-1.5 z-30 text-[12px]">
              {['This Month', 'Last Month', 'Quarter 3', 'Year to Date'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(m);
                    setIsDropdownOpen(false);
                    showToast && showToast(`Status flow filtered for ${m}`, 'info');
                  }}
                  className={`w-full text-left px-3.5 py-1.5 hover:bg-[#F7F2EE] transition-colors ${
                    selectedMonth === m ? 'text-[#A8582F] font-bold' : 'text-[#2B2321]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Vertically Centered 5-Step Pipeline Flow matching Image 1 */}
      <div className="flex-1 flex flex-col justify-center my-2">
        <div className="flex items-center justify-between py-1 px-1 gap-1">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              {/* Stage Item */}
              <div
                onClick={() => {
                  onSelectStage && onSelectStage(stage.id);
                  showToast && showToast(`Viewing ${stage.count} dossiers in ${stage.label} stage`, 'info');
                }}
                className="flex flex-col items-center flex-1 cursor-pointer group"
              >
                {/* Circular Icon matching Image 1 */}
                <div
                  className={`w-[44px] sm:w-[46px] h-[44px] sm:h-[46px] rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${stage.iconBg}`}
                >
                  {getStageIcon(stage.icon, stage.isFirst)}
                </div>

                {/* Stage Label */}
                <span className="text-[11px] font-semibold text-[#8A7E78] text-center mt-2 leading-tight line-clamp-1 group-hover:text-[#1E1815] transition-colors">
                  {stage.label}
                </span>

                {/* Number Count (Tabular Numerals) */}
                <span className="font-sans text-[17px] sm:text-[18px] font-bold text-[#1E1815] mt-1 tabular-nums">
                  {stage.count}
                </span>
              </div>

              {/* Connecting Arrow */}
              {idx < stages.length - 1 && (
                <div className="text-[#C2B7AE] flex items-center justify-center -mt-6 flex-shrink-0">
                  <ArrowRight className="w-4 h-4 stroke-[1.8]" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. Subtle Pipeline Velocity Track (Single line, strictly no word-wrapping) */}
      <div className="pt-2.5 border-t border-[#EDE4DC]/80 flex items-center justify-between text-[11px] text-[#6E635D] whitespace-nowrap overflow-hidden gap-2">
        <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] flex-shrink-0" />
          <span className="whitespace-nowrap">Active Scrutiny Window: <strong>2026-27</strong></span>
        </div>
        <div className="hidden md:flex items-center gap-2.5 tabular-nums font-medium flex-shrink-0 whitespace-nowrap text-[#776D66]">
          <span className="whitespace-nowrap">71.5% Auto-Validated</span>
          <span>•</span>
          <span className="whitespace-nowrap">Avg. 4.2 Days Turnaround</span>
        </div>
        <span className="text-[10px] font-bold text-[#B35E35] bg-[#F3DFD2]/60 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
          Live Dossier Flow
        </span>
      </div>
    </div>
  );
}
