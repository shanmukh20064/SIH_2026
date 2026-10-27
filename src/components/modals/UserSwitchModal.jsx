import React from 'react';
import { X, UserCheck, Shield } from 'lucide-react';
import { ensureAuth, authState } from '../../api';

export default function UserSwitchModal({ isOpen, onClose, currentUser = {}, onSelectUser }) {
  if (!isOpen) return null;

  const users = [
    {
      name: 'Shanmukh',
      role: 'Administrator',
      roleDesc: 'Full System & Regulatory Rules Authority',
      avatar: 'S',
      username: 'admin',
      password: 'Admin@123',
    },
    {
      name: 'Dr. Ramesh Kumar',
      role: 'Scrutiny Officer',
      roleDesc: 'Document Verification & Technical Scrutiny Reviewer',
      avatar: 'R',
      username: 'reviewer',
      password: 'Reviewer@123',
    },
    {
      name: 'Apex Institute Tech',
      role: 'Institution Rep',
      roleDesc: 'Dossier Upload & Compliance Clarification',
      avatar: 'A',
      username: 'institution',
      password: 'Inst@123',
    },
  ];

  const handleSelect = async (u) => {
    // Clear old token and fetch new JWT token from backend
    localStorage.removeItem('aicte_jwt_token');
    authState.token = '';
    authState.user = u;
    localStorage.setItem('aicte_user', JSON.stringify(u));
    await ensureAuth(u.username, u.password);
    onSelectUser(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <UserCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Active Regulatory Profile
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Role-Based Access Control (RBAC) Switcher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A7E78] hover:text-[#1E1815] hover:bg-[#EDE4DC]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User cards */}
        <div className="p-6 flex flex-col gap-3">
          {users.map((u) => {
            const isCurrent = (currentUser?.name === u.name) || (currentUser?.username === u.username);
            return (
              <button
                key={u.username}
                onClick={() => handleSelect(u)}
                className={`p-3.5 rounded-[14px] border flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#A8582F] bg-[#F3DFD2]/60 shadow-xs ring-1 ring-[#A8582F]/40'
                    : 'border-[#EDE4DC] bg-white hover:bg-white shadow-xs'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#A8582F] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                  {u.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#1E1815]">{u.name}</span>
                    <span className="text-[10.5px] font-bold text-[#A8582F] uppercase bg-white px-2 py-0.5 rounded shadow-xs">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E524C] mt-0.5">{u.roleDesc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
