import React from 'react';
import { FileText, Hourglass, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function KpiCard({ data, isSelected = false, onClick }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-[20px] h-[20px] stroke-[1.9]" />;
      case 'Hourglass':
        return <Hourglass className="w-[20px] h-[20px] stroke-[1.9]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-[20px] h-[20px] stroke-[1.9]" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-[20px] h-[20px] stroke-[1.9]" />;
      default:
        return <FileText className="w-[20px] h-[20px] stroke-[1.9]" />;
    }
  };

  const getTileStyles = (id) => {
    switch (id) {
      case 'total':
        return {
          bg: 'bg-[#F4EDE3]',
          color: 'text-[#B9784F]',
          sparkColor: '#B9784F'
        };
      case 'review':
        return {
          bg: 'bg-[#F7EFE5]',
          color: 'text-[#B9784F]',
          sparkColor: '#C07D53'
        };
      case 'verified':
        return {
          bg: 'bg-[#EAF2EC]',
          color: 'text-[#1F7A4D]',
          sparkColor: '#1F7A4D'
        };
      case 'issues':
        return {
          bg: 'bg-[#FDF0EE]',
          color: 'text-[#C0392B]',
          sparkColor: '#C0392B'
        };
      default:
        return {
          bg: 'bg-[#F4EDE3]',
          color: 'text-[#B9784F]',
          sparkColor: '#B9784F'
        };
    }
  };

  const tile = getTileStyles(data.id);

  const renderSparkline = (points, strokeColor) => {
    if (!points || points.length === 0) return null;
    const width = 100;
    const height = 22;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return { x, y };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cx1 = curr.x + (next.x - curr.x) / 2;
      const cy1 = curr.y;
      const cx2 = curr.x + (next.x - curr.x) / 2;
      const cy2 = next.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.x} ${next.y}`;
    }

    const fillPath = `${d} L ${width} ${height} L 0 ${height} Z`;
    const gradientId = `spark-grad-${data.id}`;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-[100px] h-[22px] overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.14" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#${gradientId})`} />
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const defaultPoints = [20, 28, 35, 30, 45, 42, 60, 58, 70, 75];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      className={`w-full min-h-[118px] bg-white border rounded-[14px] shadow-[0_2px_8px_rgba(100,70,40,0.04)] p-3.5 flex flex-col justify-between transition-all select-none relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
        isSelected
          ? 'border-[#B9784F] ring-2 ring-[#B9784F]/30 bg-[#FAF7F0]'
          : 'border-[#EDE5DA] hover:border-[#B9784F]/50'
      }`}
      title={`Click to filter dossiers: ${data.label}`}
    >
      {/* Main card row: Left Icon + Right Data (Exact Image 1 layout) */}
      <div className="flex items-start gap-3">
        <div
          className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center flex-shrink-0 ${tile.bg} ${tile.color} shadow-xs mt-0.5`}
        >
          {getIcon(data.icon)}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[11.5px] font-medium text-[#77756E] leading-[1.25] line-clamp-2 min-h-[28px]">
            {data.label}
          </span>


          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[25px] font-bold text-[#25251F] font-sans leading-none tracking-tight">
              {data.value}
            </span>
            {data.trend && (
              <span
                className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                  data.trendType === 'success' || data.trend.includes('12%') || data.trend.includes('18%')
                    ? 'text-[#2E7D32]'
                    : data.trendType === 'danger'
                    ? 'text-[#C0392B]'
                    : 'text-[#B9784F]'
                }`}
              >
                {data.trend.includes('%') ? (data.trend.includes('6%') ? '↓ 6%' : data.trend.includes('18%') ? '↑ 18%' : data.trend.includes('24%') ? '↑ 24%' : '↑ 12%') : data.trend}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8A7E78] mt-1">
            <span>{isSelected ? 'Active Filter' : 'vs last month'}</span>
            {isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9784F]" />
            )}
          </div>
        </div>
      </div>

      {/* Sparkline at bottom */}
      <div className="w-full flex justify-end -mb-1 mt-1 opacity-80">
        {renderSparkline(data.sparkline || defaultPoints, tile.sparkColor)}
      </div>
    </div>
  );
}

