import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight } from 'lucide-react';

export default function ApplicationTypesDonut({ onViewAll, showToast }) {
  const data = [
    { name: 'Extension of Approval', value: 38, color: '#A8582F' },
    { name: 'New Program', value: 24, color: '#0A342B' },
    { name: 'Increase in Seats', value: 18, color: '#3F7D5B' },
    { name: 'Closure', value: 12, color: '#C47D52' },
    { name: 'Others', value: 8, color: '#8A7E78' },
  ];

  return (
    <div className="w-full bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-5 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-[17px] font-bold text-[#1E1815]">
          Application Types
        </h3>
        <button
          onClick={onViewAll}
          className="text-[12px] font-bold text-[#A8582F] hover:underline flex items-center gap-1 cursor-pointer transition-all"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Donut Chart + Breakdown matching Image 1 */}
      <div className="grid grid-cols-[130px_1fr] items-center gap-2 flex-1 my-1">
        {/* Donut Chart with center label */}
        <div className="relative w-[130px] h-[130px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-serif text-[17px] font-bold text-[#1E1815] leading-none">
              1,248
            </span>
            <span className="text-[10px] text-[#8A7E78] font-medium leading-tight mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List matching Image 1 */}
        <div className="flex flex-col gap-1.5 pl-2">
          {data.map((item) => (
            <div
              key={item.name}
              onClick={() => showToast && showToast(`Filtered ${item.name} applications (${item.value}%)`, 'info')}
              className="flex items-center justify-between text-xs cursor-pointer hover:bg-white/60 py-0.5 px-1 rounded transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11.5px] font-medium text-[#5E524C] group-hover:text-[#1E1815] truncate">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-[11.5px] text-[#1E1815] ml-2">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
