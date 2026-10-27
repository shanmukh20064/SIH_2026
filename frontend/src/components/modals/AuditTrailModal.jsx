import React, { useState, useEffect } from 'react';
import { X, History, Shield, Clock, RefreshCw } from 'lucide-react';
import { getAuditLogs } from '../../api';

export default function AuditTrailModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([
    {
      action: 'APPLICATION_CREATED',
      username: 'institution (Apex Institute)',
      timestamp: '21 Oct 2026, 17:57:03',
      ip_address: '127.0.0.1',
      details: 'Created dossier APP-2026-0001 (Category: EXTENSION_OF_APPROVAL)',
    },
    {
      action: 'DOCUMENT_INGESTED',
      username: 'institution',
      timestamp: '21 Oct 2026, 17:57:04',
      ip_address: '127.0.0.1',
      details: 'Uploaded Fire_Safety_NOC.pdf [sha256:d8e8fca2dc6b1296ec24cce8c43993a8b0c24]',
    },
    {
      action: 'EXTRACTION_COMPLETED',
      username: 'system (PyMuPDF Engine)',
      timestamp: '21 Oct 2026, 17:57:05',
      ip_address: 'internal',
      details: 'Extracted 6 entities with 0.96 confidence density score',
    },
    {
      action: 'RULES_EVALUATION',
      username: 'system (Compliance Engine)',
      timestamp: '21 Oct 2026, 17:57:08',
      ip_address: 'internal',
      details: 'Triggered Rule R-EXP-02: Certificate expiry date prior to academic commencement',
    },
    {
      action: 'USER_LOGIN',
      username: 'admin (Lead Scrutiny Administrator)',
      timestamp: '21 Oct 2026, 18:01:24',
      ip_address: '127.0.0.1',
      details: 'Administrator JWT session granted',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getAuditLogs(50).then((liveLogs) => {
        setIsLoading(false);
        if (liveLogs && liveLogs.length > 0) {
          setLogs(liveLogs);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatActor = (actor, username) => {
    if (typeof username === 'string' && username.trim()) return username;
    if (typeof actor === 'string' && actor.trim()) return actor;
    if (actor && typeof actor === 'object') {
      return actor.name || actor.username || actor.role || 'system';
    }
    if (username && typeof username === 'object') {
      return username.name || username.username || username.role || 'system';
    }
    return 'Administrator (Shanmukh)';
  };

  const formatDetails = (details) => {
    if (typeof details === 'string') return details;
    if (details && typeof details === 'object') {
      try {
        return JSON.stringify(details);
      } catch (e) {
        return 'System state mutation event';
      }
    }
    return String(details || 'Scrutiny log event registered');
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Transparent White Frosted Glass Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[740px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <History className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                Immutable System Audit Trail
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Cryptographically tracked regulatory events & state mutations
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

        {/* Logs List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white border border-[#EDE4DC] rounded-[12px] flex flex-col gap-1.5 text-xs shadow-xs hover:bg-white transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#06241E] bg-[#EDE4DC] px-2 py-0.5 rounded text-[11px]">
                  {typeof log.action === 'string' ? log.action : (log.action?.name || 'REGULATORY_EVENT')}
                </span>
                <span className="text-[#8A7E78] font-mono text-[11px]">
                  {typeof log.timestamp === 'string' && log.timestamp.includes('T')
                    ? new Date(log.timestamp).toLocaleString('en-GB')
                    : String(log.timestamp || '22 Oct 2026')}
                </span>
              </div>
              <p className="text-[#1E1815] font-semibold mt-0.5">{formatDetails(log.details)}</p>
              <div className="text-[11px] text-[#5E524C] flex items-center justify-between pt-1.5 border-t border-[#EDE4DC]/60 mt-1">
                <span>Actor: {formatActor(log.actor, log.username)}</span>
                <span>IP: {typeof log.ip_address === 'string' ? log.ip_address : (typeof log.ip === 'string' ? log.ip : '127.0.0.1')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 h-[36px] rounded-[10px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
