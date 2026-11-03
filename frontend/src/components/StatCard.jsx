import React from 'react';

export default function StatCard({ title, value, unit = '', icon: Icon, color = 'navy', subtitle }) {
  const colorMap = {
    navy: 'bg-navy-50 text-navy-800 border-navy-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const iconBgMap = {
    navy: 'bg-navy-900 text-white',
    teal: 'bg-teal-600 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-600 text-white',
    blue: 'bg-blue-600 text-white',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${iconBgMap[color] || 'bg-navy-900 text-white'} shadow-sm flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
