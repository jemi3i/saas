
import React from 'react';
import { cn } from '../../lib/utils';
import { InvoiceStatus } from '../../types';

interface BadgeProps {
  status: InvoiceStatus | string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case InvoiceStatus.PAID:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case InvoiceStatus.PENDING:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case InvoiceStatus.OVERDUE:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case InvoiceStatus.DRAFT:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      getStatusStyles(status),
      className
    )}>
      {status.toUpperCase()}
    </span>
  );
};

export default Badge;
