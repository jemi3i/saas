import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Invoice, InvoiceStatus } from '../../types';
import Badge from '../atoms/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { MoreHorizontal, Trash2, Edit, Eye, Send, Download, CheckCircle2 } from 'lucide-react';
import Button from '../atoms/Button';
import { useToastStore } from '../../store/toastStore';
import { useInvoiceStore } from '../../store/invoiceStore';
import { generateInvoicePDF } from '../../services/pdfService';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onDelete }) => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { updateInvoice } = useInvoiceStore();

  const handleMarkAsPaid = (invoice: Invoice) => {
    updateInvoice({ ...invoice, status: InvoiceStatus.PAID });
    addToast(`Invoice ${invoice.invoiceNumber} marked as paid`, 'success');
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}/edit`);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    addToast(`Generating PDF for ${invoice.invoiceNumber || 'Invoice'}...`, 'info');
    try {
      await generateInvoicePDF(invoice);
      addToast('PDF downloaded successfully', 'success');
    } catch (error) {
      addToast('Failed to generate PDF', 'error');
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Invoice #
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Client
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Due Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Amount
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle font-mono text-xs">
                  {invoice.invoiceNumber || invoice.id}
                </td>
                <td className="p-4 align-middle">
                  <div>
                    <p className="font-semibold">{invoice.clientName}</p>
                    <p className="text-xs text-muted-foreground">{invoice.email}</p>
                  </div>
                </td>
                <td className="p-4 align-middle text-muted-foreground">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="p-4 align-middle font-bold">{formatCurrency(invoice.amount)}</td>
                <td className="p-4 align-middle">
                  <Badge status={invoice.status} />
                </td>
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() => handleEdit(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {invoice.status !== InvoiceStatus.PAID && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Mark as Paid"
                        onClick={() => handleMarkAsPaid(invoice)}
                        className="text-emerald-500 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download PDF"
                      onClick={() => handleDownloadPDF(invoice)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Send">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(invoice.id)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-xl border bg-card p-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  {invoice.invoiceNumber || invoice.id}
                </p>
                <h3 className="font-bold text-lg">{invoice.clientName}</h3>
              </div>
              <Badge status={invoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">
                  Amount
                </p>
                <p className="font-bold">{formatCurrency(invoice.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">
                  Due Date
                </p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(invoice)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownloadPDF(invoice)}
              >
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              {invoice.status !== InvoiceStatus.PAID && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMarkAsPaid(invoice)}
                  className="text-emerald-500"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(invoice.id)}
                className="text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceTable;
