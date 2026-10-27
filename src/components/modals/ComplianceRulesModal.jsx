import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Sliders, AlertTriangle, RefreshCw } from 'lucide-react';
import { getComplianceRules, updateComplianceRule } from '../../api';

export default function ComplianceRulesModal({ isOpen, onClose, onSave }) {
  const [rules, setRules] = useState([
    {
      rule_code: 'R-COMP-01',
      name: 'Mandatory Document Completeness',
      description: 'Checks presence of all statutory documents (Fire NOC, Land Deed, Building Completion) based on category.',
      severity: 'CRITICAL',
      is_active: true,
      weight: 100,
    },
    {
      rule_code: 'R-EXP-02',
      name: 'Certificate Expiry & Timeline Coherence',
      description: 'Flags documents expiring before academic session commencement or conflicting dates.',
      severity: 'CRITICAL',
      is_active: true,
      weight: 90,
    },
    {
      rule_code: 'R-NAME-03',
      name: 'Institution Name Fuzzy Token Match',
      description: 'Token-level Levenshtein similarity across disparate documents to detect title alteration.',
      severity: 'CRITICAL',
      is_active: true,
      threshold: 85,
    },
    {
      rule_code: 'R-META-04',
      name: 'Tampering & Metadata Discrepancy',
      description: 'Detects creation timestamps inconsistent with claimed physical issue dates.',
      severity: 'MAJOR',
      is_active: true,
      weight: 70,
    },
    {
      rule_code: 'R-HASH-05',
      name: 'Cryptographic Duplicate Collision',
      description: 'SHA-256 duplicate collision identification preventing duplicate submission.',
      severity: 'CRITICAL',
      is_active: true,
      weight: 100,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getComplianceRules().then((liveRules) => {
        if (liveRules && liveRules.length > 0) {
          setRules(liveRules);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleRule = (code) => {
    setRules((prev) =>
      prev.map((r) =>
        r.rule_code === code ? { ...r, is_active: !r.is_active } : r
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    for (const r of rules) {
      await updateComplianceRule(r.rule_code, {
        is_active: r.is_active,
        severity: r.severity,
      });
    }
    setIsSaving(false);
    onSave && onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[700px] max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <Sliders className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Regulatory Compliance Rules Engine
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Configurable validation thresholds, weights &amp; active heuristics
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

        {/* Rules List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3">
          {rules.map((rule) => (
            <div
              key={rule.rule_code}
              className={`p-4 rounded-[14px] border transition-all ${
                rule.is_active
                  ? 'bg-white border-[#EDE4DC] shadow-xs'
                  : 'bg-[#F7F2EE]/60 border-[#EDE4DC] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded">
                      {rule.rule_code}
                    </span>
                    <h4 className="font-serif text-[14.5px] font-bold text-[#1E1815]">
                      {rule.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-[#F9D9D5] text-[#C0392B]'
                          : 'bg-[#F6E1CC] text-[#B5651D]'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E524C] mt-1.5">
                    {rule.description}
                  </p>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleRule(rule.rule_code)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    rule.is_active ? 'bg-[#3F7D5B]' : 'bg-[#EDE4DC]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      rule.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex items-center justify-between">
          <span className="text-xs text-[#8A7E78]">
            Rule modifications versioned automatically in audit trail
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 h-[36px] rounded-[10px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Rules Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
