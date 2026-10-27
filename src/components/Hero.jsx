import React from 'react';

export default function Hero({ currentUser }) {
  return (
    <div className="w-full bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-[0_2px_12px_rgba(120,80,50,0.05)] px-6 py-4 flex items-center justify-between relative overflow-hidden select-none">
      {/* 1. Left Welcome Text */}
      <div className="flex flex-col z-10 max-w-[340px]">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#B35E35] mb-1 font-sans">
          WELCOME BACK,
        </span>
        <h1 className="font-serif text-[32px] sm:text-[34px] font-bold text-[#1E1815] leading-[1.1] tracking-tight">
          {currentUser ? currentUser.name : 'Shanmukh'}
        </h1>
        <p className="text-[12.5px] text-[#5C524C] leading-[1.4] mt-2 font-sans">
          Monitor applications, validate documents and ensure regulatory compliance in technical education.
        </p>
      </div>

      {/* 2. Middle Building Illustration (Direct from Image 1) */}
      <div className="hidden md:flex flex-1 items-center justify-center relative h-[120px] mx-4 pointer-events-none">
        <img
          src="/assets/building_clean.png"
          alt="AICTE Headquarters Campus"
          className="h-[120px] max-w-[420px] object-contain filter contrast-105 opacity-90 drop-shadow-xs"
        />
      </div>

      {/* 3. Right Quote Box matching Image 1 */}
      <div className="hidden lg:flex flex-col justify-between w-[220px] bg-white/70 border border-[#EDE4DC] rounded-[14px] p-3.5 z-10 shadow-xs backdrop-blur-xs flex-shrink-0">
        <span className="font-serif text-[36px] text-[#C47D52] leading-[0.8] select-none font-bold">
          “
        </span>
        <p className="font-serif text-[12px] italic font-semibold text-[#1E1815] leading-[1.3] mt-1 text-left">
          Enabling Quality Technical Education for a Developed India
        </p>

        {/* Indian Tricolor Bar underneath */}
        <div className="flex w-[48px] h-[3px] rounded-full overflow-hidden mt-2.5">
          <span className="w-1/2 h-full bg-[#E8832A]" title="Saffron" />
          <span className="w-1/2 h-full bg-[#1F7A4D]" title="Green" />
        </div>
      </div>
    </div>
  );
}
