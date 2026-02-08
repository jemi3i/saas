import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import ThemeToggle from '../components/atoms/ThemeToggle';
import { Zap, ArrowLeft, Mail, CheckCircle2, KeyRound } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z
  .object({
    code: z.string().min(6, 'Code must be 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [userEmail, setUserEmail] = useState('');

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUserEmail(data.email);
    setStep('reset');
  };

  const onResetSubmit = async (_data: ResetFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStep('success');
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {step === 'email' && 'Reset Password'}
            {step === 'reset' && 'Enter Code'}
            {step === 'success' && 'Password Reset'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'reset' && `We sent a code to ${userEmail}`}
            {step === 'success' && 'Your password has been successfully reset'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-8 space-y-4">
            <FormField
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              {...emailForm.register('email')}
              error={emailForm.formState.errors.email?.message}
            />

            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-lg shadow-primary/20"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Send Reset Code
                </>
              )}
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="mt-8 space-y-4">
            <FormField
              label="Reset Code"
              type="text"
              placeholder="Enter 6-digit code"
              {...resetForm.register('code')}
              error={resetForm.formState.errors.code?.message}
            />
            <FormField
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...resetForm.register('newPassword')}
              error={resetForm.formState.errors.newPassword?.message}
            />
            <FormField
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...resetForm.register('confirmPassword')}
              error={resetForm.formState.errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-lg shadow-primary/20"
              disabled={resetForm.formState.isSubmitting}
            >
              {resetForm.formState.isSubmitting ? (
                'Resetting...'
              ) : (
                <>
                  <KeyRound className="mr-2 h-5 w-5" />
                  Reset Password
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
            </div>

            <Link to="/login">
              <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20">
                Back to Login
              </Button>
            </Link>
          </div>
        )}

        {step !== 'success' && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
