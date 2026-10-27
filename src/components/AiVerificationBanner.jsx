import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AiVerificationBanner({
  onExploreWalkthrough,
  onStartRealVerification,
  showToast
}) {
  return (
    <div className="w-full bg-gradient-to-r from-[#07372D] via-[#0E453A] to-[#093229] border border-[#A2C7BD]/25 rounded-[18px] shadow-[0_4px_16px_rgba(7,55,45,0.12)] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none relative overflow-hidden">
      {/* Background Decorative Emblem Artwork Watermark */}
      <div className="absolute right-0 top-0 bottom-0 w-[240px] pointer-events-none opacity-10 flex items-center justify-center translate-x-8">
        <Sparkles className="w-[180px] h-[180px] text-white" />
      </div>

      {/* Left Content */}
      <div className="flex items-start gap-3.5 z-10 max-w-[760px]">
        <div className="w-11 h-11 rounded-[14px] bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-[#F3DFD2] shadow-xs mt-0.5">
          <Sparkles className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#E5A882] uppercase tracking-[0.2em] font-sans">
              Automated Regulatory Intelligence
            </span>
            <span className="px-2 py-0.2 rounded-full bg-[#E5A882]/20 text-[#F3DFD2] text-[9.5px] font-bold border border-[#E5A882]/30">
              Handbook 2026-27 Compliant
            </span>
          </div>
          <h2 className="font-serif text-[18px] sm:text-[20px] font-bold text-white leading-tight mt-0.5">
            AI Document Verification
          </h2>
          <p className="text-[12.5px] text-white/85 leading-normal mt-1 font-sans">
            Check application completeness, identify inconsistencies, review document validity, and track verification findings.
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 z-10 flex-shrink-0 w-full sm:w-auto">
        <button
          type="button"
          onClick={onExploreWalkthrough}
          className="flex-1 sm:flex-initial h-[40px] px-4 rounded-[12px] bg-white/10 hover:bg-white/20 border border-white/25 text-white text-[12.5px] font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          title="Interactive 8-stage visual explanation of the AI verification process"
        >
          <span>Explore Verification Process</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F3DFD2]" />
        </button>

        <button
          type="button"
          onClick={onStartRealVerification}
          className="flex-1 sm:flex-initial h-[40px] px-4 rounded-[12px] bg-[#B35E35] hover:bg-[#9E4D27] text-white text-[12.5px] font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-[#C86432]"
          title="Run live automated scrutiny on dossier application"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>Start Verification</span>
        </button>
      </div>
    </div>
  );
}
