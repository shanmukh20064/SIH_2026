import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, ShieldCheck, FileText, Activity, Scale, HelpCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.detail || 'Invalid username or password. Please try again.';
        setErrorMsg(message);
        setLoading(false);
        return;
      }

      const authData = await res.json();
      if (rememberMe) {
        localStorage.setItem('aicte_jwt_token', authData.access_token);
      }
      setLoading(false);
      onLoginSuccess(authData);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Unable to connect to authentication service. Please check your network.');
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-[#F5EFE8] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* 1. Subtle Architectural Watermark Background (No Emblem/Logo) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-18">
        <img
          src="/assets/building_clean.png"
          alt="Government Institutional Architecture"
          className="w-[1100px] max-w-none transform scale-125 object-contain filter contrast-110 drop-shadow-sm"
        />
      </div>

      {/* Translucent Decorative Geometric Shapes in Warm Ivory */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EADCCF]/45 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-[#E0D0C0]/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-white/40 blur-2xl pointer-events-none" />

      {/* Main Container Shell */}
      <div className="relative z-10 w-full max-w-[1240px] min-h-[640px] bg-white/75 backdrop-blur-md border border-[#EDE4DC] rounded-[28px] shadow-[0_20px_50px_rgba(43,28,18,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.25fr_1fr]">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO INFORMATION & 4 FEATURE SECTIONS        */}
        {/* ========================================================= */}
        <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-between relative z-10">
          <div>
            {/* Tagline / Context */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3DFD2]/60 border border-[#A8582F]/30 text-[#A8582F] text-[11px] font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8582F]" />
              Regulatory Compliance & Document Authentication Platform
            </div>

            {/* Exact Required Heading */}
            <h1 className="font-serif text-[32px] sm:text-[40px] lg:text-[44px] font-bold text-[#1E1815] leading-[1.14] tracking-tight">
              Building Quality Technical Education for a Stronger India
            </h1>

            {/* Supporting Text */}
            <p className="mt-4 text-[#5C524C] text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[560px]">
              AI-powered regulatory document scrutiny, multi-point statutory authentication, and automated compliance verification for technical institutions across India.
            </p>

            {/* Four Feature Sections: Apply, Verify, Track, Comply */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#EDE4DC]/80">
              {/* Feature 1: Apply */}
              <div className="flex items-start gap-3.5 p-3 rounded-[14px] bg-[#FAF7F2]/80 border border-[#EDE4DC] hover:border-[#A8582F]/40 transition-colors">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3DFD2] text-[#A8582F] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#1E1815]">Apply</h3>
                  <p className="text-[12px] text-[#6E625B] leading-snug mt-0.5">
                    Statutory dossier creation & annual approval renewal submissions.
                  </p>
                </div>
              </div>

              {/* Feature 2: Verify */}
              <div className="flex items-start gap-3.5 p-3 rounded-[14px] bg-[#FAF7F2]/80 border border-[#EDE4DC] hover:border-[#A8582F]/40 transition-colors">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3DFD2] text-[#A8582F] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#1E1815]">Verify</h3>
                  <p className="text-[12px] text-[#6E625B] leading-snug mt-0.5">
                    Multi-tier cryptographic validation & issuing-authority cross-checks.
                  </p>
                </div>
              </div>

              {/* Feature 3: Track */}
              <div className="flex items-start gap-3.5 p-3 rounded-[14px] bg-[#FAF7F2]/80 border border-[#EDE4DC] hover:border-[#A8582F]/40 transition-colors">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3DFD2] text-[#A8582F] flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#1E1815]">Track</h3>
                  <p className="text-[12px] text-[#6E625B] leading-snug mt-0.5">
                    Live stage progression & transparent regulatory scrutiny timelines.
                  </p>
                </div>
              </div>

              {/* Feature 4: Comply */}
              <div className="flex items-start gap-3.5 p-3 rounded-[14px] bg-[#FAF7F2]/80 border border-[#EDE4DC] hover:border-[#A8582F]/40 transition-colors">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3DFD2] text-[#A8582F] flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#1E1815]">Comply</h3>
                  <p className="text-[12px] text-[#6E625B] leading-snug mt-0.5">
                    Automated AI norms verification & deficiency rectification workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom subtle note */}
          <div className="mt-8 flex items-center gap-2 text-xs text-[#8A7E78]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D]" />
            <span>Secure End-to-End Scrutiny Engine • Version 2026.1</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: FOREST-GREEN CURVED DESIGN & LOGIN FORM      */}
        {/* ========================================================= */}
        <div className="relative bg-gradient-to-br from-[#07372D] via-[#093229] to-[#041D17] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          {/* Subtle curved background overlay */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#105545]/40 blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-[#A2C7BD] uppercase tracking-[0.2em]">
              PORTAL ACCESS
            </span>
            <h2 className="font-serif text-[26px] sm:text-[28px] font-bold text-white mt-1">
              Sign In to Scrutiny System
            </h2>
            <p className="text-[13px] text-[#B5D1CA] mt-1 leading-snug">
              Enter your authorized credentials to access your regulatory workspace.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="relative z-10 mt-6 flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3 rounded-[12px] bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-dropdown">
                <span className="font-bold">Error:</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email or Username Input */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-[#D4E5E1]">
                Email Address or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8BAEa5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, reviewer, or nodal@apextech.edu.in"
                  className="w-full h-11 pl-10 pr-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-[#8BAEA5] text-sm focus:outline-hidden focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-[#D4E5E1]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8BAEA5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-[#8BAEA5] text-sm focus:outline-hidden focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BAEA5] hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-[#B5D1CA] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/30 text-[#B87333] focus:ring-[#B87333] accent-[#B87333] w-3.5 h-3.5"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  showToast && showToast('For password resets, contact your nodal system administrator.', 'info');
                }}
                className="text-[#D99A6C] hover:text-[#E8AA7D] hover:underline transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Copper-Coloured Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-[12px] bg-[#B87333] hover:bg-[#A36428] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="relative z-10 mt-5 p-3 rounded-[12px] bg-black/25 border border-white/10 text-xs">
            <div className="text-[11px] font-semibold text-[#A2C7BD] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Demonstration Accounts</span>
              <span className="text-[10px] text-white/50">(Click to auto-fill)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@123')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-left border border-white/10 transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#E8AA7D]">Admin</div>
                <div className="text-white/60 text-[10px]">admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('reviewer', 'Reviewer@123')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-left border border-white/10 transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#E8AA7D]">Scrutiny</div>
                <div className="text-white/60 text-[10px]">reviewer</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('institution', 'Inst@123')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-left border border-white/10 transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#E8AA7D]">College</div>
                <div className="text-white/60 text-[10px]">institution</div>
              </button>
            </div>
          </div>

          {/* Contact Support Link */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 text-center text-xs text-[#B5D1CA]">
            <span>Need assistance? </span>
            <button
              type="button"
              onClick={() => {
                showToast && showToast('AICTE Regulatory Technical Helpdesk: regulatory-support@aicte-india.org', 'info');
              }}
              className="text-[#E8AA7D] hover:underline font-semibold cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
