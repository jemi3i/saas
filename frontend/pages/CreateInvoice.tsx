import React, { useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Send, Calculator } from 'lucide-react';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import FormField from '../components/molecules/FormField';
import { useInvoiceStore } from '../store/invoiceStore';
import { useClientStore } from '../store/clientStore';
import { useBusinessStore } from '../store/businessStore';
import { useToastStore } from '../store/toastStore';
import { InvoiceStatus } from '../types';
import { formatCurrency } from '../lib/utils';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Min 1'),
  unitPrice: z.number().min(0.01, 'Min 0.01'),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  invoiceDate: z.string().min(1, 'Required'),
  dueDate: z.string().min(1, 'Required'),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const TAX_RATE = 0.19;

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoiceStore();
  const { clients, fetchClients } = useClientStore();
  const { currentBusiness } = useBusinessStore();
  const { addToast } = useToastStore();

  // Fetch clients when business changes
  useEffect(() => {
    if (currentBusiness?.id) {
      fetchClients(currentBusiness.id);
    }
  }, [currentBusiness?.id]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  const totals = useMemo(() => {
    const subtotal = (watchedItems || []).reduce((acc, item) => {
      const q = item?.quantity || 0;
      const p = item?.unitPrice || 0;
      return acc + q * p;
    }, 0);
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [watchedItems]);

  const onSubmit = async (
    data: InvoiceFormValues,
    status: InvoiceStatus = InvoiceStatus.PENDING
  ) => {
    if (!currentBusiness) {
      addToast('No active business selected', 'error');
      return;
    }

    try {
      const invoiceData = {
        clientId: data.clientId,
        issueDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        items: data.items.map((item, index) => ({
          id: `item-${index}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        taxRate: currentBusiness.taxRate || TAX_RATE * 100,
        notes: data.notes || '',
        status: status,
      };

      await createInvoice(currentBusiness.id, invoiceData);
      addToast(
        status === InvoiceStatus.DRAFT ? 'Draft saved' : 'Invoice created successfully',
        'success'
      );
      navigate('/invoices');
    } catch (e) {
      addToast('Failed to save invoice', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">New Invoice</h1>
      </div>

      <form className="space-y-6 md:space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border bg-card shadow-sm">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Client</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Client</label>
              <select
                {...register('clientId')}
                className="w-full h-10 px-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select a client --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-xs text-rose-500 mt-1">{errors.clientId.message}</p>
              )}
              {clients.length === 0 && (
                <p className="text-xs text-amber-500 mt-2">
                  No clients found.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/clients/new')}
                    className="text-primary underline"
                  >
                    Add a client first
                  </button>
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Dates</h3>
            <FormField
              label="Date"
              type="date"
              {...register('invoiceDate')}
              error={errors.invoiceDate?.message}
            />
            <FormField
              label="Due Date"
              type="date"
              {...register('dueDate')}
              error={errors.dueDate?.message}
            />
          </div>
        </div>

        <div className="p-4 md:p-6 rounded-2xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-lg">Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 md:gap-3 items-end p-3 rounded-lg border bg-muted/20"
              >
                <div className="col-span-12 md:col-span-6">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Description
                  </label>
                  <Input
                    placeholder="Service name"
                    {...register(`items.${index}.description` as const)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Qty
                  </label>
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-5 md:col-span-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-3 md:col-span-1 flex justify-center pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-rose-500 h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:flex flex-1 p-6 rounded-2xl border bg-primary/5 border-primary/20 items-center gap-6">
            <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Auto Billing</h4>
              <p className="text-sm text-muted-foreground">
                Taxes are calculated instantly for{' '}
                <span className="font-bold">{currentBusiness?.name}</span>.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl border bg-card shadow-sm space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax ({currentBusiness?.taxRate || 0}%)</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={handleSubmit((d) => onSubmit(d, InvoiceStatus.DRAFT))}
          >
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={handleSubmit((d) => onSubmit(d, InvoiceStatus.PENDING))}
          >
            <Send className="mr-2 h-4 w-4" /> {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
