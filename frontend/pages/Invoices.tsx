import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import InvoiceTable from '../components/organisms/InvoiceTable';
import { useInvoiceStore } from '../store/invoiceStore';
import { useBusinessStore } from '../store/businessStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { InvoiceStatus, Role } from '../types';
import { cn } from '../lib/utils';
import SkeletonLoader from '../components/organisms/SkeletonLoader';
import EmptyState from '../components/molecules/EmptyState';
import { exportInvoicesToCSV } from '../services/pdfService';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { invoices, deleteInvoice, fetchInvoices, isLoading } = useInvoiceStore();
  const { currentBusiness } = useBusinessStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchInvoices(currentBusiness.id).finally(() => setLoading(false));
    }
  }, [currentBusiness?.id]);

  const filteredInvoices = invoices.filter((i) => {
    const clientName = i.client?.name || i.clientName || '';
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canManageInvoices =
    user?.role === Role.BUSINESS_OWNER ||
    user?.role === Role.ACCOUNTANT ||
    user?.role === Role.BUSINESS_ADMIN;

  const handleDelete = async (id: string) => {
    if (!canManageInvoices || !currentBusiness?.id) return;
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id, currentBusiness.id);
        addToast('Invoice deleted successfully', 'success');
      } catch (e) {
        addToast('Failed to delete invoice', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/20 rounded-xl animate-pulse" />
        <SkeletonLoader variant="table" rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Managing billing for{' '}
            <span className="text-primary font-bold">{currentBusiness?.name}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              exportInvoicesToCSV(filteredInvoices);
              addToast('CSV exported successfully', 'success');
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {canManageInvoices && (
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client or ID..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex bg-muted p-1 rounded-lg">
            {(['all', ...Object.values(InvoiceStatus)] as const).map((status) => (
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
        </div>
      </div>

      <div className="mt-6">
        {filteredInvoices.length > 0 ? (
          <InvoiceTable invoices={filteredInvoices} onDelete={handleDelete} />
        ) : (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description={
              searchTerm || statusFilter !== 'all'
                ? "We couldn't find any invoices matching your search criteria."
                : `You haven't created any invoices for ${currentBusiness?.name} yet.`
            }
            actionLabel={
              canManageInvoices && !searchTerm && statusFilter === 'all'
                ? 'Create First Invoice'
                : 'Clear Filters'
            }
            onAction={
              canManageInvoices && !searchTerm && statusFilter === 'all'
                ? () => navigate('/invoices/new')
                : () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }
            }
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;
