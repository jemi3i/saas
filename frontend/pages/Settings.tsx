import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  User as UserIcon,
  Bell,
  Settings as SettingsIcon,
  Save,
  Upload,
  Globe,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import Button from '../components/atoms/Button';
import FormField from '../components/molecules/FormField';
import { useAuthStore } from '../store/authStore';
import { useBusinessStore } from '../store/businessStore';
import { useToastStore } from '../store/toastStore';
import { cn } from '../lib/utils';

type Tab = 'business' | 'user' | 'preferences' | 'compliance';

const businessSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  taxId: z.string().min(2, 'Tax ID is required'),
  address: z.string().min(5, 'Address is required'),
  invoicePrefix: z.string().min(1, 'Prefix is required'),
  defaultTaxRate: z.number().min(0).max(100),
  currency: z.string().min(3),
});

const userSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
});

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const { user, updateProfile } = useAuthStore();
  const { currentBusiness, updateBusiness } = useBusinessStore();
  const { addToast } = useToastStore();

  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      taxId: '',
      address: '',
      invoicePrefix: 'INV-',
      defaultTaxRate: 19,
      currency: 'TND',
    },
  });

  // Update form when business data loads
  useEffect(() => {
    if (currentBusiness) {
      businessForm.reset({
        name: currentBusiness.name || '',
        taxId: currentBusiness.taxId || '',
        address: currentBusiness.address || '',
        invoicePrefix: 'INV-',
        defaultTaxRate: currentBusiness.taxRate || 19,
        currency: currentBusiness.currency || 'TND',
      });
    }
  }, [currentBusiness]);

  const onBusinessSubmit = async (data: z.infer<typeof businessSchema>) => {
    if (!currentBusiness) return;

    try {
      await updateBusiness(currentBusiness.id, {
        name: data.name,
        taxId: data.taxId,
        address: data.address,
        taxRate: data.defaultTaxRate,
        currency: data.currency,
      });
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      addToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Tenant-specific settings and compliance management.</p>
      </div>

      <div className="flex border-b border-border items-center gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('business')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-all relative flex items-center gap-2',
            activeTab === 'business'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Building2 className="h-4 w-4" /> Business Profile
          {activeTab === 'business' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-all relative flex items-center gap-2',
            activeTab === 'compliance'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Lock className="h-4 w-4" /> Compliance
          {activeTab === 'compliance' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-all relative flex items-center gap-2',
            activeTab === 'user' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <UserIcon className="h-4 w-4" /> User Profile
          {activeTab === 'user' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
                <h3 className="font-semibold text-lg">Branding (Section 5.2.3)</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center overflow-hidden">
                    {currentBusiness?.logo ? (
                      <img
                        src={currentBusiness.logo}
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Update Logo
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <form
                onSubmit={businessForm.handleSubmit(onBusinessSubmit)}
                className="p-8 rounded-2xl border bg-card shadow-sm space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Profile Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Legal Name"
                      {...businessForm.register('name')}
                      error={businessForm.formState.errors.name?.message}
                    />
                    <FormField
                      label="Fiscal ID / Matricule Fiscal"
                      {...businessForm.register('taxId')}
                      error={businessForm.formState.errors.taxId?.message}
                    />
                  </div>
                  <FormField
                    label="Address"
                    {...businessForm.register('address')}
                    error={businessForm.formState.errors.address?.message}
                  />
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-500">
                    <ShieldCheck className="h-5 w-5" />
                    Fiscal Configuration (Tunisia)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Invoice Prefix" {...businessForm.register('invoicePrefix')} />
                    <FormField
                      label="Default TVA (%)"
                      type="number"
                      {...businessForm.register('defaultTaxRate', { valueAsNumber: true })}
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Currency</label>
                      <select
                        {...businessForm.register('currency')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="TND">TND - Dinars Tunisiens</option>
                        <option value="USD">USD - US Dollars</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-8 rounded-2xl border bg-card shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Data Sovereignty Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensuring compliance with Tunisian data protection laws.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold">Tunisia Residency Protocol</p>
                    <p className="text-xs text-muted-foreground">
                      All database servers and file storage are located in Tunisian territory.
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold">Encryption at Rest</p>
                    <p className="text-xs text-muted-foreground">
                      Fiscal records are encrypted using AES-256 standard.
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>

                <div className="pt-6 border-t flex items-center justify-between">
                  <p className="text-sm font-medium">Export System Logs for Audit</p>
                  <Button variant="outline" size="sm">
                    Request Audit Log
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
