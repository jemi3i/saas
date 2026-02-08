
import React from 'react';
// Fix: Add Role to imports for proper type comparisons
import { Expense, ExpenseStatus, User, Role } from '../../types';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { CheckCircle2, XCircle, Trash2, Eye, FileSearch } from 'lucide-react';
import Button from '../atoms/Button';
import { useAuthStore } from '../../store/authStore';

interface ExpenseTableProps {
  expenses: Expense[];
  onUpdateStatus: (id: string, status: ExpenseStatus) => void;
  onDelete: (id: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onUpdateStatus, onDelete }) => {
  const currentUser = useAuthStore(state => state.user);
  // Fix: Compare role against defined Role enum values instead of invalid strings 'admin' and 'billing'
  const isManager = currentUser?.role === Role.BUSINESS_OWNER || 
                    currentUser?.role === Role.BUSINESS_ADMIN || 
                    currentUser?.role === Role.ACCOUNTANT;

  const getStatusBadge = (status: ExpenseStatus) => {
    const styles = {
      [ExpenseStatus.PENDING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      [ExpenseStatus.APPROVED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      [ExpenseStatus.REJECTED]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", styles[status])}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendor</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map((expense) => (
              <tr key={expense.id} className="transition-colors hover:bg-muted/50 group">
                <td className="p-4 align-middle text-muted-foreground">{formatDate(expense.expenseDate)}</td>
                <td className="p-4 align-middle">
                   <span className="font-medium px-2 py-1 bg-accent/50 rounded text-xs">{expense.category}</span>
                </td>
                <td className="p-4 align-middle">
                  <div>
                    <p className="font-semibold">{expense.vendorName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{expense.description}</p>
                  </div>
                </td>
                <td className="p-4 align-middle font-bold">{formatCurrency(expense.amount)}</td>
                <td className="p-4 align-middle">{getStatusBadge(expense.status)}</td>
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {expense.status === ExpenseStatus.PENDING && isManager && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onUpdateStatus(expense.id, ExpenseStatus.APPROVED)}
                          className="text-emerald-500 hover:bg-emerald-50"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onUpdateStatus(expense.id, ExpenseStatus.REJECTED)}
                          className="text-rose-500 hover:bg-rose-50"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" title="View Receipt">
                      <FileSearch className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="text-rose-500 hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {expenses.map((expense) => (
          <div key={expense.id} className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{formatDate(expense.expenseDate)}</p>
                <h3 className="font-bold">{expense.vendorName}</h3>
                <p className="text-xs text-muted-foreground">{expense.category}</p>
              </div>
              {getStatusBadge(expense.status)}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
              <div className="flex items-center gap-2">
                 {expense.status === ExpenseStatus.PENDING && isManager && (
                   <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/30 h-8 px-2" onClick={() => onUpdateStatus(expense.id, ExpenseStatus.APPROVED)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-rose-500 border-rose-500/30 h-8 px-2" onClick={() => onUpdateStatus(expense.id, ExpenseStatus.REJECTED)}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                   </div>
                 )}
                 <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="text-rose-500">
                    <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseTable;
