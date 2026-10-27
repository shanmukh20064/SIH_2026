import React, { useState, useEffect } from 'react';
import { X, Folder, FolderOpen, FileText, Download, ExternalLink, RefreshCw, HardDrive } from 'lucide-react';

export default function StorageFilesModal({ isOpen, onClose, showToast }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/storage/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLocalFolder = async () => {
    try {
      const res = await fetch('/api/open-storage');
      if (res.ok) {
        showToast('Storage folder opened in Windows File Explorer (C:\\hackthons\\storage)', 'success');
      } else {
        showToast('Storage path: C:\\hackthons\\storage', 'info');
      }
    } catch (e) {
      showToast('Storage directory: C:\\hackthons\\storage', 'info');
    }
  };

  if (!isOpen) return null;

  const filteredFiles = activeFolder === 'all'
    ? files
    : files.filter(f => f.folder.includes(activeFolder));

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <FolderOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Dossier Storage & Document Repository
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Local directory: <span className="font-mono text-[#0F3D36]">C:\hackthons\storage</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenLocalFolder}
              className="h-[32px] px-3.5 bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Open C:\hackthons\storage directly in Windows File Explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Windows Explorer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8A7E78] hover:text-[#1E1815] hover:bg-[#EDE4DC]/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folder filter tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#FAF7F3] border-b border-[#EDE4DC]/80 text-xs font-medium">
          <button
            onClick={() => setActiveFolder('all')}
            className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${
              activeFolder === 'all'
                ? 'bg-[#A8582F] text-white font-semibold shadow-xs'
                : 'text-[#5E524C] hover:bg-white'
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            onClick={() => setActiveFolder('demo_samples')}
            className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${
              activeFolder === 'demo_samples'
                ? 'bg-[#A8582F] text-white font-semibold shadow-xs'
                : 'text-[#5E524C] hover:bg-white'
            }`}
          >
            Sample Documents
          </button>
          <button
            onClick={() => setActiveFolder('documents')}
            className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${
              activeFolder === 'documents'
                ? 'bg-[#A8582F] text-white font-semibold shadow-xs'
                : 'text-[#5E524C] hover:bg-white'
            }`}
          >
            Uploaded Ingestions
          </button>
        </div>

        {/* File List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#8A7E78] text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning storage files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="w-10 h-10 text-[#C5B8AD] mb-2" />
              <p className="text-xs font-semibold text-[#1E1815]">No files in this folder</p>
              <p className="text-[11px] text-[#8A7E78]">Upload new certificates using the "Upload Documents" action.</p>
            </div>
          ) : (
            filteredFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white border border-[#EDE4DC] rounded-[12px] hover:border-[#A8582F]/50 hover:bg-white transition-all text-xs group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F] flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[#1E1815] truncate max-w-[360px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[11px] text-[#8A7E78]">
                      Folder: {file.folder || 'storage'} • Size: {formatSize(file.size_bytes)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleOpenLocalFolder}
                    className="p-1.5 text-[#8A7E78] hover:text-[#A8582F] hover:bg-[#F3DFD2]/40 rounded-[6px] transition-colors cursor-pointer"
                    title="Open in Windows File Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex items-center justify-between text-xs text-[#5E524C]">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <HardDrive className="w-3.5 h-3.5 text-[#0F3D36]" />
            <span>Path: <code>C:\hackthons\storage</code></span>
          </span>
          <button
            onClick={handleOpenLocalFolder}
            className="text-[#A8582F] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Folder in Explorer →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
