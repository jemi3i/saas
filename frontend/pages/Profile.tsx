import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Camera, Save, Shield, Key, Mail, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import { cn } from '../lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`,
      });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    }
  };

  const onPasswordSubmit = async (_data: PasswordFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addToast('Password changed successfully', 'success');
      passwordForm.reset();
    } catch (err) {
      addToast('Failed to change password', 'error');
    }
  };

  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    const newName = `${user?.firstName}+${user?.lastName}+${Date.now()}`;
    updateProfile({
      avatar: `https://ui-avatars.com/api/?name=${newName}&background=random`,
    });
    addToast('Avatar updated', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.firstName}&background=random`
                }
                alt={user?.firstName}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={handleAvatarChange}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {user?.role.replace('_', ' ')}
              </span>
              {user?.enterpriseId && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border">
                  <Building2 className="h-3 w-3" />
                  Enterprise
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                placeholder="John"
                {...profileForm.register('firstName')}
                error={profileForm.formState.errors.firstName?.message}
              />
              <FormField
                label="Last Name"
                placeholder="Doe"
                {...profileForm.register('lastName')}
                error={profileForm.formState.errors.lastName?.message}
              />
            </div>
            <FormField
              label="Email Address"
              type="email"
              placeholder="john@company.com"
              {...profileForm.register('email')}
              error={profileForm.formState.errors.email?.message}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
              >
                <Save className="mr-2 h-4 w-4" />
                {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              label="Current Password"
              type="password"
              placeholder="••••••••"
              {...passwordForm.register('currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <FormField
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <FormField
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                <Shield className="mr-2 h-4 w-4" />
                {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>

          {/* Security Info */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
            <h4 className="font-semibold text-sm mb-3">Account Security</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Verified
                </span>
                <span className="text-emerald-500 font-medium">Yes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Two-Factor Auth
                </span>
                <span className="text-amber-500 font-medium">Not Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
