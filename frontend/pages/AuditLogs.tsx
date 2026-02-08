
import React from 'react';
import { History, Search, Download, Filter, Database, ShieldCheck } from 'lucide-react';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import { cn, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { Role } from '../types';

const AuditLogs: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const isPlatformAdmin = user?.role === Role.PLATFORM_ADMIN;

  // Mock data tailored to role
  const logs = isPlatformAdmin ? [
    { id: '1', action: 'Enterprise Approved', entity: 'Nova AI Solutions', user: 'Platform Master', timestamp: new Date().toISOString() },
    { id: '2', action: 'Compliance Check Passed', entity: 'Quantum Consulting', user: 'System Bot', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', action: 'New Registration', entity: 'Pending Startups Inc', user: 'Public API', timestamp: new Date(Date.now() - 7200000).toISOString() },
  ] : [
    { id: '1', action: 'Create Invoice', entity: 'INV-001', user: 'Alex Rivera', timestamp: new Date().toISOString() },
    { id: '2', action: 'Approve Expense', entity: 'EX-055', user: 'Sarah Smith', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', action: 'Settings Updated', entity: 'Tax Config', user: 'Alex Rivera', timestamp: new Date(Date.now() - 14400000).toISOString() },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            isPlatformAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {isPlatformAdmin ? <Database className="h-6 w-6" /> : <History className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isPlatformAdmin ? 'System-Wide Audit' : 'Business Audit Logs'}
            </h1>
            <p className="text-muted-foreground">
              {isPlatformAdmin ? 'Monitoring all tenant activity and compliance.' : 'Track operational changes within your business.'}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter by user or action..." className="pl-10" />
        </div>
        <Button variant="ghost" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        {isPlatformAdmin && (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-700">
             <ShieldCheck className="h-3.5 w-3.5" />
             <span className="text-[10px] font-black uppercase tracking-widest">Compliance Master</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-widest">Timestamp</th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-widest">Action Executed</th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-widest">Entity Target</th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-widest">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/50 transition-colors group">
                <td className="p-4 text-muted-foreground font-medium">{formatDate(log.timestamp)}</td>
                <td className="p-4">
                  <span className="font-bold text-foreground">{log.action}</span>
                </td>
                <td className="p-4">
                  <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{log.entity}</span>
                </td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                         {log.user.charAt(0)}
                      </div>
                      <span className="font-medium">{log.user}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
