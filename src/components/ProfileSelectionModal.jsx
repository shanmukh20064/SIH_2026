import React, { useState } from 'react';
import { UserCheck, Shield, AlertTriangle, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';

export default function ProfileSelectionModal({
  isOpen,
  authenticatedUser, // { access_token, role, username, full_name }
  onSelectProfile,
  onBackToLogin,
  showToast,
}) {
  const [deniedProfile, setDeniedProfile] = useState(null);

  if (!isOpen) return null;

  // The 3 Predefined Profiles exactly per specification
  const profiles = [
    {
      id: 'admin',
      name: 'Shanmukh',
      role: 'ADMINISTRATOR',
      roleDesc: 'Full System & Regulatory Rules Authority',
      avatar: 'S',
      requiredRole: 'admin',
      targetWorkspace: 'Administrator Dashboard',
      username: 'admin',
    },
    {
      id: 'reviewer',
      name: 'Dr. Ramesh Kumar',
      role: 'SCRUTINY OFFICER',
      roleDesc: 'Document Verification & Technical Scrutiny Reviewer',
      avatar: 'R',
      requiredRole: 'reviewer',
      targetWorkspace: 'Security Officer Scrutiny Console',
      username: 'reviewer',
    },
    {
      id: 'institution',
      name: 'Apex Institute Tech',
      role: 'INSTITUTION REP',
      roleDesc: 'Dossier Upload & Compliance Clarification',
      avatar: 'A',
      requiredRole: 'institution',
      targetWorkspace: 'Apex Institute Representative Portal',
      username: 'institution',
    },
  ];

  const handleProfileClick = (p) => {
    // Backend Role Validation Enforcement
    const userRole = (authenticatedUser?.role || '').toLowerCase();
    const isAuthorized =
      userRole === p.requiredRole ||
      (userRole === 'admin' && p.requiredRole === 'admin');

    if (!isAuthorized) {
      setDeniedProfile(p);
      showToast &&
        showToast(
          `Access Denied: Your account (${authenticatedUser?.username || 'user'}) is not authorized for the ${p.role} profile.`,
          'danger'
        );
      return;
    }

    setDeniedProfile(null);
    onSelectProfile({
      name: p.name,
      role: p.name === 'Shanmukh' ? 'Administrator' : p.name === 'Dr. Ramesh Kumar' ? 'Security Officer' : 'Institution Rep',
      roleDesc: p.roleDesc,
      avatar: p.avatar,
      username: authenticatedUser.username,
      token: authenticatedUser.access_token,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none font-sans bg-black/60 backdrop-blur-sm animate-dropdown">
      <div className="relative z-10 bg-[#FAF7F2] border border-[#EDE4DC] rounded-[22px] shadow-2xl w-full max-w-[560px] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-7 py-5 border-b border-[#EDE4DC] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F] shadow-xs">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-serif text-[20px] font-bold text-[#1E1815] leading-snug">
                Select Active Profile
              </h2>
              <p className="text-xs text-[#8A7E78]">
                Authenticated as: <strong className="text-[#A8582F] font-semibold">{authenticatedUser?.username || 'user'}</strong> ({authenticatedUser?.role?.toUpperCase() || 'ROLE'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-[#F3DFD2]/40 hover:text-[#A8582F] transition-colors cursor-pointer"
            title="Sign into a different account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>
        </div>

        {/* Access Denied Warning Banner */}
        {deniedProfile && (
          <div className="mx-6 mt-4 p-3.5 rounded-[12px] bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Role Authorization Restriction:</span>
              <p className="mt-0.5 leading-relaxed">
                Your authenticated account <strong>{authenticatedUser?.username}</strong> has the role <strong>{authenticatedUser?.role}</strong> and cannot access the <strong>{deniedProfile.role}</strong> workspace. Please select your authorized profile or switch accounts.
              </p>
            </div>
          </div>
        )}

        {/* Profile Cards (Matching Reference Visual) */}
        <div className="p-6 sm:p-7 flex flex-col gap-3.5">
          {profiles.map((p) => {
            const userRole = (authenticatedUser?.role || '').toLowerCase();
            const isMatch = userRole === p.requiredRole;

            return (
              <button
                type="button"
                id={`profile-card-${p.id}`}
                key={p.id}
                onClick={() => handleProfileClick(p)}
                className={`w-full p-4 rounded-[16px] border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isMatch
                    ? 'border-[#A8582F] bg-[#F7EFE8] hover:bg-[#F4E9DF] shadow-sm hover:shadow-md ring-1 ring-[#A8582F]/30'
                    : 'border-[#EDE4DC] bg-white hover:border-[#D1B8A5] hover:bg-white/90 opacity-80'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar Initial Circle */}
                  <div className="w-12 h-12 rounded-full bg-[#A8582F] text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                    {p.avatar}
                  </div>

                  {/* Profile Name & Description */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-[#1E1815]">
                        {p.name}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5E524C] mt-0.5 leading-snug">
                      {p.roleDesc}
                    </p>
                  </div>
                </div>

                {/* Right Badge & Action */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-3">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-[6px] shadow-xs ${
                    isMatch
                      ? 'bg-white text-[#A8582F] border border-[#A8582F]/30'
                      : 'bg-[#F2ECE5] text-[#8A7E78]'
                  }`}>
                    {p.role}
                  </span>
                  {isMatch ? (
                    <span className="text-[11px] font-semibold text-[#A8582F] flex items-center gap-1">
                      Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#8A7E78]">
                      Unauthorized
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="px-7 py-3.5 bg-[#F1ECE6] border-t border-[#EDE4DC] flex items-center justify-between text-xs text-[#5E524C]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#1F7A4D]" />
            Role-Based Access Control (RBAC) Enforced
          </span>
          <span className="text-[#8A7E78]">SIH 2026 Prototype</span>
        </div>
      </div>
    </div>
  );
}
