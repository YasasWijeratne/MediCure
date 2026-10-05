import React from 'react';

export default function StatsCard({ title, value, subtext, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
            {title}
          </span>
          <div className="font-display-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight mt-1">
            {value}
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center shrink-0">
          {typeof Icon === 'string' ? (
            <span className="material-symbols-outlined text-[24px]">{Icon}</span>
          ) : Icon ? (
            <Icon size={24} />
          ) : (
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          )}
        </div>
      </div>
      {subtext && (
        <div className="mt-4 pt-2 flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low/50 rounded-lg px-2.5 py-1.5">
          <span className="font-body-sm text-outline">{subtext}</span>
        </div>
      )}
    </div>
  );
}
