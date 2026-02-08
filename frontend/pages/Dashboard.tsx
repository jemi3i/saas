import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  FileText,
  AlertCircle,
  Brain,
  Plus,
  CreditCard,
  Target,
  Building2,
  ChevronRight,
  ShieldCheck,
  Clock,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../components/molecules/StatCard';
import RevenueChart from '../components/organisms/RevenueChart';
import ExpensePieChart from '../components/organisms/ExpensePieChart';
import { useInvoiceStore } from '../store/invoiceStore';
import { useExpenseStore } from '../store/expenseStore';
import { useAuthStore } from '../store/authStore';
import { useBusinessStore } from '../store/businessStore';
import { useEnterpriseStore } from '../store/enterpriseStore';
import { Role, ExpenseStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { getFinancialInsights } from '../services/gemini';
import Button from '../components/atoms/Button';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const {
    invoices,
    fetchInvoices,
    fetchStats: fetchInvoiceStats,
    stats: invoiceStats,
  } = useInvoiceStore();
  const {
    expenses,
    fetchExpenses,
    fetchStats: fetchExpenseStats,
    stats: expenseStats,
  } = useExpenseStore();
  const { currentBusiness } = useBusinessStore();
  const { currentEnterprise } = useEnterpriseStore();
  const user = useAuthStore((state) => state.user);

  // Use currentEnterprise from store (fetched via API)
  const enterprise = currentEnterprise;

  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch data when business changes
  useEffect(() => {
    if (currentBusiness?.id) {
      fetchInvoices(currentBusiness.id);
      fetchExpenses(currentBusiness.id);
      fetchInvoiceStats(currentBusiness.id);
      fetchExpenseStats(currentBusiness.id);
    }
  }, [currentBusiness?.id]);

  const stats = useMemo(() => {
    const revenue = invoiceStats?.totalRevenue || 0;
    const totalExpenses = expenseStats?.totalExpenses || 0;
    return {
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses,
      overdueCount: invoiceStats?.overdueCount || 0,
    };
  }, [invoiceStats, expenseStats]);

  const filteredInvoices = useMemo(
    () => invoices.filter((i) => i.businessId === currentBusiness?.id),
    [invoices, currentBusiness?.id]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => e.businessId === currentBusiness?.id),
    [expenses, currentBusiness?.id]
  );

  useEffect(() => {
    setAiInsights(null);
  }, [currentBusiness?.id]);

  // ACTOR CHECKS
  const canSeeFinancials =
    user?.role === Role.BUSINESS_OWNER ||
    user?.role === Role.ACCOUNTANT ||
    user?.role === Role.BUSINESS_ADMIN;

  const isOwner = user?.role === Role.BUSINESS_OWNER;

  const canCreateContent =
    user?.role === Role.BUSINESS_OWNER ||
    user?.role === Role.ACCOUNTANT ||
    user?.role === Role.BUSINESS_ADMIN;

  const handleGenerateInsights = async () => {
    if (!isOwner) return; // Only owner can initiate AI audits
    setIsGenerating(true);
    const insights = await getFinancialInsights(filteredInvoices);
    setAiInsights(insights || null);
    setIsGenerating(false);
  };

  // Platform admin should not see the pending screen - they manage the platform
  const isPlatformAdmin = user?.role === Role.PLATFORM_ADMIN;

  // If the Enterprise is pending approval from Platform Admin (skip for platform_admin)
  if (!isPlatformAdmin && enterprise && enterprise.status === 'pending') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-8 text-center animate-in fade-in duration-700">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border-2 border-amber-500/20">
            <Clock className="h-10 w-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-card p-1.5 rounded-full border">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-black tracking-tight">Onboarding in Progress</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your Enterprise <span className="text-foreground font-bold">"{enterprise.name}"</span>{' '}
            has been registered. Our Platform Administrators are currently reviewing your documents
            for Tunisian compliance.
          </p>
          <div className="bg-muted p-4 rounded-xl border flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-left">
              Compliance Verification: Step 2 of 3 <br />
              <span className="text-muted-foreground normal-case font-medium">
                Physical storage check in Tunisian nodes...
              </span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            You will receive an email once your organization is activated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border-2 border-primary/5">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {currentBusiness?.name}
              </h1>
              <div className="hidden sm:flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                Compliance Verified
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                <Target className="h-3 w-3" /> Financial Control Center
              </p>
              <span className="text-muted-foreground/30">•</span>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                {user?.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="border-primary/50 text-primary"
            >
              <Brain className="mr-2 h-4 w-4" />
              {isGenerating ? 'Analyzing...' : 'AI Financial Audit'}
            </Button>
          )}
          {canCreateContent && (
            <Link to="/invoices/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={canSeeFinancials ? formatCurrency(stats.revenue) : '••••••'}
          icon={DollarSign}
          variant="success"
          description="Paid Invoices"
        />
        <StatCard
          title="Total Expenses"
          value={canSeeFinancials ? formatCurrency(stats.expenses) : '••••••'}
          icon={CreditCard}
          variant="danger"
          description="Approved Costs"
        />
        <StatCard
          title="Net Profit/Loss"
          value={canSeeFinancials ? formatCurrency(stats.profit) : '••••••'}
          icon={Target}
          variant={stats.profit >= 0 ? 'info' : 'danger'}
          description="Current Period"
        />
        <StatCard
          title="Overdue Items"
          value={canSeeFinancials ? stats.overdueCount : '•'}
          icon={AlertCircle}
          variant="warning"
          description="Action Required"
        />
      </div>

      {aiInsights && isOwner && (
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 relative overflow-hidden animate-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Brain className="h-24 w-24" />
          </div>
          <div className="relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Brain className="h-5 w-5" /> Owner's Intelligence Report
            </h3>
            <div className="text-base text-foreground/80 space-y-3 leading-relaxed">
              {aiInsights.split('\n').map((line, i) => (
                <p
                  key={i}
                  className={
                    line.trim().startsWith('-') || line.trim().startsWith('*')
                      ? 'pl-4 border-l-2 border-primary/30 py-0.5'
                      : 'py-0.5'
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {canSeeFinancials && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <RevenueChart data={[{ name: 'Period', total: stats.revenue }]} />
          </div>
          <div className="lg:col-span-3">
            <ExpensePieChart data={filteredExpenses} />
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Activity Log
          </h3>
          {user?.role !== Role.TEAM_MEMBER && (
            <Link
              to="/invoices"
              className="text-xs text-primary font-bold flex items-center hover:underline"
            >
              Full Records <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          )}
        </div>
        <div className="space-y-4">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.slice(0, 5).map((invoice) => {
              const clientName = invoice.client?.name || invoice.clientName || 'Unknown';
              const amount = invoice.total || invoice.amount || 0;
              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {clientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{clientName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {canSeeFinancials ? formatCurrency(amount) : '••••'}
                    </p>
                    <p
                      className={cn(
                        'text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border',
                        invoice.status === 'paid'
                          ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                          : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                      )}
                    >
                      {invoice.status}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-6 border border-dashed rounded-xl">
              <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground italic">No transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
