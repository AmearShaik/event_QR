import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'payment' | 'eligibility' | 'registration' | 'scan' | 'event';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'payment' }) => {
  const norm = String(status).toUpperCase();

  // Green Badges
  if (
    norm === 'PAID' ||
    norm === 'ELIGIBLE' ||
    norm === 'SUCCESS' ||
    norm === 'REGISTERED' ||
    norm === 'ACTIVE' ||
    norm === 'TRUE'
  ) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
        {norm === 'TRUE' ? 'ELIGIBLE' : norm}
      </span>
    );
  }

  // Orange Badges
  if (norm === 'PARTIALLY_PAID' || norm === 'WARNING' || norm === 'DUPLICATE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        {norm === 'PARTIALLY_PAID' ? 'PARTIALLY PAID' : norm}
      </span>
    );
  }

  // Red Badges
  if (
    norm === 'NOT_PAID' ||
    norm === 'NOT_ELIGIBLE' ||
    norm === 'INVALID' ||
    norm === 'QR_DISABLED' ||
    norm === 'EVENT_INACTIVE' ||
    norm === 'WRONG_EVENT' ||
    norm === 'FALSE'
  ) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
        {norm === 'FALSE' ? 'NOT ELIGIBLE' : norm.replace(/_/g, ' ')}
      </span>
    );
  }

  // Gray / Default Badges
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
      {norm.replace(/_/g, ' ')}
    </span>
  );
};
