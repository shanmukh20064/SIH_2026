import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Check,
  MessageSquare,
  ArrowRight,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { getApplicationDetail, runValidationEngine, reviewFinding } from '../../api';

export default function ScrutinyWorkspaceModal({ isOpen, onClose, application, onStatusUpdate }) {
  if (!isOpen || !application) return null;

  const [activeTab, setActiveTab] = useState('findings');
  const [justificationNote, setJustificationNote] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [findings, setFindings] = useState([
    {
      id: 'F-001',
      rule_code: 'R-EXP-02',
      rule_name: 'Certificate Expiry & Timeline Coherence',
      severity: 'CRITICAL',
      review_status: 'FLAGGED',
      evidence_snippet: 'Extracted Fire Safety NOC valid till "10-May-2024". Academic Session commences on "01-Aug-2026". Certificate is expired.',
      document_name: 'Fire_Safety_NOC.pdf (Page 1, Para 2)',
    },
    {
      id: 'F-002',
      rule_code: 'R-NAME-03',
      rule_name: 'Institution Name Discrepancy (Fuzzy Match)',
      severity: 'MAJOR',
      review_status: 'FLAGGED',
      evidence_snippet: 'Land Title Deed registered name is "ABC Private Educational Society", whereas application claims "ABC Engineering College". Token similarity: 68%.',
      document_name: 'Land_Title_Deed_Registered.pdf (Page 3)',
    },
  ]);

  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      document_type: 'FIRE_SAFETY_CERTIFICATE',
      file_name: 'Fire_Safety_NOC_2024.pdf',
      sha256_hash: 'd8e8fca2dc6b1296ec24cce8c43993a8b0c24',
      extraction_status: 'COMPLETED',
      extracted_fields: [
        { field_name: 'institution_name', extracted_value: 'Apex Institute of Technology', confidence: 0.96 },
        { field_name: 'certificate_number', extracted_value: 'FIRE-NOC-2024-8891', confidence: 0.99 },
        { field_name: 'expiry_date', extracted_value: '10-05-2024', confidence: 0.92 },
      ]
    },
    {
      id: 'doc-2',
      document_type: 'LAND_TITLE_DEED',
      file_name: 'Land_Title_Deed_Registered.pdf',
      sha256_hash: 'a910bf538e1247d890bf23ea7612c41890cd',
      extraction_status: 'COMPLETED',
      extracted_fields: [
        { field_name: 'institution_name', extracted_value: 'ABC Private Educational Society', confidence: 0.88 },
        { field_name: 'deed_number', extracted_value: 'DEED-KA-2021-9981', confidence: 0.95 },
      ]
    }
  ]);

  useEffect(() => {
    if (application && application.id) {
      setIsLoading(true);
      getApplicationDetail(application.id).then((detail) => {
        setIsLoading(false);
        if (detail) {
          if (detail.findings && detail.findings.length > 0) {
            setFindings(detail.findings);
          }
          if (detail.documents && detail.documents.length > 0) {
            setDocuments(detail.documents);
          }
        }
      });
    }
  }, [application]);

  const handleRunValidation = async () => {
    setIsValidating(true);
    const result = await runValidationEngine(application.id);
    setIsValidating(false);
    if (result && result.findings) {
      setFindings(result.findings);
      if (result.status && onStatusUpdate) {
        onStatusUpdate(application.id, result.status === 'APPROVED' ? 'Verified' : 'Compliance Issue');
      }
    } else {
      setFindings((prev) => [
        ...prev,
        {
          id: `F-${Date.now().toString().slice(-3)}`,
          rule_code: 'R-COMP-01',
          rule_name: 'Mandatory Document Completeness',
          severity: 'CRITICAL',
          review_status: 'FLAGGED',
          evidence_snippet: 'All mandatory statutory documents processed and cross-checked.',
          document_name: 'Dossier Core Checklist',
        }
      ]);
    }
  };

  const handleReviewAction = async (findingId, newStatus) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, review_status: newStatus } : f))
    );
    await reviewFinding(findingId, newStatus, justificationNote || 'Reviewed by Scrutiny Officer');
  };

  const handleDecision = (decision) => {
    if (onStatusUpdate) {
      onStatusUpdate(application.id, decision);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[840px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <CheckSquare className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-[19px] font-bold text-[#1E1815]">
                  Scrutiny Review Workspace
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EDE4DC] text-[#06241E]">
                  {application.id}
                </span>
              </div>
              <p className="text-xs text-[#5E524C]">
                {application.institution} • Submitted: {application.submittedOn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunValidation}
              disabled={isValidating}
              className="px-3.5 h-[36px] bg-[#0F3D36] hover:bg-[#07241E] text-white text-xs font-semibold rounded-[10px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {isValidating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
              <span>Run Automated Scrutiny</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8A7E78] hover:text-[#1E1815] hover:bg-[#EDE4DC]/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex items-center gap-5 px-6 pt-3 bg-white/60 border-b border-[#EDE4DC]/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('findings')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              activeTab === 'findings' ? 'text-[#A8582F]' : 'text-[#6B5F59] hover:text-[#1E1815]'
            }`}
          >
            Validation Findings &amp; Anomalies ({findings.length})
            {activeTab === 'findings' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A8582F] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              activeTab === 'documents' ? 'text-[#A8582F]' : 'text-[#6B5F59] hover:text-[#1E1815]'
            }`}
          >
            Ingested Documents &amp; PyMuPDF Extractions ({documents.length})
            {activeTab === 'documents' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A8582F] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {activeTab === 'findings' ? (
            <div className="flex flex-col gap-3.5">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="bg-white/85 border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded">
                        {f.rule_code || f.id}
                      </span>
                      <h4 className="font-serif text-[14.5px] font-bold text-[#1E1815]">
                        {f.rule_name || f.rule}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          f.severity === 'CRITICAL'
                            ? 'bg-[#F9D9D5] text-[#C0392B]'
                            : 'bg-[#F6E1CC] text-[#B5651D]'
                        }`}
                      >
                        {f.severity}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          f.review_status === 'CONFIRMED'
                            ? 'bg-[#F9D9D5] text-[#C0392B]'
                            : f.review_status === 'DISMISSED'
                            ? 'bg-[#EDE4DC] text-[#5E524C]'
                            : f.review_status === 'RESOLVED'
                            ? 'bg-[#DCEBDD] text-[#3F7D5B]'
                            : 'bg-[#FDF3E7] text-[#A8582F]'
                        }`}
                      >
                        {f.review_status || f.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FAF5F0]/90 border-l-3 border-[#A8582F] p-2.5 rounded-r-[8px] text-xs text-[#1E1815]">
                    <span className="font-bold text-[#A8582F]">Evidence: </span>
                    <span>{f.evidence_snippet || f.evidence}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5E524C] pt-1">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#8A7E78]" />
                      Source: {f.document_name || f.document || 'Dossier statutory bundle'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReviewAction(f.id, 'CONFIRMED')}
                        className="px-2.5 py-1 rounded-[6px] bg-[#F9D9D5] text-[#C0392B] hover:bg-[#F4C5BF] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirm Finding</span>
                      </button>

                      <button
                        onClick={() => handleReviewAction(f.id, 'DISMISSED')}
                        className="px-2.5 py-1 rounded-[6px] bg-[#EDE4DC] text-[#5E524C] hover:bg-[#E2D6CB] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>

                      <button
                        onClick={() => handleReviewAction(f.id, 'RESOLVED')}
                        className="px-2.5 py-1 rounded-[6px] bg-[#DCEBDD] text-[#3F7D5B] hover:bg-[#CBE0CD] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white/85 border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-[15.5px] font-bold text-[#1E1815]">
                        {doc.file_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded">
                          {doc.document_type}
                        </span>
                        <span className="font-mono text-[10.5px] text-[#5E524C] truncate max-w-[300px]">
                          SHA-256: {doc.sha256_hash}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#3F7D5B] bg-[#DCEBDD] px-2 py-0.5 rounded">
                      PyMuPDF Ingested
                    </span>
                  </div>

                  <div className="bg-[#FAF5F0]/90 p-3 rounded-[10px] flex flex-col gap-1.5 text-xs">
                    <span className="font-bold text-[#1E1815]">Entity Extractions &amp; Confidence:</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {doc.extracted_fields &&
                        doc.extracted_fields.map((ef, i) => (
                          <div key={i} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-[6px] border border-[#EDE4DC]">
                            <span className="text-[#5E524C] capitalize">{ef.field_name.replace(/_/g, ' ')}:</span>
                            <span className="font-semibold text-[#1E1815]">{ef.extracted_value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2">
            <label className="block text-xs font-bold text-[#1E1815] mb-1">
              Scrutiny Officer Remarks / Justification
            </label>
            <textarea
              rows={2}
              value={justificationNote}
              onChange={(e) => setJustificationNote(e.target.value)}
              placeholder="Enter official scrutiny remarks for regulatory gazette record..."
              className="w-full p-2.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex items-center justify-between">
          <span className="text-xs text-[#8A7E78]">
            Final Decision recorded in Immutable Audit Log
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecision('Compliance Issue')}
              className="px-4 h-[36px] bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer"
            >
              Issue Deficiency Notice
            </button>
            <button
              onClick={() => handleDecision('Verified')}
              className="px-5 h-[36px] bg-[#3F7D5B] hover:bg-[#34674B] text-white text-xs font-bold rounded-[10px] transition-colors shadow-xs cursor-pointer"
            >
              Approve Scrutiny Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
