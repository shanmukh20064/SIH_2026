import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  GraduationCap,
  Users,
  FileText,
  Edit3,
  Check,
  RefreshCw,
  Lock
} from 'lucide-react';
import { getInstitutions, getMyInstitution, updateInstitutionProfile } from '../../api';

export default function InstitutionsModal({ isOpen, onClose, currentUser, showToast }) {
  const isInstitutionRep = currentUser?.role?.toLowerCase().includes('institution');

  // Single authorized institution for representative
  const [myInstitution, setMyInstitution] = useState({
    id: 'debba1be-2976-4fc8-9b14-07c12b30ac53',
    institution_code: 'AICTE-1-10928374',
    name: 'APEX INSTITUTE OF TECHNOLOGY',
    category: 'Engineering & Technology',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    address: '45 Knowledge Corridor, Whitefield, Bengaluru - 560066',
    affiliated_university: 'Visvesvaraya Technological University (VTU)',
    accreditation: 'NAAC A+ Grade (CGPA 3.42) • NBA Tier-1 Accredited',
    aishe_code: 'C-12498',
    authorized_contact_person: 'Apex Tech Representative',
    contact_email: 'nodal@apextech.edu.in',
    contact_phone: '+91-80-2845-9988',
    approved_intake: 600,
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [institutionsList, setInstitutionsList] = useState([]);
  const [selectedRegistryInst, setSelectedRegistryInst] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    address: myInstitution.address,
    category: myInstitution.category,
    contact_phone: myInstitution.contact_phone,
  });

  useEffect(() => {
    if (isOpen) {
      if (isInstitutionRep) {
        getMyInstitution().then((data) => {
          if (data) {
            setMyInstitution((prev) => ({
              ...prev,
              ...data,
            }));
            setEditForm({
              address: data.address || prev.address,
              category: data.category || prev.category,
              contact_phone: prev.contact_phone,
            });
          }
        });
      } else {
        getInstitutions().then((data) => {
          if (data && data.length > 0) {
            setInstitutionsList(data);
          }
        });
      }
    }
  }, [isOpen, isInstitutionRep]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = await updateInstitutionProfile(myInstitution.id, {
      address: editForm.address,
      category: editForm.category,
    });
    setIsSaving(false);
    setIsEditing(false);
    if (updated) {
      setMyInstitution((prev) => ({
        ...prev,
        address: updated.address || editForm.address,
        category: updated.category || editForm.category,
      }));
      showToast && showToast('Institutional profile updated and persisted to AICTE registry.', 'success');
    } else {
      setMyInstitution((prev) => ({
        ...prev,
        address: editForm.address,
      }));
      showToast && showToast('Profile changes saved locally.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none animate-dropdown">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Solid Warm Ivory/Cream Modal Surface */}
      <div className="relative z-10 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl w-full max-w-[760px] max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4DC] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F3DFD2] flex items-center justify-center text-[#A8582F]">
              <Building2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#1E1815]">
                {isInstitutionRep ? 'Authorized Institutional Profile' : 'AICTE Master Institutional Registry'}
              </h3>
              <p className="text-xs text-[#8A7E78]">
                {isInstitutionRep
                  ? 'Single Institutional Workspace • Role-Isolated Regulatory Clearance'
                  : 'Official Directory of Accredited Technical Education Campuses'}
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

        {/* ============================================================== */}
        {/* CASE A: INSTITUTION REPRESENTATIVE WORKSPACE (SINGLE INSTITUTION) */}
        {/* ============================================================== */}
        {isInstitutionRep ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Institution Badge Strip */}
            <div className="px-6 py-3.5 bg-white border-b border-[#EDE4DC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-[6px] bg-[#0E453A] text-white tracking-wide">
                  PID: {myInstitution.institution_code}
                </span>
                <span className="text-[11px] font-bold text-[#A8582F] bg-[#F3DFD2] px-2.5 py-1 rounded-full">
                  {myInstitution.category}
                </span>
                <span className="text-[11px] text-[#2E7D32] bg-[#EBF3ED] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active Regulatory Standing
                </span>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-white border border-[#EDE4DC] hover:border-[#A8582F] text-xs font-semibold text-[#1E1815] rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#A8582F]" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-[#FAF7F3] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C] rounded-[8px] cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 py-2 border-b border-[#EDE4DC] bg-[#FAF7F3] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-[#A8582F] text-white shadow-xs' : 'text-[#5E524C] hover:bg-white'
                }`}
              >
                Profile &amp; Identity
              </button>
              <button
                onClick={() => setActiveTab('intake')}
                className={`px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer ${
                  activeTab === 'intake' ? 'bg-[#A8582F] text-white shadow-xs' : 'text-[#5E524C] hover:bg-white'
                }`}
              >
                Approved Intake &amp; Courses (600)
              </button>
              <button
                onClick={() => setActiveTab('dossiers')}
                className={`px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer ${
                  activeTab === 'dossiers' ? 'bg-[#A8582F] text-white shadow-xs' : 'text-[#5E524C] hover:bg-white'
                }`}
              >
                Associated Dossiers (2)
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 flex flex-col gap-4 bg-[#FBF8F5] flex-1">
              {activeTab === 'profile' && (
                <>
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="bg-white border border-[#EDE4DC] rounded-[14px] p-5 flex flex-col gap-3 shadow-xs">
                      <h4 className="text-xs font-bold text-[#1E1815] uppercase tracking-wider">
                        Update Permitted Institutional Details
                      </h4>
                      <div>
                        <label className="block text-[11px] font-bold text-[#5E524C] mb-1">
                          Official Campus Address
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full p-2.5 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[8px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#5E524C] mb-1">
                            Discipline Category
                          </label>
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full h-[36px] px-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[8px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#5E524C] mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="text"
                            value={editForm.contact_phone}
                            onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                            className="w-full h-[36px] px-3 bg-[#FBF8F5] border border-[#EDE4DC] rounded-[8px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-[#EDE4DC]">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 h-[34px] rounded-[8px] border border-[#EDE4DC] text-xs font-semibold text-[#5E524C]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 h-[34px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-bold rounded-[8px] flex items-center gap-1.5 shadow-xs"
                        >
                          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Save to AICTE Backend</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Card 1: Official Identity */}
                      <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
                        <div className="flex items-center gap-2 font-serif text-[14px] font-bold text-[#1E1815]">
                          <Award className="w-4 h-4 text-[#A8582F]" />
                          <span>Official Registry Identity</span>
                        </div>
                        <div className="text-xs flex flex-col gap-1.5 pt-1">
                          <div>
                            <span className="text-[#8A7E78] block text-[10.5px]">Legal Campus Name</span>
                            <span className="font-bold text-[#1E1815]">{myInstitution.name}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#EDE4DC]/60">
                            <span className="text-[#8A7E78] text-[10.5px]">Permanent ID (PID)</span>
                            <span className="font-mono font-bold text-[#0E453A] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-[#A8582F]" />
                              {myInstitution.institution_code}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#EDE4DC]/60">
                            <span className="text-[#8A7E78] text-[10.5px]">AISHE Code</span>
                            <span className="font-mono text-[#1E1815]">{myInstitution.aishe_code}</span>
                          </div>
                          <div className="pt-1 border-t border-[#EDE4DC]/60">
                            <span className="text-[#8A7E78] block text-[10.5px]">Campus Address</span>
                            <span className="text-[#1E1815]">{myInstitution.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Affiliation & Accreditation */}
                      <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2.5 shadow-xs">
                        <div className="flex items-center gap-2 font-serif text-[14px] font-bold text-[#1E1815]">
                          <GraduationCap className="w-4 h-4 text-[#A8582F]" />
                          <span>Affiliation &amp; Accreditation</span>
                        </div>
                        <div className="text-xs flex flex-col gap-1.5 pt-1">
                          <div>
                            <span className="text-[#8A7E78] block text-[10.5px]">Affiliated University</span>
                            <span className="font-semibold text-[#1E1815]">{myInstitution.affiliated_university}</span>
                          </div>
                          <div className="pt-1 border-t border-[#EDE4DC]/60">
                            <span className="text-[#8A7E78] block text-[10.5px]">Accreditation Standing</span>
                            <span className="font-semibold text-[#2E7D32]">{myInstitution.accreditation}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#EDE4DC]/60">
                            <span className="text-[#8A7E78] text-[10.5px]">Nodal Email</span>
                            <span className="font-mono text-[#0E453A]">{myInstitution.contact_email}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#EDE4DC]/60">
                            <span className="text-[#8A7E78] text-[10.5px]">Contact Phone</span>
                            <span className="font-mono text-[#1E1815] tabular-nums">{myInstitution.contact_phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'intake' && (
                <div className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EDE4DC]">
                    <span className="font-serif text-[14px] font-bold text-[#1E1815]">
                      Approved Degree Programmes &amp; Annual Intake (2026–2027)
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#EDE4DC] text-[#06241E] tabular-nums">
                      Total: 600 Seats
                    </span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#EDE4DC] text-[#8A7E78] font-bold">
                        <th className="py-2">Course / Programme</th>
                        <th className="py-2">Level</th>
                        <th className="py-2 text-right">Intake</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE4DC]/60">
                      <tr>
                        <td className="py-2 font-semibold text-[#1E1815]">B.Tech - Computer Science &amp; Engineering</td>
                        <td className="py-2 text-[#5E524C]">UG (4 Years)</td>
                        <td className="py-2 text-right font-mono font-bold tabular-nums">180</td>
                        <td className="py-2 text-right text-[#2E7D32] font-semibold">Approved</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#1E1815]">B.Tech - Artificial Intelligence &amp; Data Science</td>
                        <td className="py-2 text-[#5E524C]">UG (4 Years)</td>
                        <td className="py-2 text-right font-mono font-bold tabular-nums">120</td>
                        <td className="py-2 text-right text-[#2E7D32] font-semibold">Approved</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#1E1815]">B.Tech - Electronics &amp; Communication Engg</td>
                        <td className="py-2 text-[#5E524C]">UG (4 Years)</td>
                        <td className="py-2 text-right font-mono font-bold tabular-nums">120</td>
                        <td className="py-2 text-right text-[#2E7D32] font-semibold">Approved</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#1E1815]">B.Tech - Mechanical Engineering</td>
                        <td className="py-2 text-[#5E524C]">UG (4 Years)</td>
                        <td className="py-2 text-right font-mono font-bold tabular-nums">120</td>
                        <td className="py-2 text-right text-[#2E7D32] font-semibold">Approved</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#1E1815]">M.Tech - Cyber Security &amp; Information Assurance</td>
                        <td className="py-2 text-[#5E524C]">PG (2 Years)</td>
                        <td className="py-2 text-right font-mono font-bold tabular-nums">60</td>
                        <td className="py-2 text-right text-[#2E7D32] font-semibold">Approved</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'dossiers' && (
                <div className="flex flex-col gap-2.5">
                  <div className="p-3.5 bg-white border border-[#EDE4DC] rounded-[12px] flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0E453A]">APP-2026-0001</span>
                        <span className="text-[11px] font-semibold text-[#C86432] bg-[#FAF1E8] px-2 py-0.5 rounded">Under Review</span>
                      </div>
                      <p className="text-xs text-[#5E524C] mt-1">Extension of Approval (EOA) for Academic Year 2026-2027</p>
                    </div>
                    <span className="text-[11px] text-[#8A7E78] tabular-nums">Submitted: 21 Oct 2026</span>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EDE4DC] rounded-[12px] flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0E453A]">APP-2026-0003</span>
                        <span className="text-[11px] font-semibold text-[#C86432] bg-[#FAF1E8] px-2 py-0.5 rounded">In Scrutiny</span>
                      </div>
                      <p className="text-xs text-[#5E524C] mt-1">Introduction of New PG Course: M.Tech Cyber Security</p>
                    </div>
                    <span className="text-[11px] text-[#8A7E78] tabular-nums">Submitted: 21 Oct 2026</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE B: ADMINISTRATOR & REVIEWER WORKSPACE (MASTER REGISTRY)   */
          /* ============================================================== */
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Search master institutional registry by name or PID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] px-3.5 bg-white border border-[#EDE4DC] rounded-[10px] text-xs text-[#1E1815] focus:outline-none focus:border-[#A8582F]"
              />
            </div>

            {institutionsList
              .filter((inst) => !searchQuery || inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || inst.institution_code.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white border border-[#EDE4DC] rounded-[14px] p-4 flex flex-col gap-2 shadow-xs hover:border-[#A8582F] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-[15px] font-bold text-[#1E1815]">
                        {inst.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#EDE4DC] text-[#06241E]">
                          PID: {inst.institution_code}
                        </span>
                        <span className="text-[11px] font-semibold text-[#A8582F] bg-[#F3DFD2] px-2 py-0.5 rounded-full">
                          {inst.category || 'Technical Campus'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#5E524C] pt-2 border-t border-[#EDE4DC]/60 mt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8A7E78]" />
                      {inst.district}, {inst.state}
                    </span>
                    <span className="text-[#8A7E78]">
                      {inst.address}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE4DC] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 h-[36px] bg-[#A8582F] hover:bg-[#94491F] text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer"
          >
            Close Institutional Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
