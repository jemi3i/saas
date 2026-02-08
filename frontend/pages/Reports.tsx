import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Filter,
  BarChart3,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import ProfitLossReport from '../components/organisms/ProfitLossReport';
import { useInvoiceStore } from '../store/invoiceStore';
import { useExpenseStore } from '../store/expenseStore';
import { useBusinessStore } from '../store/businessStore';
import { useToastStore } from '../store/toastStore';
import { cn, formatCurrency } from '../lib/utils';
import RevenueChart from '../components/organisms/RevenueChart';
import ExpensePieChart from '../components/organisms/ExpensePieChart';
import { exportToCSV, exportExpensesToCSV, generateExpenseReport } from '../services/pdfService';

type ReportTab = 'profit-loss' | 'revenue' | 'expenses';

const Reports: React.FC = () => {
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { currentBusiness } = useBusinessStore();
  const [activeTab, setActiveTab] = useState<ReportTab>('profit-loss');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Fetch data when business changes
  useEffect(() => {
    if (currentBusiness?.id) {
      fetchInvoices(currentBusiness.id);
      fetchExpenses(currentBusiness.id);
    }
  }, [currentBusiness?.id]);

  // Calculate profit/loss report from invoices and expenses
  const getProfitLossReport = (businessId: string, from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const months: { [key: string]: { revenue: number; expenses: number } } = {};

    // Process invoices for revenue
    invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return inv.businessId === businessId && invDate >= fromDate && invDate <= toDate;
      })
      .forEach((inv) => {
        const month = new Date(inv.createdAt).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        if (!months[month]) months[month] = { revenue: 0, expenses: 0 };
        if (inv.status === 'paid') {
          months[month].revenue += inv.total;
        }
      });

    // Process expenses
    expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return (
          exp.businessId === businessId &&
          exp.status === 'approved' &&
          expDate >= fromDate &&
          expDate <= toDate
        );
      })
      .forEach((exp) => {
        const month = new Date(exp.date).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        if (!months[month]) months[month] = { revenue: 0, expenses: 0 };
        months[month].expenses += exp.amount;
      });

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const reportData = useMemo(
    () => getProfitLossReport(currentBusiness?.id || '', dateFrom, dateTo),
    [invoices, expenses, currentBusiness?.id, dateFrom, dateTo]
  );

  const revenueChartData = reportData.map((d) => ({ name: d.month, total: d.revenue }));
  const bizExpenses = expenses.filter(
    (e) => e.businessId === currentBusiness?.id && e.status === 'approved'
  );
  const { addToast } = useToastStore();

  const handleExportCSV = () => {
    if (activeTab === 'profit-loss') {
      const data = reportData.map((d) => ({
        Month: d.month,
        Revenue: d.revenue,
        Expenses: d.expenses,
        Profit: d.profit,
      }));
      exportToCSV(data, `profit-loss-${currentBusiness?.name}-${Date.now()}`);
    } else if (activeTab === 'expenses') {
      exportExpensesToCSV(bizExpenses);
    } else {
      const data = revenueChartData.map((d) => ({
        Month: d.name,
        Revenue: d.total,
      }));
      exportToCSV(data, `revenue-${currentBusiness?.name}-${Date.now()}`);
    }
    addToast('CSV exported successfully', 'success');
  };

  const handleExportPDF = async () => {
    if (activeTab === 'expenses') {
      await generateExpenseReport(bizExpenses, `${currentBusiness?.name} - Expense Report`);
      addToast('PDF report generated', 'success');
    } else {
      // For profit-loss and revenue, we'll use print functionality
      window.print();
      addToast('Print dialog opened', 'info');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Dive into performance for{' '}
            <span className="text-primary font-bold">{currentBusiness?.name}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none"
            onClick={handleExportPDF}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10 h-10"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10 h-10"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <Button className="w-full lg:w-auto h-10">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex border-b border-border items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth pb-px">
          <button
            onClick={() => setActiveTab('profit-loss')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap',
              activeTab === 'profit-loss'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Profit & Loss
            </span>
            {activeTab === 'profit-loss' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap',
              activeTab === 'revenue'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Revenue Chart
            </span>
            {activeTab === 'revenue' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap',
              activeTab === 'expenses'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Expense Allocation
            </span>
            {activeTab === 'expenses' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <div className="animate-in fade-in duration-300">
          {activeTab === 'profit-loss' && (
            <div className="space-y-6">
              <ProfitLossReport data={reportData} />
              <div className="p-6 rounded-2xl border bg-primary/5 border-primary/10">
                <h4 className="font-bold text-xs text-primary uppercase tracking-widest mb-2">
                  Insight Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Consolidated profit for the period is{' '}
                  <span className="text-foreground font-bold">
                    {formatCurrency(reportData.reduce((a, c) => a + c.profit, 0))}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}
          {activeTab === 'revenue' && (
            <div className="w-full overflow-hidden">
              <RevenueChart data={revenueChartData} />
            </div>
          )}
          {activeTab === 'expenses' && (
            <div className="w-full overflow-hidden">
              <ExpensePieChart data={bizExpenses} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
