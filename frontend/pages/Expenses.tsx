import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  CreditCard,
  ChevronDown,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import ExpenseTable from '../components/organisms/ExpenseTable';
import { useExpenseStore } from '../store/expenseStore';
import { useBusinessStore } from '../store/businessStore';
import { useToastStore } from '../store/toastStore';
import { ExpenseStatus } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import SkeletonLoader from '../components/organisms/SkeletonLoader';
import EmptyState from '../components/molecules/EmptyState';
import { exportExpensesToCSV, generateExpenseReport } from '../services/pdfService';

const CATEGORIES = [
  'All',
  'office_supplies',
  'travel',
  'meals',
  'utilities',
  'software',
  'hardware',
  'marketing',
  'rent',
  'salaries',
  'insurance',
  'taxes',
  'professional_services',
  'other',
];

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, approveExpense, deleteExpense, fetchExpenses, stats } = useExpenseStore();
  const { currentBusiness } = useBusinessStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchExpenses(currentBusiness.id).finally(() => setLoading(false));
    }
  }, [currentBusiness?.id]);

  const filteredExpenses = expenses.filter((e) => {
    const vendorName = e.vendor || e.vendorName || '';
    const matchesSearch =
      vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingCount = stats?.pendingCount || 0;
  const totalApproved = stats?.totalExpenses || 0;

  const handleUpdateStatus = async (id: string, status: ExpenseStatus) => {
    if (!currentBusiness?.id) return;
    try {
      await approveExpense(id, currentBusiness.id, status);
      addToast(
        `Expense ${status.toLowerCase()}`,
        status === ExpenseStatus.APPROVED ? 'success' : 'info'
      );
    } catch (e) {
      addToast('Failed to update expense status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentBusiness?.id) return;
    if (confirm('Delete this expense?')) {
      try {
        await deleteExpense(id, currentBusiness.id);
        addToast('Expense deleted', 'success');
      } catch (e) {
        addToast('Failed to delete expense', 'error');
      }
    }
  };

  if (loading) {
    return <SkeletonLoader variant="table" rows={6} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Tracking costs for <span className="font-bold">{currentBusiness?.name}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              exportExpensesToCSV(filteredExpenses);
              addToast('CSV exported successfully', 'success');
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await generateExpenseReport(
                filteredExpenses,
                `${currentBusiness?.name} - Expense Report`
              );
              addToast('PDF report generated', 'success');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF Report
          </Button>
          <Button onClick={() => navigate('/expenses/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Total Approved
            </p>
            <p className="text-xl font-bold">{formatCurrency(totalApproved)}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Pending Approval
            </p>
            <p className="text-xl font-bold">{pendingCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Active Categories
            </p>
            <p className="text-xl font-bold">{CATEGORIES.length - 1}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendor or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex bg-muted p-1 rounded-lg overflow-x-auto scrollbar-hide">
            {(['all', ...Object.values(ExpenseStatus)] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize whitespace-nowrap',
                  statusFilter === status
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length > 0 ? (
        <ExpenseTable
          expenses={filteredExpenses}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No expenses found"
          description={
            searchTerm || categoryFilter !== 'All' || statusFilter !== 'all'
              ? 'No expenses match your current filters. Try resetting them.'
              : `No expenses recorded for ${currentBusiness?.name} yet.`
          }
          actionLabel={
            !searchTerm && categoryFilter === 'All' && statusFilter === 'all'
              ? 'Record Expense'
              : 'Reset Filters'
          }
          onAction={
            !searchTerm && categoryFilter === 'All' && statusFilter === 'all'
              ? () => navigate('/expenses/new')
              : () => {
                  setSearchTerm('');
                  setCategoryFilter('All');
                  setStatusFilter('all');
                }
          }
        />
      )}
    </div>
  );
};

export default Expenses;
