import React, { useState } from 'react';
import { X, Building2, Calendar, FileText, Check, RefreshCw } from 'lucide-react';
import { createApplication } from '../../api';

export default function NewApplicationModal({ isOpen, onClose, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    institutionName: '',
    category: 'EXTENSION_OF_APPROVAL',
    academicYear: '2026-2027',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.institutionName.trim()) return;

    setIsSubmitting(true);

    const generatedId = `AICTE-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const backendRes = await createApplication({
      institution_id: 1,
      category: formData.category,
      academic_year: formData.academicYear,
    });

    setIsSubmitting(false);

    const newApp = {
      id: backendRes ? backendRes.application_number : generatedId,
      institution: formData.institutionName.trim(),
      status: 'Under Review',
      statusType: 'warning',
      submittedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: formData.category,
    };

    onSubmitSuccess(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Solid Warm Ivory/Cream Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[540px] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                New Approval Application
              </h3>
              <p className="text-xs text-[#8A7E78]">
                Initiate institutional regulatory scrutiny dossier
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1815] mb-1">
              Institution Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Institute of Technology & Science"
              value={formData.institutionName}
              onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
              className="w-full h-[40px] px-3.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] placeholder-[#8A7E78] focus:outline-none focus:border-[#A8582F] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1815] mb-1">
                Approval Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-[40px] px-3 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
              >
                <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EOA)</option>
                <option value="NEW_INSTITUTION">New Technical Institution</option>
                <option value="NEW_COURSE">New Course / Program</option>
                <option value="SEAT_INCREASE">Increase in Intake Seats</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1815] mb-1">
                Academic Session
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full h-[40px] px-3 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
              >
                <option value="2026-2027">2026–2027 (Current)</option>
                <option value="2027-2028">2027–2028</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1815] mb-1">
                State / Territory
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-[40px] px-3.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E1815] mb-1">
                District / Region
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full h-[40px] px-3.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F] focus:bg-white"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EDE4DC]/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-[38px] rounded-[10px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-[38px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[10px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
              <span>Create Application Dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
