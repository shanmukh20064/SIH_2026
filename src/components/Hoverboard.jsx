import React from 'react';
import {
  FilePlus,
  UploadCloud,
  Search,
  FileCheck2,
  Clock,
  MessageSquareCode,
  ArrowRight,
  X
} from 'lucide-react';

export default function Hoverboard({
  isOpen,
  onClose,
  onOpenNewApp,
  onOpenUpload,
  onOpenTrack,
  onOpenVerify,
  onOpenAiWorkflow,
  showToast,
  style = {}
}) {
  if (!isOpen) return null;

  const items = [
    {
      title: 'New Application',
      desc: 'Initiate institutional approval dossier & AI check',
      icon: FilePlus,
      action: () => {
        onClose && onClose();
        if (onOpenAiWorkflow) onOpenAiWorkflow();
        else if (onOpenNewApp) onOpenNewApp();
      },
    },
    {
      title: 'Document Submission',
      desc: 'Upload statutory certificates & deeds',
      icon: UploadCloud,
      action: () => {
        onClose && onClose();
        onOpenUpload && onOpenUpload();
      },
    },
    {
      title: 'Track Application',
      desc: 'Live scrutiny status & dossier inspection',
      icon: Search,
      action: () => {
        onClose && onClose();
        onOpenTrack && onOpenTrack();
      },
    },
    {
      title: 'Verification Status',
      desc: 'Simulated registry adapter lookups',
      icon: FileCheck2,
      action: () => {
        onClose && onClose();
        onOpenVerify && onOpenVerify();
      },
    },
    {
      title: 'Application History',
      desc: 'Archived approval dossiers (2024–2026)',
      icon: Clock,
      action: () => {
        onClose && onClose();
        onOpenTrack && onOpenTrack();
      },
    },
    {
      title: 'Correspondence',
      desc: 'Official gazette notices & board letters',
      icon: MessageSquareCode,
      action: () => {
        onClose && onClose();
        showToast && showToast('Official Regulatory Correspondence: 0 Unread Notices', 'info');
      },
    },
  ];

  return (
    <div
      style={style}
      className="bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl p-4 w-[460px] grid grid-cols-2 gap-2.5 z-50 select-none animate-dropdown"
    >
      <div className="col-span-2 flex items-center justify-between pb-2.5 border-b border-[#EDE4DC] px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A8582F]" />
          <span className="font-serif text-[14px] font-bold text-[#1E1815]">
            Applications Hoverboard
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#8A7E78] hover:text-[#1E1815] hover:bg-[#EDE4DC]/50 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            onClick={item.action}
            className="p-3 rounded-[12px] bg-white hover:bg-[#F3DFD2]/30 border border-[#EDE4DC] hover:border-[#A8582F]/60 flex items-start gap-2.5 text-left transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#F3DFD2] text-[#A8582F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h5 className="text-[12.5px] font-bold text-[#1E1815] leading-tight group-hover:text-[#A8582F]">
                {item.title}
              </h5>
              <p className="text-[10.5px] text-[#5E524C] leading-tight mt-0.5">
                {item.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
