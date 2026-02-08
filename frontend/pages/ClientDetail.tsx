
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, Plus, MessageSquare, History } from 'lucide-react';
import Button from '../components/atoms/Button';
import { useInvoiceStore } from '../store/invoiceStore';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import InvoiceTable from '../components/organisms/InvoiceTable';

type Tab = 'invoices' | 'communication';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, invoices, getClientTotalOwed, deleteInvoice } = useInvoiceStore();
  const [activeTab, setActiveTab] = useState<Tab>('invoices');
  
  const client = clients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Client not found.</p>
        <Button variant="ghost" onClick={() => navigate('/clients')}>Back to Clients</Button>
      </div>
    );
  }

  const clientInvoices = invoices.filter(i => i.email === client.email);
  const totalOwed = getClientTotalOwed(client.id, client.email);

  // Mock communication history
  const communicationLogs = [
    { id: '1', type: 'Email', subject: 'Invoice INV-001 Sent', date: '2024-11-15', status: 'Sent' },
    { id: '2', type: 'Call', subject: 'Follow up on payment', date: '2024-11-20', status: 'Completed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">Client Profile & Billing History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
                {client.name.charAt(0)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                  <p className="text-sm">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                  <p className="text-sm">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Address</p>
                  <p className="text-sm">{client.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Outstanding Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalOwed)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('invoices')}
              className={cn(
                "px-6 py-3 text-sm font-bold transition-all relative",
                activeTab === 'invoices' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Invoices
              {activeTab === 'invoices' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button 
              onClick={() => setActiveTab('communication')}
              className={cn(
                "px-6 py-3 text-sm font-bold transition-all relative",
                activeTab === 'communication' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Communication
              {activeTab === 'communication' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          <div className="animate-in fade-in duration-300">
            {activeTab === 'invoices' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Billing History
                  </h2>
                  <Button size="sm" onClick={() => navigate('/invoices/new')}>
                    <Plus className="h-4 w-4 mr-1" /> New Invoice
                  </Button>
                </div>
                <InvoiceTable invoices={clientInvoices} onDelete={deleteInvoice} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Activity Log
                  </h2>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" /> Log Activity
                  </Button>
                </div>
                <div className="space-y-4">
                  {communicationLogs.map(log => (
                    <div key={log.id} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold">{log.subject}</p>
                            <p className="text-xs text-muted-foreground">{log.type} • {formatDate(log.date)}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-emerald-500">{log.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
