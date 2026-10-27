import React, { useState } from 'react';
import {
  FileText,
  FileCheck2,
  ShieldCheck,
  Search,
  Flag,
  ArrowRight,
  ChevronDown,
  BarChart3
} from 'lucide-react';

export default function StatusFlow({ onFilterStage, showToast }) {
  const [activeStage, setActiveStage] = useState(null);

  const stages = [
    { id: 'submitted', label: 'Submitted', count: '1,248', icon: FileText, isPrimary: true },
    { id: 'validation', label: 'Document Validation', count: '892', icon: FileCheck2 },
    { id: 'compliance', label: 'Compliance Check', count: '514', icon: ShieldCheck },
    { id: 'verification', label: 'Verification', count: '324', icon: Search },
    { id: 'decision', label: 'Review & Decision', count: '186', icon: Flag },
  ];

  const handleStageClick = (stage) => {
    setActiveStage(stage.id === activeStage ? null : stage.id);
    if (onFilterStage) {
      onFilterStage(stage.id);
    }
    showToast && showToast(`Filtering applications at stage: ${stage.label}`, 'info');
  };

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EDE4DC] rounded-[16px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-4 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-left">
            <h3 className="font-serif text-[16px] font-bold text-[#25251F] leading-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#25251F] stroke-[2]" />
              Application Status Flow
            </h3>
            <p className="text-[11.5px] text-[#77756E] mt-0.5">
              From submission to final decision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#EDE4DC] rounded-lg text-xs text-[#5E524C] shadow-xs cursor-pointer">
          <span>This Month</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A7E78]" />
        </div>
      </div>

      {/* Horizontal Stepper matching Image 1 */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 py-2 overflow-x-auto">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage === stage.id;

          return (
            <React.Fragment key={stage.id}>
              <div
                onClick={() => handleStageClick(stage)}
                className={`flex flex-col items-center flex-1 min-w-[70px] cursor-pointer group transition-all p-1.5 rounded-xl ${
                  isSelected ? 'bg-[#F3DFD2]/60 ring-1 ring-[#B9784F]' : 'hover:bg-white/80'
                }`}
                title={`Click to view ${stage.count} applications at ${stage.label}`}
              >
                {/* Circle Icon */}
                <div
                  className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${
                    stage.isPrimary || isSelected
                      ? 'bg-[#B9784F] text-white'
                      : 'bg-white border-2 border-[#EDE4DC] text-[#5E524C] group-hover:border-[#B9784F]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                {/* Stage Label */}
                <span className="text-[11px] font-medium text-[#5E524C] text-center mt-2 leading-tight">
                  {stage.label}
                </span>

                {/* Stage Count */}
                <span className="text-[14px] font-bold text-[#2B2321] mt-0.5">
                  {stage.count}
                </span>
              </div>

              {/* Connecting Arrow */}
              {idx < stages.length - 1 && (
                <div className="text-[#C5B8AD] flex items-center justify-center -mt-6 flex-shrink-0">
                  <ArrowRight className="w-4 h-4 stroke-[1.8]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
