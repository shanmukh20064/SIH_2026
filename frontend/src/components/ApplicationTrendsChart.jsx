import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart2, ChevronDown } from 'lucide-react';

export default function ApplicationTrendsChart({ showToast }) {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const data = [
    { date: '01 Oct', submitted: 48, review: 36, verified: 20, issues: 8 },
    { date: '05 Oct', submitted: 95, review: 68, verified: 38, issues: 20 },
    { date: '10 Oct', submitted: 78, review: 58, verified: 30, issues: 15 },
    { date: '15 Oct', submitted: 130, review: 105, verified: 65, issues: 24 },
    { date: '20 Oct', submitted: 118, review: 88, verified: 58, issues: 18 },
    { date: '25 Oct', submitted: 185, review: 140, verified: 90, issues: 32 },
    { date: '31 Oct', submitted: 155, review: 128, verified: 78, issues: 22 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#EDE4DC] rounded-[10px] p-2.5 shadow-lg text-xs select-none">
          <p className="font-bold text-[#1E1815] mb-1">{label} 2026</p>
          <div className="flex flex-col gap-0.5">
            <span className="text-[#A8582F] font-semibold">Submitted: {payload[0]?.value}</span>
            <span className="text-[#0A342B] font-semibold">Under Review: {payload[1]?.value}</span>
            <span className="text-[#C2A28A] font-semibold">Verified: {payload[2]?.value}</span>
            <span className="text-[#7D878A] font-semibold">Issues: {payload[3]?.value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-[0_2px_10px_rgba(120,80,50,0.05)] p-5 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-[#F3DFD2]/60 text-[#A8582F] mt-0.5">
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-[17px] font-bold text-[#1E1815] leading-tight">
              Application Trends
            </h3>
            <p className="text-[11.5px] text-[#8A7E78] leading-tight mt-0.5">
              Applications received and processed over time
            </p>
          </div>
        </div>

        {/* Time range dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-[32px] px-3 bg-white border border-[#EDE4DC] rounded-full text-[12px] font-semibold text-[#2B2321] flex items-center gap-1.5 hover:border-[#A8582F] transition-all shadow-2xs cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8A7E78] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[38px] w-[140px] bg-white border border-[#EDE4DC] rounded-[12px] shadow-xl py-1.5 z-30 text-[12px]">
              {['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'Year 2026'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setTimeRange(r);
                    setIsDropdownOpen(false);
                    showToast && showToast(`Trend chart updated: ${r}`, 'info');
                  }}
                  className={`w-full text-left px-3.5 py-1.5 hover:bg-[#F7F2EE] transition-colors ${
                    timeRange === r ? 'text-[#A8582F] font-bold' : 'text-[#2B2321]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Multi-line Curve Chart matching Image 1 */}
      <div className="w-full h-[190px] mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE2D8" />
            <XAxis
              dataKey="date"
              stroke="#8A7E78"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#EBE2D8' }}
            />
            <YAxis
              stroke="#8A7E78"
              fontSize={11}
              domain={[0, 200]}
              ticks={[0, 50, 100, 150, 200]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* 1. Submitted (Terracotta) */}
            <Line
              type="monotone"
              dataKey="submitted"
              stroke="#A8582F"
              strokeWidth={2.4}
              dot={{ r: 3.5, fill: '#A8582F', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5 }}
            />
            {/* 2. Under Review (Dark Forest Green) */}
            <Line
              type="monotone"
              dataKey="review"
              stroke="#0A342B"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#0A342B', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5 }}
            />
            {/* 3. Verified (Warm Tan/Beige) */}
            <Line
              type="monotone"
              dataKey="verified"
              stroke="#C2A28A"
              strokeWidth={2}
              dot={{ r: 3.5, fill: '#C2A28A', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5 }}
            />
            {/* 4. Issues (Slate Grey) */}
            <Line
              type="monotone"
              dataKey="issues"
              stroke="#7D878A"
              strokeWidth={1.8}
              dot={{ r: 3, fill: '#7D878A', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 4.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend at bottom matching Image 1 */}
      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-[#EDE4DC]/80 text-[11.5px] font-semibold text-[#5E524C]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A8582F]" />
          <span>Submitted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A342B]" />
          <span>Under Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C2A28A]" />
          <span>Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7D878A]" />
          <span>Issues</span>
        </div>
      </div>
    </div>
  );
}
