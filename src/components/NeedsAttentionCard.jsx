import React from 'react';
import {
  AlertCircle,
  FileText,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function NeedsAttentionCard({ onSelectDossier, onViewAll, showToast }) {
  const items = [
    {
      id: 'AICTE-2026-001239',
      title: 'Missing Documents',
      time: '2 hours ago',
      icon: 'file',
      severity: 'danger',
    },
    {
      id: 'AICTE-2026-001233',
      title: 'Expiring Certificate',
      time: '5 hours ago',
      icon: 'clock',
      severity: 'warning',
    },
    {
      id: 'AICTE-2026-001228',
      title: 'Data Mismatch',
      time: '1 day ago',
      icon: 'triangle',
      severity: 'danger',
    },
    {
      id: 'AICTE-2026-001221',
      title: 'Manual Verification',
      time: '1 day ago',
      icon: 'user',
      severity: 'info',
    },
  ];

  return (
    <div className="w-full bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-4 sm:p-5 flex flex-col justify-between h-full select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2 pb-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#C0392B]" strokeWidth={2.2} />
          <h3 className="font-serif text-[17px] font-bold text-[#1E1815]">
            Needs Attention
          </h3>
          <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
        </div>

        <button
          onClick={onViewAll}
          className="text-[12px] font-bold text-[#A8582F] hover:underline flex items-center gap-1 cursor-pointer transition-all"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 4 Flagged Items matching Image 1 */}
      <div className="flex flex-col divide-y divide-[#EDE4DC]/80">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              onSelectDossier && onSelectDossier(item);
              showToast && showToast(`Inspecting ${item.title} for ${item.id}`, 'info');
            }}
            className="py-2 flex items-center justify-between hover:bg-white/60 px-1 rounded-[8px] transition-colors cursor-pointer group"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 ${
                  item.icon === 'file'
                    ? 'bg-[#FDF2F0] text-[#C0392B]'
                    : item.icon === 'clock'
                    ? 'bg-[#FAF1E8] text-[#C86432]'
                    : item.icon === 'triangle'
                    ? 'bg-[#FDF2F0] text-[#C0392B]'
                    : 'bg-[#EBF3ED] text-[#2E7D32]'
                }`}
              >
                {item.icon === 'file' && <FileText className="w-4 h-4 stroke-[2]" />}
                {item.icon === 'clock' && <Clock className="w-4 h-4 stroke-[2]" />}
                {item.icon === 'triangle' && <AlertTriangle className="w-4 h-4 stroke-[2]" />}
                {item.icon === 'user' && <UserCheck className="w-4 h-4 stroke-[2]" />}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[12.5px] font-bold text-[#1E1815] group-hover:text-[#A8582F] truncate">
                  {item.title}
                </span>
                <span className="font-mono text-[10.5px] text-[#8A7E78]">
                  {item.id}
                </span>
              </div>
            </div>

            {/* Right: Time and Arrow */}
            <div className="flex items-center gap-1.5 flex-shrink-0 text-[#8A7E78] text-[11px] group-hover:text-[#1E1815]">
              <span className="tabular-nums">{item.time}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C2B7AE] group-hover:text-[#A8582F] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
