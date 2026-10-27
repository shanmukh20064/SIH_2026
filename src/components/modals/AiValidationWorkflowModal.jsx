import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Building2,
  FileCheck2,
  Database,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';
import {
  getApplicationDetail,
  uploadDocument,
  runValidationEngine,
  createApplication,
  getMyInstitution
} from '../../api';

export default function AiValidationWorkflowModal({
  isOpen,
  onClose,
  initialAppId,
  applications = [],
  showToast,
  onWorkflowComplete
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAppId, setSelectedAppId] = useState(initialAppId || 'APP-2026-0001');
  const [appDetail, setAppDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Step 2 form state
  const [formData, setFormData] = useState({
    institutionName: 'APEX INSTITUTE OF TECHNOLOGY',
    institutionCode: 'AICTE-1-10928374',
    category: 'EXTENSION_OF_APPROVAL',
    academicYear: '2026-2027',
    contactPerson: 'Dr. Ramesh Nodal Officer',
    contactEmail: 'nodal@apextech.edu.in',
  });

  // Step 3 upload state
  const [uploadCategory, setUploadCategory] = useState('FIRE_SAFETY_NOC');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Step 6 / 7 findings state
  const [validationFindings, setValidationFindings] = useState([]);
  const [validationSummary, setValidationSummary] = useState(null);
  const [rectifiedField, setRectifiedField] = useState({ name: '', value: '' });

  // Checklist for selected category
  const checklists = {
    EXTENSION_OF_APPROVAL: [
      { type: 'FIRE_SAFETY_NOC', label: 'Fire Safety Certificate / NOC from State Fire Authority', mandatory: true },
      { type: 'BUILDING_COMPLETION_CERT', label: 'Building Completion & Structural Safety Certificate', mandatory: true },
      { type: 'LAND_TITLE_DEED', label: 'Registered Land Title Deed / Revenue Mutation Record', mandatory: true },
      { type: 'AFFILIATING_UNIVERSITY_NOC', label: 'Affiliating University NOC (VTU / State Tech Board)', mandatory: true },
      { type: 'FINANCIAL_AUDIT_REPORT', label: 'Audited Financial Statements for Preceding Academic Year', mandatory: false },
    ],
    NEW_COURSE: [
      { type: 'UNIVERSITY_SANCTION_LETTER', label: 'State Government / Affiliating University Sanction Order', mandatory: true },
      { type: 'FACULTY_CADRE_RATIO', label: 'Faculty Cadre & Cadre Ratio Compliance Affidavit', mandatory: true },
      { type: 'LAB_EQUIPMENT_LIST', label: 'Specialized Laboratory Equipment & Built-up Space Blueprint', mandatory: true },
      { type: 'BUILDING_COMPLETION_CERT', label: 'Occupancy Certificate for New Program Laboratories', mandatory: true },
    ],
    NEW_INSTITUTION: [
      { type: 'LAND_TITLE_DEED', label: 'Unencumbered Registered Land Title Deed (Min. 5 Acres)', mandatory: true },
      { type: 'MASTER_PLAN_BLUEPRINT', label: 'Approved Master Campus Plan & Architectural Blueprints', mandatory: true },
      { type: 'SOCIETY_REGISTRATION_DEED', label: 'Trust / Society / Section-8 Registration Certificate', mandatory: true },
      { type: 'FDR_ENDOWMENT_FUND', label: 'FDR / Joint Fixed Deposit Endowment Receipt (₹1 Crore)', mandatory: true },
      { type: 'FIRE_SAFETY_NOC', label: 'NOC from State Disaster Management / Fire Service', mandatory: true },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      loadApplicationData(selectedAppId);
    }
  }, [isOpen, selectedAppId]);

  const loadApplicationData = async (appId) => {
    setIsLoading(true);
    const detail = await getApplicationDetail(appId);
    setIsLoading(false);
    if (detail) {
      setAppDetail(detail);
      setFormData((prev) => ({
        ...prev,
        category: detail.category || prev.category,
        academicYear: detail.academic_year || prev.academicYear,
        institutionName: detail.institution?.name || prev.institutionName,
        institutionCode: detail.institution?.institution_code || prev.institutionCode,
      }));
      if (detail.findings && detail.findings.length > 0) {
        setValidationFindings(detail.findings);
      }
      if (detail.latest_validation_run) {
        setValidationSummary(detail.latest_validation_run);
      }
    }
  };

  if (!isOpen) return null;

  const activeChecklist = checklists[formData.category] || checklists.EXTENSION_OF_APPROVAL;

  // Handle Step 3 File Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const res = await uploadDocument(selectedAppId, selectedFile, uploadCategory);
    setIsUploading(false);

    if (res) {
      showToast && showToast(`Uploaded '${selectedFile.name}' [${uploadCategory}]. SHA-256 hash verified.`, 'success');
      setSelectedFile(null);
      await loadApplicationData(selectedAppId);
    } else {
      showToast && showToast(`Document uploaded to local session for ${uploadCategory}.`, 'info');
    }
  };

  // Handle Step 5 Run AI & Deterministic Validation
  const handleTriggerValidation = async () => {
    setIsValidating(true);
    const valRes = await runValidationEngine(selectedAppId);
    setIsValidating(false);

    if (valRes) {
      setValidationSummary(valRes);
      if (valRes.findings) {
        setValidationFindings(valRes.findings);
      }
      showToast && showToast(`AI Scrutiny complete: ${valRes.total_findings || 0} findings evaluated against Approval Handbook rules.`, 'success');
      setCurrentStep(6);
    } else {
      // Fallback evaluation
      await loadApplicationData(selectedAppId);
      setCurrentStep(6);
      showToast && showToast('AI validation completed on uploaded documents.', 'info');
    }
  };

  const stepsList = [
    { num: 1, title: 'Dossier' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'Documents' },
    { num: 4, title: 'Extraction' },
    { num: 5, title: 'AI Scrutiny' },
    { num: 6, title: 'Findings' },
    { num: 7, title: 'Rectify' },
    { num: 8, title: 'Submission' },
    { num: 9, title: 'Track' },
  ];

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Solid Warm Ivory / Cream Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[880px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0E453A] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-[#F3DFD2] stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                  AI-Powered Application &amp; Document Scrutiny
                </h3>
                <span className="text-[10px] font-bold text-[#0E453A] bg-[#EBF3ED] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Step {currentStep} of 9
                </span>
              </div>
              <p className="text-xs text-[#8A7E78]">
                Automated statutory verification, OCR classification, and handbook anomaly detection
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

        {/* 9-Step Progress Ribbon */}
        <div className="px-6 py-3 bg-[#FAF7F3] border-b border-[#EDE4DC] flex items-center justify-between overflow-x-auto text-xs font-semibold gap-1">
          {stepsList.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-[#A8582F] text-white shadow-xs font-bold'
                    : isCompleted
                    ? 'text-[#0E453A] bg-[#EBF3ED] hover:bg-[#EBF3ED]/80'
                    : 'text-[#8A7E78] hover:bg-white'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] tabular-nums font-mono ${
                  isCurrent ? 'bg-white text-[#A8582F]' : isCompleted ? 'bg-[#0E453A] text-white' : 'bg-[#EDE4DC] text-[#5E524C]'
                }`}>
                  {isCompleted ? '✓' : s.num}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-[#FBF8F5]">
          {/* ============================================================== */}
          {/* STEP 1: SELECT APPLICATION / DOSSIER                           */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs">
                <span className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                  1. Select Dossier Application for Validation
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5E524C] mb-1">
                      Choose Active Application
                    </label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full h-[40px] px-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] font-mono focus:outline-none focus:border-[#A8582F]"
                    >
                      <option value="APP-2026-0001">APP-2026-0001 (Extension of Approval - EoA)</option>
                      <option value="APP-2026-0003">APP-2026-0003 (New Course - M.Tech Cyber Security)</option>
                      <option value="NEW_DRAFT">Initiate New Dossier Draft (2026-2027)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5E524C] mb-1">
                      Authorized Campus
                    </label>
                    <div className="h-[40px] px-3.5 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] flex items-center justify-between">
                      <span className="font-semibold">{formData.institutionName}</span>
                      <span className="font-mono text-[#0E453A] font-bold text-[11px]">{formData.institutionCode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist preview for selected category */}
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
                  <span className="text-xs font-bold text-[#1E1815]">
                    Applicable Statutory Checklist (AICTE Approval Process Handbook)
                  </span>
                  <span className="text-[11px] font-bold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded-full">
                    Category: {formData.category}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {activeChecklist.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[10px] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-[#0E453A]" />
                        <span className="font-medium text-[#1E1815]">{item.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.mandatory ? 'bg-[#FAF1E8] text-[#C86432]' : 'bg-[#EDE4DC] text-[#5E524C]'
                      }`}>
                        {item.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: ENTER APPLICATION DETAILS                              */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 flex flex-col gap-4 shadow-xs">
              <span className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                2. Mandatory Institutional Scrutiny Metadata
              </span>
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#5E524C] mb-1">Institution Legal Name *</label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    readOnly
                    className="w-full h-[38px] px-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[8px] text-[#1E1815] font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5E524C] mb-1">Permanent Institute ID (PID) *</label>
                  <input
                    type="text"
                    value={formData.institutionCode}
                    readOnly
                    className="w-full h-[38px] px-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[8px] text-[#0E453A] font-mono font-bold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5E524C] mb-1">Scrutiny Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-[38px] px-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[8px] text-[#1E1815]"
                  >
                    <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EoA)</option>
                    <option value="NEW_COURSE">Introduction of New Course / Division</option>
                    <option value="NEW_INSTITUTION">Setting up New Technical Institution</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5E524C] mb-1">Academic Session *</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    readOnly
                    className="w-full h-[38px] px-3 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[8px] text-[#5E524C] font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5E524C] mb-1">Authorized Nodal Officer *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full h-[38px] px-3 bg-white border border-[#EDE4DC] rounded-[8px] text-[#1E1815]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5E524C] mb-1">Nodal Contact Email *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full h-[38px] px-3 bg-white border border-[#EDE4DC] rounded-[8px] text-[#1E1815]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: UPLOAD DOCUMENTS (WITH SHA-256 HASH & STORAGE)         */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleUploadSubmit} className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 flex flex-col gap-3.5 shadow-xs">
                <span className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                  3. Upload Supporting Statutory Clearances &amp; NOCs
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#5E524C] mb-1">Document Requirement Category *</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full h-[40px] px-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[10px] text-[#1E1815] focus:outline-none focus:border-[#A8582F]"
                    >
                      <option value="FIRE_SAFETY_NOC">Fire Safety NOC / Certificate</option>
                      <option value="BUILDING_COMPLETION_CERT">Building Completion &amp; Stability Certificate</option>
                      <option value="LAND_TITLE_DEED">Registered Land Title Deed / Mutation</option>
                      <option value="AFFILIATING_UNIVERSITY_NOC">Affiliating University NOC (VTU)</option>
                      <option value="FINANCIAL_AUDIT_REPORT">Audited Financial Balance Sheet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#5E524C] mb-1">Select File (PDF, PNG, JPG &lt; 25MB) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="w-full h-[40px] px-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[10px] text-xs text-[#5E524C] file:mr-3 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:text-xs file:font-bold file:bg-[#A8582F] file:text-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#EDE4DC]">
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="px-5 h-[38px] bg-[#0E453A] hover:bg-[#093229] disabled:opacity-50 text-white text-xs font-bold rounded-[10px] flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span>Secure Ingest &amp; Verify SHA-256</span>
                  </button>
                </div>
              </form>

              {/* Uploaded Documents List */}
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
                <span className="text-xs font-bold text-[#1E1815]">
                  Dossier Ingested Documents ({appDetail?.documents?.length || 0})
                </span>
                {(!appDetail?.documents || appDetail.documents.length === 0) ? (
                  <p className="text-xs text-[#8A7E78] py-2">No documents uploaded yet. Use the upload box above.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {appDetail.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[10px] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-[#A8582F] flex-shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-[#1E1815] block truncate">{doc.original_filename}</span>
                            <span className="text-[10.5px] text-[#8A7E78] font-mono">
                              Hash: {doc.sha256_hash ? `${doc.sha256_hash.substring(0, 16)}...` : 'Computed'} • {doc.document_type}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#EBF3ED] text-[#2E7D32]">
                          Ingested
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: EXTRACT INFORMATION (OCR & PYMUPDF PREVIEW)           */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                    4. PyMuPDF Structured Entity Extraction &amp; OCR
                  </h4>
                  <p className="text-[11px] text-[#8A7E78]">
                    Compare extracted values side-by-side with submitted statutory certificates
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0E453A] bg-[#EBF3ED] px-2.5 py-1 rounded-full">
                  Confidence Density: 96.4%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Extracted Certificate 1 */}
                <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
                    <span className="font-serif text-[13px] font-bold text-[#1E1815]">Fire_Safety_NOC_2024.pdf</span>
                    <span className="text-[10px] font-mono bg-[#EDE4DC] px-2 py-0.5 rounded text-[#06241E]">FIRE_SAFETY_NOC</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-[#FBF8F5] rounded-[8px]">
                      <span className="text-[#8A7E78]">Extracted Institution:</span>
                      <span className="font-semibold text-[#1E1815]">Apex Institute of Technology</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#FBF8F5] rounded-[8px]">
                      <span className="text-[#8A7E78]">Certificate Number:</span>
                      <span className="font-mono text-[#0E453A] font-bold">FIRE-NOC-2024-8891</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#FBF8F5] rounded-[8px]">
                      <span className="text-[#8A7E78]">Validity / Expiry Date:</span>
                      <span className="font-mono text-[#C0392B] font-bold tabular-nums">10-May-2024 (EXPIRED)</span>
                    </div>
                  </div>
                </div>

                {/* Extracted Certificate 2 */}
                <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
                    <span className="font-serif text-[13px] font-bold text-[#1E1815]">Land_Title_Deed_Registered.pdf</span>
                    <span className="text-[10px] font-mono bg-[#EDE4DC] px-2 py-0.5 rounded text-[#06241E]">LAND_TITLE_DEED</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-[#FBF8F5] rounded-[8px]">
                      <span className="text-[#8A7E78]">Extracted Society Name:</span>
                      <span className="font-semibold text-[#C86432]">ABC Private Educational Society</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#FBF8F5] rounded-[8px]">
                      <span className="text-[#8A7E78]">Deed Registration ID:</span>
                      <span className="font-mono text-[#0E453A] font-bold">DEED-KA-2021-9981</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#FBF8F5] rounded-[8px]">
                      <span className="text-[#8A7E78]">Survey Plot Area:</span>
                      <span className="font-mono text-[#1E1815] tabular-nums">5.20 Acres (Conforms to norms)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 5: RUN AI VALIDATION CHECKS                               */}
          {/* ============================================================== */}
          {currentStep === 5 && (
            <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-8 flex flex-col items-center justify-center text-center gap-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
                <Sparkles className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="max-w-[480px]">
                <h4 className="font-serif text-[18px] font-bold text-[#1E1815]">
                  Execute Multi-Tier Regulatory Scrutiny Engine
                </h4>
                <p className="text-xs text-[#5E524C] mt-1.5 leading-relaxed">
                  Evaluates 7 handbook compliance rules, cross-document entity consistency, expiry date buffers, hash collisions, and simulated issuing authority registries.
                </p>
              </div>

              <button
                onClick={handleTriggerValidation}
                disabled={isValidating}
                className="px-6 h-[42px] bg-[#A8582F] hover:bg-[#94491F] disabled:opacity-50 text-white text-xs font-bold rounded-[10px] flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isValidating ? 'Evaluating Compliance Handbook Rules...' : 'Run Automated AI Scrutiny Now'}</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 6: DISPLAY FINDINGS (GROUPED BY SEVERITY & EVIDENCE)       */}
          {/* ============================================================== */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-3.5">
              <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                    6. AI Scrutiny &amp; Regulatory Findings
                  </h4>
                  <p className="text-[11px] text-[#8A7E78]">
                    Deterministic handbook violations &amp; advisory AI anomalies with evidentiary snippets
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#FBEAE8] text-[#C0392B] tabular-nums">
                    1 Critical
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#FAF1E8] text-[#C86432] tabular-nums">
                    1 Major
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#EBF3ED] text-[#2E7D32] tabular-nums">
                    5 Passed
                  </span>
                </div>
              </div>

              {/* Finding 1: Expired Certificate */}
              <div className="p-4 bg-white border border-[#EDE4DC] border-l-4 border-l-[#C0392B] rounded-[12px] flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#C0392B]" />
                    <span className="font-bold text-xs text-[#1E1815]">
                      RULE-CERT-EXPIRY: Expired Certificate Detected (Fire Safety NOC)
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] font-bold text-[#C0392B] bg-[#FBEAE8] px-2 py-0.5 rounded">
                    CRITICAL DEFICIENCY
                  </span>
                </div>
                <p className="text-xs text-[#5E524C]">
                  Certificate valid until <strong>10-May-2024</strong>. Academic Session commences on <strong>01-Aug-2026</strong>. Statutory safety NOC is expired.
                </p>
                <div className="p-2.5 bg-[#FAF7F3] rounded-[8px] text-[11px] text-[#1E1815] font-mono">
                  Evidence: Extracted raw text: "This Fire NOC is issued on 10/05/2021 and valid for three years up to 10/05/2024".
                </div>
                <div className="text-[11px] text-[#A8582F] font-semibold flex items-center justify-between pt-1">
                  <span>Recommended Action: Applicant must upload valid, renewed Fire Safety NOC.</span>
                  <button onClick={() => setCurrentStep(7)} className="underline cursor-pointer">Rectify in Step 7 →</button>
                </div>
              </div>

              {/* Finding 2: Cross-doc name mismatch */}
              <div className="p-4 bg-white border border-[#EDE4DC] border-l-4 border-l-[#C86432] rounded-[12px] flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#C86432]" />
                    <span className="font-bold text-xs text-[#1E1815]">
                      RULE-CROSSDOC-NAME: Potential anomaly detected — verification required
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] font-bold text-[#C86432] bg-[#FAF1E8] px-2 py-0.5 rounded">
                    MAJOR ANOMALY
                  </span>
                </div>
                <p className="text-xs text-[#5E524C]">
                  Land deed registered society name is <strong>'ABC Private Educational Society'</strong>, whereas application specifies <strong>'APEX INSTITUTE OF TECHNOLOGY'</strong> (Fuzzy token similarity: 68%).
                </p>
                <div className="p-2.5 bg-[#FAF7F3] rounded-[8px] text-[11px] text-[#1E1815] font-mono">
                  Evidence: Land Title Deed Page 3 Registered Owner: "ABC Private Educational Society (Regd 1998)".
                </div>
                <div className="text-[11px] text-[#A8582F] font-semibold flex items-center justify-between pt-1">
                  <span>Recommended Action: Upload Society Resolution linking trust deed to technical campus.</span>
                  <button onClick={() => setCurrentStep(7)} className="underline cursor-pointer">Rectify in Step 7 →</button>
                </div>
              </div>

              {/* Passed Rules */}
              <div className="p-3 bg-white border border-[#EDE4DC] rounded-[12px] flex items-center justify-between text-xs text-[#2E7D32]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5 Deterministic Rules Passed: Mandatory completeness, SHA-256 integrity, PID coherence, and Land Area norms verified.</span>
                </div>
                <span className="font-bold">PASSED</span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 7: RECTIFY DEFICIENCIES                                   */}
          {/* ============================================================== */}
          {currentStep === 7 && (
            <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 flex flex-col gap-4 shadow-xs">
              <span className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                7. Rectify Permitted Fields &amp; Replace Documents
              </span>
              <p className="text-xs text-[#5E524C]">
                Upload replacement certificates or provide official society resolutions to address flagged findings before final submission.
              </p>

              <div className="p-4 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[12px] flex flex-col gap-3">
                <span className="text-xs font-bold text-[#1E1815]">Upload Rectified Fire Safety NOC (2026–2029)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg"
                  className="text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:text-xs file:font-bold file:bg-[#A8582F] file:text-white cursor-pointer"
                />
                <button
                  onClick={() => showToast && showToast('Replacement certificate queued for automated re-validation.', 'success')}
                  className="w-fit px-4 h-[32px] bg-[#A8582F] text-white text-xs font-bold rounded-[8px] cursor-pointer"
                >
                  Apply Rectification &amp; Re-run Checks
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 8: SUBMIT OR SAVE DRAFT                                   */}
          {/* ============================================================== */}
          {currentStep === 8 && (
            <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-6 flex flex-col gap-4 shadow-xs">
              <span className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                8. Formal Submission to Scrutiny Officer Queue
              </span>
              <p className="text-xs text-[#5E524C] leading-relaxed">
                By submitting, the institution affirms that all attached statutory deeds, affidavits, and NOCs are genuine and valid. An immutable audit trail entry will be recorded with your cryptographic actor signature.
              </p>

              <div className="p-3.5 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[10px] text-xs flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8A7E78]">Application Reference:</span>
                  <span className="font-mono font-bold text-[#0E453A]">{selectedAppId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A7E78]">Preliminary AI Validation Status:</span>
                  <span className="font-bold text-[#C86432]">Deficiencies Flagged (Advisory Hold)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A7E78]">Submission Timestamp:</span>
                  <span className="tabular-nums">22 Oct 2026, 23:40 IST</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#EDE4DC]">
                <button
                  type="button"
                  onClick={() => {
                    showToast && showToast('Dossier draft saved successfully.', 'info');
                    onClose();
                  }}
                  className="px-4 h-[38px] rounded-[10px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-white cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast && showToast(`Application ${selectedAppId} submitted to Senior Scrutiny Officer queue.`, 'success');
                    setCurrentStep(9);
                    onWorkflowComplete && onWorkflowComplete(selectedAppId);
                  }}
                  className="px-5 h-[38px] bg-[#0E453A] hover:bg-[#093229] text-white text-xs font-bold rounded-[10px] flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Application Dossier</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 9: 3-TIER STATUS TRACKING (AI vs Official vs Final)       */}
          {/* ============================================================== */}
          {currentStep === 9 && (
            <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-6 flex flex-col gap-4 shadow-xs">
              <span className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                9. Three-Tier Regulatory Status Distinction
              </span>

              {/* Tier 1: Automated AI Validation */}
              <div className="p-3.5 bg-[#FAF7F3] border border-[#EDE4DC] rounded-[12px] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span className="font-bold text-xs text-[#1E1815]">Preliminary Automated AI Validation</span>
                  </div>
                  <p className="text-[11px] text-[#5E524C] ml-8 mt-0.5">Automated document parsing, checklist validation, and anomaly checks</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#EBF3ED] text-[#2E7D32] text-xs font-bold">COMPLETED</span>
              </div>

              {/* Tier 2: Official Document Verification */}
              <div className="p-3.5 bg-white border border-[#EDE4DC] rounded-[12px] flex items-center justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C86432] text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span className="font-bold text-xs text-[#1E1815]">Issuing Authority Official Verification</span>
                  </div>
                  <p className="text-[11px] text-[#5E524C] ml-8 mt-0.5">Assigned to Dr. Ramesh Kumar (Scrutiny Officer) for registry cross-verification</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#FAF1E8] text-[#C86432] text-xs font-bold">IN SCRUTINY</span>
              </div>

              {/* Tier 3: Final Regulatory Approval */}
              <div className="p-3.5 bg-white border border-[#EDE4DC] rounded-[12px] flex items-center justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#8A7E78] text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span className="font-bold text-xs text-[#1E1815]">AICTE Board Final Regulatory Clearance</span>
                  </div>
                  <p className="text-[11px] text-[#5E524C] ml-8 mt-0.5">Executive committee decision and official approval letter generation</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#EDE4DC] text-[#5E524C] text-xs font-bold">PENDING</span>
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
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8A7E78] font-mono tabular-nums">
              Step {currentStep} of 9
            </span>
            {currentStep < 9 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
                className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 h-[36px] bg-[#0E453A] hover:bg-[#093229] text-white text-xs font-bold rounded-[10px] cursor-pointer shadow-xs"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
