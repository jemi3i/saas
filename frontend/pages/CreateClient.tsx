import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User as UserIcon } from 'lucide-react';
import Button from '../components/atoms/Button';
import FormField from '../components/molecules/FormField';
import { useClientStore } from '../store/clientStore';
import { useBusinessStore } from '../store/businessStore';
import { useToastStore } from '../store/toastStore';
import { ClientType } from '../types';
import { cn } from '../lib/utils';

const clientSchema = z.object({
  clientType: z.nativeEnum(ClientType),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone is required'),
  address: z.string().min(5, 'Full address is required'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const { createClient } = useClientStore();
  const { currentBusiness } = useBusinessStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientType: ClientType.COMPANY,
    },
  });

  const selectedType = watch('clientType');

  const onSubmit = async (data: ClientFormValues) => {
    if (!currentBusiness) return;

    try {
      await createClient(currentBusiness.id, {
        clientType: data.clientType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      addToast('Client added successfully', 'success');
      navigate('/clients');
    } catch (error) {
      addToast('Failed to create client', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-8 rounded-2xl border bg-card shadow-sm"
      >
        <div className="space-y-4">
          <label className="text-sm font-medium">Client Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('clientType', ClientType.COMPANY)}
              className={cn(
                'flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all',
                selectedType === ClientType.COMPANY
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Company</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('clientType', ClientType.INDIVIDUAL)}
              className={cn(
                'flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all',
                selectedType === ClientType.INDIVIDUAL
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              <UserIcon className="h-5 w-5" />
              <span className="font-semibold">Individual</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            label={selectedType === ClientType.COMPANY ? 'Company Name' : 'Full Name'}
            placeholder={selectedType === ClientType.COMPANY ? 'Acme Corp' : 'John Doe'}
            {...register('name')}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Email Address"
              type="email"
              placeholder="billing@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <FormField
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>
          <FormField
            label="Billing Address"
            placeholder="Street, City, Zip, Country"
            {...register('address')}
            error={errors.address?.message}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate('/clients')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Client
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
