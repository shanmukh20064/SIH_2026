import React from 'react';
import { ArrowRight, ChevronRight, Upload, Plus } from 'lucide-react';

export default function ActionButtons({ onOpenNewApp, onOpenUpload }) {
  return (
    <div className="w-full flex flex-col justify-between gap-2.5 select-none h-full min-h-[118px]">
      {/* Button 1: New Application */}
      <button
        type="button"
        onClick={onOpenNewApp}
        className="w-full flex-1 min-h-[52px] bg-[#B9784F] hover:bg-[#9E5D3B] text-white rounded-[12px] px-4 flex items-center justify-between shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[14px] shadow-xs group-hover:scale-105 transition-transform">
            <Plus className="w-[15px] h-[15px] stroke-[2.5]" />
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-white">
            New Application
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Button 2: Upload Documents */}
      <button
        type="button"
        onClick={onOpenUpload}
        className="w-full flex-1 min-h-[50px] bg-white hover:bg-[#FAF7F0] border border-[#EDE5DA] rounded-[12px] px-4 flex items-center justify-between shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Upload className="w-[18px] h-[18px] text-[#B9784F] stroke-[2]" />
          <span className="text-[13.5px] font-semibold tracking-tight text-[#25251F]">
            Upload Documents
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#8A7E78] group-hover:text-[#25251F] group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

