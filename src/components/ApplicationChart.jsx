import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { BarChart3, ChevronDown } from 'lucide-react';
import { chartDatasets } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#EDE4DC] rounded-[8px] p-2 shadow-md text-[11px] select-none min-w-[120px]">
        <div className="font-semibold text-[#2B2321] mb-1 pb-1 border-b border-[#EDE4DC]">
          {label}
        </div>
        <div className="flex flex-col gap-0.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-2.5">
              <span className="flex items-center gap-1 text-[#5E524C]">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-[#2B2321]">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ApplicationChart({ showToast }) {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ranges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Academic Year 2026-27'];
  const currentData = chartDatasets[timeRange] || chartDatasets['Last 30 Days'];

  const handleSelectRange = (range) => {
    setTimeRange(range);
    setIsDropdownOpen(false);
    showToast && showToast(`Application overview updated for: ${range}`, 'info');
  };

  return (
    <div className="w-full h-[275px] bg-[#FBF8F5] border border-[#EDE4DC] rounded-[14px] shadow-[0_2px_10px_rgba(120,80,50,0.06)] p-3 flex flex-col justify-between transition-card select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-0.5 relative">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-5 h-5 text-[#A8582F]" strokeWidth={2} />
          <h3 className="font-serif text-[15.5px] font-semibold text-[#2B2321]">
            Application Overview
          </h3>
        </div>

        {/* Dropdown select */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-[28px] px-2.5 bg-white border border-[#EDE4DC] rounded-[6px] text-[11.5px] font-medium text-[#2B2321] flex items-center gap-1 hover:bg-[#F3DFD2]/40 transition-colors shadow-xs cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-[#9A8F89]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[32px] w-[165px] bg-white border border-[#EDE4DC] rounded-[8px] shadow-dropdown py-1 z-30 animate-dropdown">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelectRange(r)}
                  className={`w-full text-left px-3 py-1.5 text-[11.5px] hover:bg-[#F3DFD2]/40 transition-colors cursor-pointer ${
                    timeRange === r ? 'font-semibold text-[#A8582F]' : 'text-[#2B2321]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Line Chart Area */}
      <div className="w-full h-[175px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 6, right: 10, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#E7DED6"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#9A8F89"
              tick={{ fill: '#9A8F89', fontSize: 10 }}
              axisLine={{ stroke: '#E7DED6' }}
              tickLine={false}
              dy={3}
            />
            <YAxis
              domain={[0, 200]}
              ticks={[0, 50, 100, 150, 200]}
              stroke="#9A8F89"
              tick={{ fill: '#9A8F89', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dx={-3}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 4 Monotone Smooth Lines with Circle Markers r=3.5 */}
            <Line
              type="monotone"
              dataKey="submitted"
              name="Submitted"
              stroke="#0F3D36"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#0F3D36', stroke: '#FBF8F5', strokeWidth: 1.2 }}
              activeDot={{ r: 5, fill: '#0F3D36' }}
            />
            <Line
              type="monotone"
              dataKey="underReview"
              name="Under Review"
              stroke="#A8582F"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#A8582F', stroke: '#FBF8F5', strokeWidth: 1.2 }}
              activeDot={{ r: 5, fill: '#A8582F' }}
            />
            <Line
              type="monotone"
              dataKey="verified"
              name="Verified"
              stroke="#C4AC97"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#C4AC97', stroke: '#FBF8F5', strokeWidth: 1.2 }}
              activeDot={{ r: 5, fill: '#C4AC97' }}
            />
            <Line
              type="monotone"
              dataKey="issues"
              name="Issues"
              stroke="#9A9A9A"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#9A9A9A', stroke: '#FBF8F5', strokeWidth: 1.2 }}
              activeDot={{ r: 5, fill: '#9A9A9A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend at bottom */}
      <div className="flex items-center justify-center gap-4 pt-1 text-[12px] text-[#2B2321] font-medium border-t border-[#EDE4DC]/60 mt-0.5">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#0F3D36]" />
          <span>Submitted</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#A8582F]" />
          <span>Under Review</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#C4AC97]" />
          <span>Verified</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#9A9A9A]" />
          <span>Issues</span>
        </div>
      </div>
    </div>
  );
}
