import React from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function NeedsAttention({ onSelectCase, onOpenViewAll, showToast }) {
  const attentionItems = [
    {
      id: 'case-1',
      appId: 'APP-2026-0002',
      displayId: 'AICTE-2026-001239',
      title: 'Missing Documents',
      time: '2 hours ago',
      icon: FileText,
      iconColor: 'text-[#B9784F]',
      iconBg: 'bg-[#F3DFD2]',
    },
    {
      id: 'case-2',
      appId: 'APP-2026-0002',
      displayId: 'AICTE-2026-001233',
      title: 'Expiring Certificate',
      time: '5 hours ago',
      icon: Clock,
      iconColor: 'text-[#C0392B]',
      iconBg: 'bg-[#F9D9D5]',
    },
    {
      id: 'case-3',
      appId: 'APP-2026-0003',
      displayId: 'AICTE-2026-001228',
      title: 'Data Mismatch',
      time: '1 day ago',
      icon: AlertTriangle,
      iconColor: 'text-[#B5651D]',
      iconBg: 'bg-[#F6E1CC]',
    },
    {
      id: 'case-4',
      appId: 'APP-2026-0001',
      displayId: 'AICTE-2026-001221',
      title: 'Manual Verification',
      time: '1 day ago',
      icon: UserCheck,
      iconColor: 'text-[#07372D]',
      iconBg: 'bg-[#DCEBDD]',
    },
  ];

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-4 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EDE5DA]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#25251F] stroke-[2]" />
          <h3 className="font-serif text-[16px] font-bold text-[#25251F] flex items-center gap-1.5">
            Needs Attention
            <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenViewAll) onOpenViewAll();
            else showToast && showToast('Viewing all pending attention dossiers', 'info');
          }}
          className="text-xs font-semibold text-[#B9784F] hover:underline flex items-center gap-1 cursor-pointer"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 mt-2.5">
        {attentionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectCase) onSelectCase(item);
                else showToast && showToast(`Opening case ${item.displayId}: ${item.title}`, 'info');
              }}
              className="p-2.5 bg-white border border-[#EDE4DC] hover:border-[#B9784F] rounded-[11px] flex items-center justify-between transition-all cursor-pointer group hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg} ${item.iconColor}`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[12.5px] font-bold text-[#2B2321] group-hover:text-[#B9784F] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#8A7E78] mt-0.5">
                    {item.displayId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#8A7E78]">
                <span>{item.time}</span>
                <ChevronRight className="w-4 h-4 text-[#C5B8AD] group-hover:text-[#2B2321] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
