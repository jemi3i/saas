import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Mail, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import { useClientStore } from '../store/clientStore';
import { useBusinessStore } from '../store/businessStore';
import { formatCurrency } from '../lib/utils';
import SkeletonLoader from '../components/organisms/SkeletonLoader';
import EmptyState from '../components/molecules/EmptyState';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { clients, fetchClients } = useClientStore();
  const { currentBusiness } = useBusinessStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchClients(currentBusiness.id).finally(() => setLoading(false));
    }
  }, [currentBusiness?.id]);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <SkeletonLoader variant="table" rows={6} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Managing CRM for <span className="font-bold text-primary">{currentBusiness?.name}</span>
            .
          </p>
        </div>
        <Button onClick={() => navigate('/clients/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const totalRevenue = client.totalRevenue || 0;
            return (
              <div
                key={client.id}
                className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {client.name.charAt(0)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="text-lg font-bold truncate">{client.name}</h3>
                <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{client.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Total Revenue
                    </p>
                    <p className="font-bold text-emerald-500">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/invoices/new')}>
                    Invoice
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="No clients found"
              description={`You haven't added any clients for ${currentBusiness?.name} yet.`}
              actionLabel="Add First Client"
              onAction={() => navigate('/clients/new')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
