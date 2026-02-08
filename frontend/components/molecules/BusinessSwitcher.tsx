import React, { useState, useRef, useEffect } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { useAuthStore } from '../../store/authStore';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useClientStore } from '../../store/clientStore';
import { Building2, ChevronDown, Check, Plus, X, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../atoms/Button';
import FormField from './FormField';
import { useToastStore } from '../../store/toastStore';
import { Role } from '../../types';

const BusinessSwitcher: React.FC = () => {
  const { currentBusiness, businesses, setCurrentBusiness, addBusiness } = useBusinessStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { clearStore: clearInvoices } = useInvoiceStore();
  const { clearStore: clearExpenses } = useExpenseStore();
  const { clearStore: clearClients } = useClientStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only business owners can switch businesses
  const isBusinessOwner = user?.role === Role.BUSINESS_OWNER;

  // New Business Form State
  const [newBizName, setNewBizName] = useState('');

  // Clear all business-specific data when switching
  const handleSwitchBusiness = (business: typeof currentBusiness) => {
    if (business && business.id !== currentBusiness?.id) {
      // Clear all data stores to force re-fetch for new business
      clearInvoices();
      clearExpenses();
      clearClients();
    }
    setCurrentBusiness(business!);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddBusiness = async () => {
    if (!newBizName) return;

    try {
      const newBiz = await addBusiness({
        name: newBizName,
        address: 'New Address',
        taxId: 'Pending',
        currency: 'TND',
        taxRate: 19,
      });
      // Clear stores for new business
      clearInvoices();
      clearExpenses();
      clearClients();
      setCurrentBusiness(newBiz);
      setNewBizName('');
      setIsAdding(false);
      setIsOpen(false);
      addToast(`${newBizName} created successfully!`, 'success');
    } catch (error) {
      addToast('Failed to create business', 'error');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Non-owners only see the current business name (no dropdown) */}
      {!isBusinessOwner ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card/50">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold truncate max-w-[120px]">
            {currentBusiness?.name}
          </span>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors border bg-card/50"
        >
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold truncate max-w-[120px]">
            {currentBusiness?.name}
          </span>
          <ChevronDown
            className={cn(
              'h-3 w-3 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      )}

      {isOpen && isBusinessOwner && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl border bg-card p-1 shadow-xl z-50 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              My Organizations
            </p>
            <button onClick={() => setIsAdding(!isAdding)} className="p-1 hover:bg-muted rounded">
              {isAdding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 text-primary" />}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {isAdding ? (
              <div className="p-3 space-y-3 animate-in slide-in-from-top-2">
                <FormField
                  label="Business Name"
                  placeholder="E.g. Lunar Labs"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="mb-0"
                />
                <Button size="sm" className="w-full" onClick={handleAddBusiness}>
                  <Save className="h-3 w-3 mr-1" /> Create Business
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {businesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => handleSwitchBusiness(business)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left',
                      currentBusiness?.id === business.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-2 w-2 rounded-full bg-primary/40 shrink-0" />
                      <span className="truncate">{business.name}</span>
                    </div>
                    {currentBusiness?.id === business.id && (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isAdding && (
            <div className="mt-1 border-t pt-1">
              <button
                onClick={() => setIsAdding(true)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Register New Business
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessSwitcher;
