import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import ThemeToggle from '../components/atoms/ThemeToggle';
import { Zap, Building2, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  enterpriseName: z.string().min(2, 'Enterprise name is required'),
  taxId: z.string().min(5, 'Valid Tax ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // L'API backend crée l'utilisateur ET l'entreprise en une seule requête
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        enterpriseName: data.enterpriseName,
        taxId: data.taxId,
        country: 'Tunisia',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-6 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl space-y-6 md:space-y-8 rounded-2xl border bg-card p-6 md:p-10 shadow-2xl transition-all duration-300">
        <div className="text-center">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Zap className="h-10 w-10 text-primary fill-primary" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Register Enterprise
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Scale your organization with secure financial intelligence
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 md:space-y-3">
          <div className="bg-muted/30 p-4 rounded-xl border border-dashed mb-4">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Building2 className="h-3 w-3" /> Organization Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Enterprise Name"
                placeholder="Acme Tunisia Ltd"
                {...register('enterpriseName')}
                error={errors.enterpriseName?.message}
              />
              <FormField
                label="Tax ID (Matricule Fiscal)"
                placeholder="1234567/A/M/000"
                {...register('taxId')}
                error={errors.taxId?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Owner First Name"
              placeholder="Jane"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <FormField
              label="Owner Last Name"
              placeholder="Doe"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <FormField
            label="Professional Email"
            type="email"
            placeholder="jane@enterprise.tn"
            {...register('email')}
            error={errors.email?.message}
          />

          <FormField
            label="Access Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] text-emerald-600 font-medium leading-tight">
              Your data will be physically hosted in Tunisian data centers per organic law 2004-63.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 md:mt-6 h-12 text-lg shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing Request...' : 'Submit Registration'}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            All registrations require verification by our Platform Compliance Team.
          </p>
        </form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an organization?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
