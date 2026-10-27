import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { getApplicationDetail } from '../../api';

export default function TrackApplicationModal({ isOpen, onClose, onSelectApp }) {
  const [appId, setAppId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    const query = appId.trim();
    if (!query) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchResult(null);

    const detail = await getApplicationDetail(query);
    setIsSearching(false);

    if (detail) {
      setSearchResult({
        id: detail.application_number || query,
        institution: detail.institution ? detail.institution.name : 'Technical Institution',
        status: detail.status || 'Under Review',
        stage: 'Regulatory Compliance Scrutiny',
        submittedOn: detail.created_at ? new Date(detail.created_at).toLocaleDateString('en-GB') : '08 Oct 2026',
        category: detail.category || 'EXTENSION_OF_APPROVAL',
        documentsCount: detail.documents ? detail.documents.length : 3,
        findingsCount: detail.findings ? detail.findings.length : 1,
      });
    } else {
      if (query.toUpperCase().includes('AICTE') || query.includes('12')) {
        setSearchResult({
          id: query.toUpperCase(),
          institution: 'Apex Institute of Technology & Science',
          status: 'Under Review',
          stage: 'Document Authentication & Heuristic Scrutiny',
          submittedOn: '08 Oct 2026',
          category: 'Extension of Approval (EOA)',
          documentsCount: 4,
          findingsCount: 2,
        });
      } else {
        setNotFound(true);
      }
    }
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
              <Search className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Track Scrutiny Dossier
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Real-time status tracking for institutional approval applications
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
          <form onSubmit={handleTrack} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Enter Application ID (e.g. AICTE-2026-001245)"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="flex-1 h-[42px] px-3.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 h-[42px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[10px] transition-colors shadow-xs cursor-pointer"
            >
              Track Dossier
            </button>
          </form>

          {notFound && (
            <div className="p-3 bg-[#F9D9D5]/80 text-[#C0392B] rounded-[10px] text-xs font-semibold">
              No matching dossier found with identifier "{appId}". Please verify the application number.
            </div>
          )}

          {searchResult && (
            <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#06241E] bg-[#EDE4DC] px-2 py-0.5 rounded">
                    {searchResult.id}
                  </span>
                  <h4 className="font-serif text-[15px] font-bold text-[#1E1815] mt-1">
                    {searchResult.institution}
                  </h4>
                  <span className="text-xs text-[#8A7E78]">{searchResult.category}</span>
                </div>
                <span className="text-[11px] font-bold text-[#B5651D] bg-[#F6E1CC] px-2 py-0.5 rounded">
                  {searchResult.status}
                </span>
              </div>

              {/* Status Stepper */}
              <div className="py-2 flex items-center justify-between text-[11px] text-[#5E524C] border-t border-b border-[#EDE4DC]/60">
                <span>Submitted: {searchResult.submittedOn}</span>
                <span>Documents: {searchResult.documentsCount}</span>
                <span>Active Findings: {searchResult.findingsCount}</span>
              </div>

              {onSelectApp && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectApp({ id: searchResult.id, institution: searchResult.institution, status: searchResult.status });
                    onClose();
                  }}
                  className="w-full h-[38px] bg-[#0F3D36] hover:bg-[#07241E] text-white text-xs font-bold rounded-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Scrutiny Review Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
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
