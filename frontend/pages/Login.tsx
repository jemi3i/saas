import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import ThemeToggle from '../components/atoms/ThemeToggle';
import { Zap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-10 shadow-2xl transition-all duration-300">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Zap className="h-12 w-12 text-primary fill-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova AI</h1>
          <p className="text-muted-foreground mt-2">Next-gen intelligence for your finances</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-2">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
          <FormField
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full mt-6 h-12 text-lg shadow-lg shadow-primary/20"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Verifying...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
