import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Landmark, ExternalLink } from 'lucide-react';
import { verifyWithAdapter } from '../../api';

export default function VerifyDocumentModal({ isOpen, onClose }) {
  const [certNumber, setCertNumber] = useState('FIRE-NOC-2024-8891');
  const [authority, setAuthority] = useState('MockStateFireNOCAdapter');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        verified: true,
        certificateNumber: certNumber.trim(),
        issuingAuthority:
          authority === 'MockStateFireNOCAdapter'
            ? 'Directorate of Fire & Emergency Services, State Govt'
            : 'AICTE Central Institute Master Registry (PID Portal)',
        issueDate: '15-May-2024',
        validTill: '14-May-2027',
        registeredInstitution: 'APEX INSTITUTE OF TECHNOLOGY & SCIENCE',
        registryMatch: '100% Verified Match in Official Government Registry',
        hashSignature: 'sha256:d8e8fca2dc6b1296ec24cce8c43993a8b0c24',
        status: 'AUTHENTIC_AND_VALID',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[560px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Issuing Authority Registry Verification
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Real-time simulated adapter queries against state &amp; central registries
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1815] mb-1">
                Select Registry Adapter
              </label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full h-[40px] px-3 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
              >
                <option value="MockStateFireNOCAdapter">State Fire &amp; Emergency Services NOC Registry</option>
                <option value="MockAICTERegistryAdapter">AICTE Permanent Institute ID (PID) Master Registry</option>
                <option value="MockRevenueDeptAdapter">State Revenue Dept Land Title Registry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1815] mb-1">
                Certificate / License Identifier *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. FIRE-NOC-2024-8891 or PID-1-1097234511"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  className="flex-1 h-[42px] px-3.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 h-[42px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Verify Now'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Verification Results Box */}
          {verificationResult && (
            <div className="bg-white/85 border border-[#3F7D5B]/30 rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#DCEBDD] text-[#3F7D5B] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-serif text-[14px] font-bold text-[#3F7D5B]">
                    {verificationResult.registryMatch}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#3F7D5B] bg-[#DCEBDD] px-2 py-0.5 rounded">
                  AUTHENTIC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#8A7E78] block">Certificate No:</span>
                  <span className="font-semibold text-[#1E1815]">{verificationResult.certificateNumber}</span>
                </div>
                <div>
                  <span className="text-[#8A7E78] block">Issuing Authority:</span>
                  <span className="font-semibold text-[#1E1815]">{verificationResult.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-[#8A7E78] block">Issued To:</span>
                  <span className="font-semibold text-[#1E1815]">{verificationResult.registeredInstitution}</span>
                </div>
                <div>
                  <span className="text-[#8A7E78] block">Validity:</span>
                  <span className="font-semibold text-[#3F7D5B]">{verificationResult.validTill} (Valid)</span>
                </div>
              </div>

              <div className="font-mono text-[9.5px] text-[#8A7E78] pt-1.5 border-t border-[#EDE4DC] truncate">
                Signature: {verificationResult.hashSignature}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
