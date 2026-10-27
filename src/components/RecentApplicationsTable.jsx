import React from 'react';
import { CheckSquare, MoreVertical, ArrowRight } from 'lucide-react';

export default function RecentApplicationsTable({ applications, onSelectApp, onOpenViewAll }) {
  const getStatusBadge = (status, type) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#DCEBDD] text-[#3F7D5B]">
            {status}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#F6E1CC] text-[#B5651D]">
            {status}
          </span>
        );
      case 'danger':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#F9D9D5] text-[#C0392B]">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold bg-[#EDE4DC] text-[#2B2321]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full h-[275px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[14px] shadow-[0_2px_10px_rgba(120,80,50,0.06)] p-3 flex flex-col justify-between transition-card select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-[#A8582F]" strokeWidth={2} />
          <h3 className="font-serif text-[15.5px] font-semibold text-[#2B2321]">
            Recent Applications
          </h3>
        </div>

        <button
          onClick={onOpenViewAll}
          className="text-[12px] font-medium text-[#A8582F] hover:underline flex items-center gap-1 transition-all cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-hidden flex-1 flex flex-col justify-between">
        <table className="w-full text-left border-collapse">
          {/* Header Row */}
          <thead>
            <tr className="bg-[#F1EAE3] h-[26px] rounded-[5px] text-[11px] font-semibold text-[#5E524C]">
              <th className="pl-2.5 rounded-l-[5px]">Application ID</th>
              <th>Institution Name</th>
              <th>Status</th>
              <th>Submitted On</th>
              <th className="pr-2 text-right rounded-r-[5px]"></th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-[#EDE4DC]">
            {applications.slice(0, 5).map((app) => (
              <tr
                key={app.id}
                onClick={() => onSelectApp(app)}
                className="h-[30px] text-[11.5px] text-[#2B2321] transition-colors cursor-pointer table-row-hover"
                title="Click to open Scrutiny Review Workspace"
              >
                <td className="pl-2.5 font-semibold text-[#0F3D36]">
                  {app.id}
                </td>
                <td className="font-medium text-[#2B2321] max-w-[160px] truncate">
                  {app.institution}
                </td>
                <td>
                  {getStatusBadge(app.status, app.statusType)}
                </td>
                <td className="text-[#5E524C] whitespace-nowrap text-[11px]">
                  {app.submittedOn}
                </td>
                <td className="pr-2 text-right text-[#9A8F89]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApp(app);
                    }}
                    title="Open Scrutiny Workspace"
                    className="p-0.5 hover:text-[#2B2321] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
