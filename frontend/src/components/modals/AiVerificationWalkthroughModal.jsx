import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  UploadCloud,
  FileSearch,
  ShieldCheck,
  Building2,
  Lock,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Search,
  Eye,
  Check,
  Clock,
  Layers
} from 'lucide-react';

export default function AiVerificationWalkthroughModal({
  isOpen,
  onClose,
  onLaunchRealVerification
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => Math.min(8, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Application Details', subtitle: 'Category & Regulatory Checklist' },
    { num: 2, title: 'Document Upload', subtitle: 'File Ingestion & SHA-256 Hashing' },
    { num: 3, title: 'OCR Extraction', subtitle: 'PyMuPDF Text & Entity Parsing' },
    { num: 4, title: 'Rule Validation', subtitle: 'Deterministic Handbook Checks' },
    { num: 5, title: 'AI Anomaly Detection', subtitle: 'Semantic & Cross-Document Checks' },
    { num: 6, title: 'Issuing Authority', subtitle: 'External Registry Cross-Check' },
    { num: 7, title: 'Corrective Actions', subtitle: 'Findings & Rectification Report' },
    { num: 8, title: 'Review & Tracking', subtitle: 'Dossier Submission & Security Scrutiny' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 select-none animate-dropdown">
      {/* Soft Dimmed Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Solid Warm Ivory / Cream Dialog Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[20px] shadow-2xl w-full max-w-[940px] max-h-[92vh] flex flex-col overflow-hidden text-[#1E1815]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0E453A] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-[#F3DFD2] stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-[18px] sm:text-[19px] font-bold text-[#1E1815]">
                  AI Document Verification Walkthrough
                </h3>
                <span className="text-[10px] font-bold text-[#0E453A] bg-[#EBF3ED] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Stage {currentStep} of 8
                </span>
              </div>
              <p className="text-xs text-[#8A7E78]">
                Interactive guide to automated regulatory checks, PyMuPDF extraction, and handbook anomaly detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A7E78] hover:text-[#1E1815] hover:bg-[#EDE4DC]/50 transition-colors cursor-pointer"
            title="Close walkthrough (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8-Stage Progress Ribbon */}
        <div className="px-5 py-2.5 bg-[#FAF7F3] border-b border-[#EDE4DC] flex items-center justify-between overflow-x-auto no-scrollbar gap-1 text-xs">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-[#B35E35] text-white shadow-xs font-bold'
                    : isCompleted
                    ? 'text-[#0E453A] bg-[#EBF3ED] hover:bg-[#EBF3ED]/80 font-semibold'
                    : 'text-[#8A7E78] hover:bg-white font-medium'
                }`}
                title={`Jump to Step ${s.num}: ${s.title}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] tabular-nums font-mono ${
                  isCurrent ? 'bg-white text-[#B35E35]' : isCompleted ? 'bg-[#0E453A] text-white' : 'bg-[#EDE4DC] text-[#5E524C]'
                }`}>
                  {isCompleted ? '✓' : s.num}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-[#FBF8F5]">
          {/* ============================================================== */}
          {/* STAGE 1: APPLICATION DETAILS                                    */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 1 • Baseline Verification Setup
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Application Details &amp; Regulatory Checklist Association
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Demonstration Preview
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  When an institution representative submits an application, the platform first determines the specific approval category and automatically associates the mandatory regulatory checklist defined in the <strong>AICTE Approval Process Handbook (APH 2026-27)</strong>.
                </p>

                {/* Demonstration Data Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <div className="bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] p-3 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-[#1E1815] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#B35E35]" />
                      Authorized Institutional Identity
                    </span>
                    <div className="text-xs text-[#5E524C] flex flex-col gap-0.5 mt-1">
                      <div><strong className="text-[#1E1815]">College:</strong> Apex Institute of Technology</div>
                      <div><strong className="text-[#1E1815]">PID:</strong> AICTE-1-10928374</div>
                      <div><strong className="text-[#1E1815]">Affiliation:</strong> Visvesvaraya Technological University (VTU)</div>
                      <div><strong className="text-[#1E1815]">Accreditation:</strong> NAAC A+ Grade (CGPA 3.42)</div>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] p-3 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-[#1E1815] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#0E453A]" />
                      Regulatory Category &amp; Intake
                    </span>
                    <div className="text-xs text-[#5E524C] flex flex-col gap-0.5 mt-1">
                      <div><strong className="text-[#1E1815]">Category:</strong> Extension of Approval (EoA)</div>
                      <div><strong className="text-[#1E1815]">Academic Year:</strong> 2026-2027</div>
                      <div><strong className="text-[#1E1815]">Approved Intake:</strong> 600 Seats (UG + PG)</div>
                      <div><strong className="text-[#1E1815]">Previous Status:</strong> EoA Granted for 2025-26</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#EBF3ED] border border-[#A2C7BD]/40 rounded-[10px] flex items-start gap-2.5 text-xs text-[#0E453A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mandatory Checklist Identified:</strong> 5 statutory documents required for Extension of Approval (Fire Safety NOC, Building Completion, Land Title Deed, University Affiliation Letter, Audited Accounts).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 2: DOCUMENT UPLOAD                                       */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 2 • Secure File Ingestion
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Document Upload, Cryptographic Hashing &amp; Sanitization
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Demonstration Preview
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  Institutions upload high-resolution statutory certificates. Before document parsing begins, the platform performs multi-layered pre-processing: file-type whitelisting, size restrictions, malware scanning, and cryptographic <strong>SHA-256 fingerprinting</strong>.
                </p>

                <div className="bg-[#FAF7F3] border border-[#EDE4DC] rounded-[12px] p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#1E1815]">Pre-processing Safeguards:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-[#0E453A]">1. Permitted Formats</span>
                      <span className="text-[11px] text-[#5E524C]">PDF, PNG, JPG, JPEG (Max 10MB per document)</span>
                    </div>
                    <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-[#B35E35]">2. Integrity Fingerprint</span>
                      <span className="text-[11px] font-mono text-[#5E524C] truncate">SHA-256 cryptographic hash calculated</span>
                    </div>
                    <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-[#2E7D32]">3. Malware Screening</span>
                      <span className="text-[11px] text-[#5E524C]">MIME-type validation &amp; executable prevention</span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#EDE4DC] rounded-[8px] p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#B35E35]" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1E1815]">Fire_Safety_Certificate_2026.pdf</span>
                        <span className="text-[10px] text-[#8A7E78] font-mono">Size: 2.4 MB • SHA-256: d8e8fca2dc6b1296ec24cce8c439...</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#EBF3ED] text-[#2E7D32] font-bold text-[10.5px]">
                      Validated &amp; Stored
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 3: OCR & INFORMATION EXTRACTION                          */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 3 • Intelligent Text &amp; Metadata Extraction
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Optical Character Recognition (PyMuPDF / OCR) Pipeline
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Illustrative Sample Values
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  The extraction engine parses multi-page PDFs and scanned certificates using <strong>PyMuPDF</strong> vector text extraction and OCR fallback. Key statutory fields are extracted alongside statistical confidence scores.
                </p>

                {/* Illustrative Extraction Table */}
                <div className="border border-[#EDE4DC] rounded-[10px] overflow-hidden text-xs">
                  <div className="bg-[#FAF7F3] px-3.5 py-2 border-b border-[#EDE4DC] flex items-center justify-between font-bold text-[#5E524C]">
                    <span>Extracted Statutory Field</span>
                    <div className="flex items-center gap-8">
                      <span>Parsed Value (Illustrative)</span>
                      <span>Confidence</span>
                    </div>
                  </div>

                  <div className="divide-y divide-[#EDE4DC] bg-white">
                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#1E1815]">Institution Name</span>
                      <div className="flex items-center gap-6">
                        <span className="text-[#1E1815]">Apex Institute of Technology</span>
                        <span className="font-mono text-[11px] font-bold text-[#2E7D32] bg-[#EBF3ED] px-2 py-0.5 rounded">98%</span>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#1E1815]">Certificate / Order Reference</span>
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-[#1E1815]">NOC/FIRE/KA-BLR/2026/0491</span>
                        <span className="font-mono text-[11px] font-bold text-[#2E7D32] bg-[#EBF3ED] px-2 py-0.5 rounded">99%</span>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#1E1815]">Issue Date</span>
                      <div className="flex items-center gap-6">
                        <span className="text-[#1E1815]">14 Jan 2026</span>
                        <span className="font-mono text-[11px] font-bold text-[#2E7D32] bg-[#EBF3ED] px-2 py-0.5 rounded">95%</span>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#1E1815]">Validity Period / Expiry</span>
                      <div className="flex items-center gap-6">
                        <span className="text-[#1E1815]">13 Jan 2027</span>
                        <span className="font-mono text-[11px] font-bold text-[#2E7D32] bg-[#EBF3ED] px-2 py-0.5 rounded">94%</span>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#1E1815]">Issuing Authority</span>
                      <div className="flex items-center gap-6">
                        <span className="text-[#1E1815]">Director General of Karnataka Fire Services</span>
                        <span className="font-mono text-[11px] font-bold text-[#2E7D32] bg-[#EBF3ED] px-2 py-0.5 rounded">96%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[8px] text-[11.5px] text-[#5E524C]">
                  <em>Note: Institution representatives are permitted to review extracted values and rectify optical misreads before formal submission.</em>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 4: RULE-BASED VALIDATION                                 */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 4 • Deterministic Compliance Engine
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Rule-Based Handbook Validation (AICTE APH 2026-27)
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Handbook Rules
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  Before applying any AI inference, deterministic regulatory rules are strictly evaluated against the approval handbook requirements. Hard compliance constraints are checked deterministically without relying on probabilistic models.
                </p>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="p-3 rounded-[10px] border border-[#A2C7BD] bg-[#EBF3ED] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      <div>
                        <div className="font-bold text-[#1E1815]">R-EXP-01: Document Validity Period</div>
                        <div className="text-[11px] text-[#5E524C]">Fire Safety NOC valid through 13 Jan 2027; covers academic commencement date (01 Aug 2026).</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#2E7D32] text-white font-bold text-[10px]">PASSED</span>
                  </div>

                  <div className="p-3 rounded-[10px] border border-[#A2C7BD] bg-[#EBF3ED] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      <div>
                        <div className="font-bold text-[#1E1815]">R-LAND-01: Minimum Land Area Threshold</div>
                        <div className="text-[11px] text-[#5E524C]">Campus registered area is 5.40 Acres, satisfying the minimum threshold of 5.00 Acres for Urban Category.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#2E7D32] text-white font-bold text-[10px]">PASSED</span>
                  </div>

                  <div className="p-3 rounded-[10px] border border-[#E5A882] bg-[#FAF1E8] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#C86432]" />
                      <div>
                        <div className="font-bold text-[#1E1815]">R-CADRE-02: Faculty Cadre Ratio Verification</div>
                        <div className="text-[11px] text-[#5E524C]">Cadre ratio is 1:2.4:6.8 (Professor: Associate: Assistant). Handbook requires 1:2:6 ratio for sanctioned intake.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#C86432] text-white font-bold text-[10px]">DEFICIENCY FLAGGED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 5: AI-ASSISTED ANOMALY DETECTION                         */}
          {/* ============================================================== */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 5 • Semantic &amp; Cross-Document Intelligence
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      AI-Assisted Anomaly Detection &amp; Cross-Consistency Checks
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    AI Scrutiny Engine
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  AI algorithms compare text across multiple uploaded deeds, certificates, and application forms. They identify subtle inconsistencies, fuzzy entity mismatches, duplicate documents, and chronological anomalies.
                </p>

                {/* Anomaly Card Example */}
                <div className="bg-[#FAF7F3] border border-[#EDE4DC] rounded-[12px] p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#B35E35] bg-[#F3DFD2] px-2 py-0.5 rounded">
                        R-NAME-03
                      </span>
                      <span className="font-bold text-xs text-[#1E1815]">
                        Entity Name Discrepancy (Fuzzy Token Match)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#F9D9D5] text-[#C0392B] text-[10px] font-bold uppercase">
                      Potential Anomaly Flagged
                    </span>
                  </div>

                  <div className="bg-white border-l-3 border-[#B35E35] p-3 rounded-r-[8px] text-xs">
                    <span className="font-bold text-[#B35E35]">Extracted Evidence: </span>
                    <span className="text-[#1E1815]">
                      Land Title Deed (Page 2) registered to <em>'Apex Educational Trust'</em>, whereas Building Completion Certificate (Page 1) lists <em>'Apex Technical Society'</em>. Token similarity: 68%.
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#FAF5F0] border border-[#EDE4DC] rounded-[8px] text-[11px] text-[#5E524C]">
                    <strong>Important Clarification:</strong> An AI anomaly flag is an indication requiring human scrutiny or institutional clarification—never an automated penalty or final verdict.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 6: ISSUING AUTHORITY VERIFICATION                        */}
          {/* ============================================================== */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 6 • External Registry Cross-Verification
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Issuing Authority Portal Adapters &amp; Six Standardized States
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Registry Adapters
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  Where digital integrations exist, extracted certificate numbers are checked against official issuing-authority registries (State Fire Services, Affiliating University Portals, Revenue Departments). The system distinguishes six explicit states:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex items-center justify-between">
                    <span className="font-semibold text-[#1E1815]">1. Verified by Authorized Source</span>
                    <span className="text-[10.5px] font-bold text-[#2E7D32] bg-[#EBF3ED] px-2 py-0.5 rounded">VERIFIED</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex items-center justify-between">
                    <span className="font-semibold text-[#1E1815]">2. Mismatch Detected</span>
                    <span className="text-[10.5px] font-bold text-[#C0392B] bg-[#F9D9D5] px-2 py-0.5 rounded">MISMATCH</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex items-center justify-between">
                    <span className="font-semibold text-[#1E1815]">3. Expired</span>
                    <span className="text-[10.5px] font-bold text-[#B5651D] bg-[#F6E1CC] px-2 py-0.5 rounded">EXPIRED</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex items-center justify-between">
                    <span className="font-semibold text-[#1E1815]">4. Verification Pending</span>
                    <span className="text-[10.5px] font-bold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded">PENDING</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex items-center justify-between">
                    <span className="font-semibold text-[#1E1815]">5. Source Unavailable</span>
                    <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2 py-0.5 rounded">UNAVAILABLE</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EDE4DC] rounded-[8px] flex items-center justify-between">
                    <span className="font-semibold text-[#1E1815]">6. Manual Review Required</span>
                    <span className="text-[10.5px] font-bold text-[#0E453A] bg-[#A2C7BD]/30 px-2 py-0.5 rounded">MANUAL</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[8px] text-[11px] text-[#5E524C]">
                  <em>Ethical Policy: The platform never implies official government verification has occurred unless an authorized external registry has successfully responded.</em>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 7: RESULTS & CORRECTIVE ACTIONS                          */}
          {/* ============================================================== */}
          {currentStep === 7 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 7 • Actionable Scrutiny Summary
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Validation Report &amp; Inline Deficiencies Rectification
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Action Center
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  Upon completion of automated checks, the institution receives a clear breakdown of passed rules, missing documents, and flagged anomalies. Representatives can immediately rectify permitted deficiencies before submitting to senior scrutiny.
                </p>

                {/* Scorecard Metric Row */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-[#EBF3ED] rounded-[8px] border border-[#A2C7BD]">
                    <div className="text-[18px] font-bold text-[#2E7D32] tabular-nums">14</div>
                    <div className="text-[10.5px] text-[#5E524C]">Passed Checks</div>
                  </div>
                  <div className="p-2 bg-[#FAF1E8] rounded-[8px] border border-[#E5A882]">
                    <div className="text-[18px] font-bold text-[#C86432] tabular-nums">1</div>
                    <div className="text-[10.5px] text-[#5E524C]">Deficiency</div>
                  </div>
                  <div className="p-2 bg-[#F9D9D5] rounded-[8px] border border-[#F4C5BF]">
                    <div className="text-[18px] font-bold text-[#C0392B] tabular-nums">1</div>
                    <div className="text-[10.5px] text-[#5E524C]">Anomaly Flag</div>
                  </div>
                  <div className="p-2 bg-[#FAF7F3] rounded-[8px] border border-[#EDE4DC]">
                    <div className="text-[18px] font-bold text-[#1E1815] tabular-nums">0</div>
                    <div className="text-[10.5px] text-[#5E524C]">Expired Docs</div>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1E1815]">Action Recommended:</span>
                    <p className="text-[11px] text-[#5E524C]">Upload Land Trust Mutation Deed or Society Registration Amendment to resolve trust name mismatch.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLaunchRealVerification && onLaunchRealVerification();
                    }}
                    className="px-3.5 h-[32px] rounded-[8px] bg-[#B35E35] text-white font-bold text-xs hover:bg-[#9E4D27] cursor-pointer whitespace-nowrap"
                  >
                    Rectify Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 8: REVIEW & TRACKING                                     */}
          {/* ============================================================== */}
          {currentStep === 8 && (
            <div className="flex flex-col gap-4 animate-dropdown">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#EDE4DC] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B35E35] uppercase tracking-wider font-sans">
                      Stage 8 • Lifecycle &amp; Security Officer Oversight
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-[#1E1815] mt-0.5">
                      Dossier Submission, Case Scrutiny &amp; Three-Tier Distinction
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#5E524C] bg-[#EDE4DC] px-2.5 py-1 rounded-full">
                    Final Overview
                  </span>
                </div>

                <p className="text-xs text-[#5E524C] leading-relaxed">
                  Following institutional submission, the application enters the formal scrutiny workflow. Security Officers review evidence in dedicated workspaces, record official remarks, and escalate or approve dossiers.
                </p>

                {/* 3-Tier Hierarchy */}
                <div className="flex flex-col gap-2 text-xs">
                  <div className="p-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center font-bold text-xs">1</span>
                      <div>
                        <span className="font-bold text-[#1E1815]">Tier 1: Automated AI &amp; Handbook Validation</span>
                        <div className="text-[10.5px] text-[#5E524C]">Machine parsing, completeness check, and anomaly identification</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#EBF3ED] text-[#2E7D32] font-bold text-[10px]">PRELIMINARY</span>
                  </div>

                  <div className="p-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#C86432] text-white flex items-center justify-center font-bold text-xs">2</span>
                      <div>
                        <span className="font-bold text-[#1E1815]">Tier 2: Authorized Security Officer Scrutiny</span>
                        <div className="text-[10.5px] text-[#5E524C]">Human document authentication, registry check &amp; deficiency notice issuance</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FAF1E8] text-[#C86432] font-bold text-[10px]">SCRUTINY</span>
                  </div>

                  <div className="p-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#8A7E78] text-white flex items-center justify-center font-bold text-xs">3</span>
                      <div>
                        <span className="font-bold text-[#1E1815]">Tier 3: Executive AICTE Board Clearance</span>
                        <div className="text-[10.5px] text-[#5E524C]">Final regulatory decision &amp; official Extension of Approval gazette order</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#EDE4DC] text-[#5E524C] font-bold text-[10px]">COUNCIL ORDER</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF5F0] border border-[#B35E35]/40 rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
                  <div>
                    <span className="font-bold text-xs text-[#B35E35]">Ready to test with active dossier?</span>
                    <p className="text-[11px] text-[#5E524C]">Launch the real 9-step AI verification workflow on your application.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLaunchRealVerification && onLaunchRealVerification();
                    }}
                    className="h-[36px] px-5 rounded-[10px] bg-[#0E453A] hover:bg-[#06241E] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-[#F3DFD2]" />
                    <span>Launch Live AI Scrutiny</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 h-[36px] rounded-[10px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-[#FBF8F5] disabled:opacity-30 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Stage</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8A7E78] font-mono tabular-nums">
              Stage {currentStep} of 8
            </span>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
                className="px-5 h-[36px] bg-[#B35E35] hover:bg-[#9E4D27] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchRealVerification && onLaunchRealVerification();
                }}
                className="px-5 h-[36px] bg-[#0E453A] hover:bg-[#06241E] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F3DFD2]" />
                <span>Launch Live Scrutiny</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
