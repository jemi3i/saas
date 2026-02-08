
import React from 'react';
import { ExpenseStatus } from '../../types';
import { cn } from '../../lib/utils';

interface ApprovalBadgeProps {
  status: ExpenseStatus;
}

const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ status }) => {
  const styles = {
    [ExpenseStatus.PENDING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [ExpenseStatus.APPROVED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [ExpenseStatus.REJECTED]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
      styles[status]
    )}>
      {status}
    </span>
  );
};

export default ApprovalBadge;
