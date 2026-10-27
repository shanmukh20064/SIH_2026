import React, { useState } from 'react';
import { X, BarChart3, Download, FileSpreadsheet, FileCode, FileText } from 'lucide-react';

export default function GenerateReportModal({ isOpen, onClose, onDownload, applications = [] }) {
  const [reportFormat, setReportFormat] = useState('html');
  const [selectedApp, setSelectedApp] = useState('');

  if (!isOpen) return null;

  const appOptions = applications.length > 0 ? applications : [
    { id: 'AICTE-2026-001245', institution: 'ABC Engineering College' },
    { id: 'AICTE-2026-001244', institution: 'XYZ Institute of Technology' },
    { id: 'AICTE-2026-001243', institution: 'DEF College of Engineering' },
  ];

  const targetAppId = selectedApp || appOptions[0].id;

  const handleExport = () => {
    const reportUrl = `/api/applications/${targetAppId}/report?format=${reportFormat}`;
    window.open(reportUrl, '_blank');

    onDownload && onDownload(`Scrutiny_Report_${targetAppId}.${reportFormat}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[540px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <BarChart3 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Export Scrutiny Dossier Report
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Certified scrutiny summary with findings &amp; evidence snippets
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
          <div>
            <label className="block text-xs font-bold text-[#1E1815] mb-1">
              Select Dossier Application
            </label>
            <select
              value={targetAppId}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full h-[40px] px-3 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
            >
              {appOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.institution}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1815] mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setReportFormat('html')}
                className={`p-3.5 rounded-[14px] border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  reportFormat === 'html'
                    ? 'border-[#A8582F] bg-[#F3DFD2]/60 text-[#A8582F] shadow-xs'
                    : 'border-[#EDE4DC] bg-white text-[#5E524C] hover:bg-white'
                }`}
              >
                <FileText className="w-6 h-6 stroke-[1.8]" />
                <span className="text-xs font-bold">HTML Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => setReportFormat('json')}
                className={`p-3.5 rounded-[14px] border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  reportFormat === 'json'
                    ? 'border-[#A8582F] bg-[#F3DFD2]/60 text-[#A8582F] shadow-xs'
                    : 'border-[#EDE4DC] bg-white text-[#5E524C] hover:bg-white'
                }`}
              >
                <FileCode className="w-6 h-6 stroke-[1.8]" />
                <span className="text-xs font-bold">JSON Data</span>
              </button>

              <button
                type="button"
                onClick={() => setReportFormat('csv')}
                className={`p-3.5 rounded-[14px] border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  reportFormat === 'csv'
                    ? 'border-[#A8582F] bg-[#F3DFD2]/60 text-[#A8582F] shadow-xs'
                    : 'border-[#EDE4DC] bg-white text-[#5E524C] hover:bg-white'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 stroke-[1.8]" />
                <span className="text-xs font-bold">CSV Sheet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 h-[36px] rounded-[10px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate &amp; Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
