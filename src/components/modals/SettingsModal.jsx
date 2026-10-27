import React, { useState } from 'react';
import { X, Settings, Sliders, Shield, Bell, Moon, Sun, Check, Database } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, showToast }) {
  const [fuzzyThreshold, setFuzzyThreshold] = useState(85);
  const [expiryBufferDays, setExpiryBufferDays] = useState(30);
  const [ocrEngine, setOcrEngine] = useState('tesseract');
  const [autoHashing, setAutoHashing] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    showToast && showToast('Scrutiny system settings updated successfully', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[560px] max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <Settings className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[19px] font-bold text-[#1E1815]">
                System &amp; Regulatory Settings
              </h3>
              <p className="text-xs text-[#8A7E78]">
                AICTE Compliance engine parameters and automated verification thresholds
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
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* 1. Scrutiny Engine Thresholds */}
          <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[#1E1815] text-[13px]">
              <Sliders className="w-4 h-4 text-[#A8582F]" />
              <span>Entity Extraction &amp; Fuzzy Matching</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#5E524C] mb-1">
                <span>Institution Name Fuzzy Match Threshold</span>
                <span className="font-mono text-[#A8582F] font-bold">{fuzzyThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={fuzzyThreshold}
                onChange={(e) => setFuzzyThreshold(Number(e.target.value))}
                className="w-full accent-[#A8582F] cursor-pointer"
              />
              <span className="text-[10.5px] text-[#8A7E78]">
                Flags any cross-document name variation with similarity below this threshold.
              </span>
            </div>

            <div className="pt-2 border-t border-[#EDE4DC]/60">
              <div className="flex justify-between font-semibold text-[#5E524C] mb-1">
                <span>Certificate Expiry Commencement Buffer</span>
                <span className="font-mono text-[#A8582F] font-bold">{expiryBufferDays} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={expiryBufferDays}
                onChange={(e) => setExpiryBufferDays(Number(e.target.value))}
                className="w-full accent-[#A8582F] cursor-pointer"
              />
              <span className="text-[10.5px] text-[#8A7E78]">
                Flags certificates expiring within this window prior to session start.
              </span>
            </div>
          </div>

          {/* 2. Security & Verification Engine */}
          <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[#1E1815] text-[13px]">
              <Shield className="w-4 h-4 text-[#A8582F]" />
              <span>Integrity &amp; Cryptographic Verification</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#2B2321] block">Automatic SHA-256 Collision Check</span>
                <span className="text-[11px] text-[#8A7E78]">Block exact duplicate uploads across disparate dossier categories</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoHashing(!autoHashing)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  autoHashing ? 'bg-[#3F7D5B]' : 'bg-[#EDE4DC]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoHashing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EDE4DC]/60">
              <div>
                <span className="font-semibold text-[#2B2321] block">Scrutiny Deficiency Email Notifications</span>
                <span className="text-[11px] text-[#8A7E78]">Send automated alerts when critical findings are confirmed</span>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  emailAlerts ? 'bg-[#3F7D5B]' : 'bg-[#EDE4DC]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex items-center justify-between">
          <span className="text-[11px] text-[#8A7E78]">
            AICTE Scrutiny Engine v1.0.0 • SQLite/PostgreSQL Ready
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 h-[36px] rounded-[8px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[8px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
