import React, { useEffect } from 'react';
import { useEnterpriseStore } from '../store/enterpriseStore';
import { CheckCircle2, XCircle, Clock, Building2, ShieldCheck, Search } from 'lucide-react';
import Button from '../components/atoms/Button';
import { useToastStore } from '../store/toastStore';
import { cn } from '../lib/utils';
import Input from '../components/atoms/Input';
import LoadingSpinner from '../components/atoms/LoadingSpinner';

const PlatformAdminPanel: React.FC = () => {
  const { enterprises, fetchEnterprises, isLoading, updateEnterpriseStatus } = useEnterpriseStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchEnterprises();
  }, [fetchEnterprises]);

  const handleAction = (id: string, name: string, status: 'active' | 'rejected') => {
    updateEnterpriseStatus(id, status);
    addToast(
      `${name} has been ${status === 'active' ? 'Approved' : 'Rejected'}`,
      status === 'active' ? 'success' : 'error'
    );
  };

  const pendingEnterprises = enterprises.filter((e) => e.status === 'pending');
  const activeEnterprises = enterprises.filter((e) => e.status === 'active');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-muted-foreground">
            Manage tenant onboarding and compliance approvals.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            SaaS Master Access
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Approvals */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Registration Requests
            </h3>
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingEnterprises.length} New
            </span>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {pendingEnterprises.length > 0 ? (
              pendingEnterprises.map((ent) => (
                <div
                  key={ent.id}
                  className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{ent.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Tax ID: {ent.taxId}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:bg-rose-50"
                      onClick={() => handleAction(ent.id, ent.name, 'rejected')}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-emerald-500 hover:bg-emerald-50"
                      onClick={() => handleAction(ent.id, ent.name, 'active')}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                No pending requests.
              </div>
            )}
          </div>
        </div>

        {/* Active Tenants Stats */}
        <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-lg">Platform Health</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-primary/5 border-primary/10">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Active Tenants
              </p>
              <p className="text-3xl font-black text-primary">{activeEnterprises.length}</p>
            </div>
            <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/10">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Growth Rate
              </p>
              <p className="text-3xl font-black text-emerald-500">+12%</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Quick Tenant Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter Enterprise name..." className="pl-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminPanel;
