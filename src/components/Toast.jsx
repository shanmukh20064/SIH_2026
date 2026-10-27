import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#3F7D5B] flex-shrink-0" />;
      case 'error':
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-[#C0392B] flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-[#A8582F] flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-dropdown">
      <div className="flex items-center gap-3 bg-white border border-[#EDE4DC] shadow-dropdown rounded-[12px] px-4 py-3 min-w-[300px] max-w-[420px]">
        {getIcon()}
        <div className="flex-1 text-sm font-medium text-[#2B2321] leading-snug">
          {toast.message}
        </div>
        <button
          onClick={onClose}
          className="text-[#9A8F89] hover:text-[#2B2321] p-1 rounded-full hover:bg-[#EDE4DC]/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
