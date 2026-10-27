import React from 'react';
import { Search, FileCheck, ShieldCheck, BarChart3, MoreVertical } from 'lucide-react';
import { quickActionItems } from '../data/mockData';

export default function QuickActions({
  onOpenTrack,
  onOpenVerify,
  onOpenRules,
  onOpenReport,
  showToast,
}) {
  const handleAction = (id) => {
    switch (id) {
      case 'track':
        onOpenTrack();
        break;
      case 'verify':
        onOpenVerify();
        break;
      case 'rules':
        onOpenRules();
        break;
      case 'report':
        onOpenReport();
        break;
      default:
        break;
    }
  };

  const getActionIcon = (iconName) => {
    switch (iconName) {
      case 'Search':
        return <Search className="w-[18px] h-[18px] text-[#A8582F] stroke-[2]" />;
      case 'FileCheck':
        return <FileCheck className="w-[18px] h-[18px] text-[#A8582F] stroke-[2]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-[18px] h-[18px] text-[#A8582F] stroke-[2]" />;
      case 'BarChart3':
        return <BarChart3 className="w-[18px] h-[18px] text-[#A8582F] stroke-[2]" />;
      default:
        return <Search className="w-[18px] h-[18px] text-[#A8582F] stroke-[2]" />;
    }
  };

  return (
    <div className="w-full h-[128px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[14px] shadow-[0_2px_10px_rgba(120,80,50,0.06)] p-2.5 flex flex-col justify-between transition-card select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-0.5 px-0.5">
        <h3 className="font-serif text-[14.5px] font-semibold text-[#2B2321]">
          Quick Actions
        </h3>
        <button
          onClick={() => showToast && showToast('AICTE Regulatory Quick Actions', 'info')}
          title="More options"
          className="p-1 text-[#9A8F89] hover:text-[#2B2321] rounded-full hover:bg-[#EDE4DC]/50 transition-colors cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Equal Columns */}
      <div className="grid grid-cols-4 gap-1 pt-0.5">
        {quickActionItems.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="flex flex-col items-center justify-start group text-center cursor-pointer"
          >
            {/* 38px peach circle */}
            <div className="w-[38px] h-[38px] rounded-full bg-[#F3DFD2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E8D0C0] group-hover:scale-105 transition-all shadow-xs">
              {getActionIcon(action.icon)}
            </div>
            {/* 11px centered 2-line label */}
            <span className="text-[11px] font-medium text-[#2B2321] group-hover:text-[#A8582F] transition-colors leading-[1.15] mt-1 whitespace-pre-line">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
