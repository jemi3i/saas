import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import Button from '../components/atoms/Button';
import FormField from '../components/molecules/FormField';
import FileUpload from '../components/atoms/FileUpload';
import { useExpenseStore } from '../store/expenseStore';
import { useToastStore } from '../store/toastStore';
import { useBusinessStore } from '../store/businessStore';
import { ExpenseCategory } from '../types';

const CATEGORIES = [
  'Software',
  'Rent',
  'Marketing',
  'Salaries',
  'Utilities',
  'Travel',
  'Meals',
  'Office Supplies',
  'Others',
];

const expenseSchema = z.object({
  vendorName: z.string().min(2, 'Vendor is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  expenseDate: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const CreateExpense: React.FC = () => {
  const navigate = useNavigate();
  const { createExpense } = useExpenseStore();
  const { addToast } = useToastStore();
  const { currentBusiness } = useBusinessStore();
  const [receipt, setReceipt] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'Software',
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!currentBusiness) {
      addToast('No active business selected', 'error');
      return;
    }

    try {
      await createExpense(currentBusiness.id, {
        vendorName: data.vendorName,
        amount: data.amount,
        category: data.category as ExpenseCategory,
        date: data.expenseDate,
        description: data.description || '',
        receiptUrl: receipt ? URL.createObjectURL(receipt) : undefined,
      });
      addToast('Expense recorded successfully', 'success');
      navigate('/expenses');
    } catch (e) {
      addToast('Failed to save expense', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/expenses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Record Expense</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-primary font-semibold mb-2">
            <Zap className="h-5 w-5 fill-primary" />
            <span>AI Smart Scanning</span>
          </div>

          <FileUpload
            label="Scan Receipt"
            accept="image/*,application/pdf"
            onFileSelect={(file) => setReceipt(file)}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 p-6 rounded-2xl border bg-card shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Vendor / Store Name"
              placeholder="e.g. Amazon, Starbucks"
              {...register('vendorName')}
              error={errors.vendorName?.message}
            />
            <div className="space-y-1.5 mb-4">
              <label className="text-sm font-medium">Category</label>
              <select
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
            <FormField
              label="Expense Date"
              type="date"
              {...register('expenseDate')}
              error={errors.expenseDate?.message}
            />
          </div>

          <FormField
            label="Description (Optional)"
            placeholder="What was this for?"
            {...register('description')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => navigate('/expenses')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                'Recording...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpense;
