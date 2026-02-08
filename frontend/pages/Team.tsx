import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Search,
  X,
  Check,
  Plus,
  Send,
  Building2,
} from 'lucide-react';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import FormField from '../components/molecules/FormField';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import { useTeamStore, TeamMember } from '../store/teamStore';
import { useBusinessStore } from '../store/businessStore';
import { Role } from '../types';
import { cn } from '../lib/utils';
import { useToastStore } from '../store/toastStore';

const Team: React.FC = () => {
  const {
    members,
    invitations,
    isLoading,
    fetchTeamMembers,
    fetchInvitations,
    inviteMember,
    createMember,
    removeMember,
    cancelInvitation,
  } = useTeamStore();
  const { businesses } = useBusinessStore();
  const { addToast } = useToastStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'invite' | 'create'>('invite');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: Role.TEAM_MEMBER as Role,
    businessIds: [] as string[],
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchInvitations();
  }, [fetchTeamMembers, fetchInvitations]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: Role.TEAM_MEMBER,
      businessIds: [],
    });
  };

  const openModal = (mode: 'invite' | 'create') => {
    setModalMode(mode);
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'invite') {
        await inviteMember({
          email: formData.email,
          role: formData.role,
          businessIds: formData.businessIds.length > 0 ? formData.businessIds : undefined,
        });
        addToast(`Invitation sent to ${formData.email}`, 'success');
      } else {
        await createMember({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          businessIds: formData.businessIds.length > 0 ? formData.businessIds : undefined,
        });
        addToast(`Team member ${formData.firstName} created successfully`, 'success');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.firstName} ${member.lastName} from the team?`)) return;
    try {
      await removeMember(member.id);
      addToast('Team member removed', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const handleCancelInvitation = async (id: string, email: string) => {
    if (!confirm(`Cancel invitation to ${email}?`)) return;
    try {
      await cancelInvitation(id);
      addToast('Invitation cancelled', 'success');
    } catch (error: any) {
      addToast('Failed to cancel invitation', 'error');
    }
  };

  const toggleBusinessSelection = (businessId: string) => {
    setFormData((prev) => ({
      ...prev,
      businessIds: prev.businessIds.includes(businessId)
        ? prev.businessIds.filter((id) => id !== businessId)
        : [...prev.businessIds, businessId],
    }));
  };

  const getRoleBadge = (role: Role) => {
    const roles: Record<string, string> = {
      [Role.BUSINESS_OWNER]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      [Role.BUSINESS_ADMIN]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      [Role.ACCOUNTANT]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      [Role.TEAM_MEMBER]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      [Role.PLATFORM_ADMIN]: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <span
        className={cn(
          'px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase',
          roles[role] || roles[Role.TEAM_MEMBER]
        )}
      >
        {role.replace(/_/g, ' ')}
      </span>
    );
  };

  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your team roles and permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Member
          </Button>
          <Button onClick={() => openModal('invite')}>
            <Send className="mr-2 h-4 w-4" />
            Send Invite
          </Button>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 p-4">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pending Invitations ({invitations.length})
          </h3>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between bg-white dark:bg-card rounded-lg p-3 border"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {getRoleBadge(inv.role)} · Expires{' '}
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500"
                  onClick={() => handleCancelInvitation(inv.id, inv.email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">Member</th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">Role</th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">Businesses</th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground">
                  No team members found. Add your first team member!
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {member.firstName?.charAt(0)}
                          {member.lastName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{getRoleBadge(member.role)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {member.businesses?.length > 0 ? (
                        member.businesses.map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium"
                          >
                            {b.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">All businesses</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase',
                        member.isActive ? 'text-emerald-500' : 'text-rose-500'
                      )}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      {member.role !== Role.BUSINESS_OWNER && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {modalMode === 'invite' ? 'Invite Team Member' : 'Create Team Member'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Email Address"
                type="email"
                placeholder="colleague@company.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />

              {modalMode === 'create' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="First Name"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      required
                    />
                    <FormField
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <FormField
                    label="Temporary Password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value as Role }))
                  }
                >
                  <option value={Role.TEAM_MEMBER}>Team Member</option>
                  <option value={Role.ACCOUNTANT}>Accountant</option>
                  <option value={Role.BUSINESS_ADMIN}>Business Admin</option>
                </select>
              </div>

              {businesses.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign to Businesses (optional)</label>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for access to all businesses
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                    {businesses.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.businessIds.includes(b.id)}
                          onChange={() => toggleBusinessSelection(b.id)}
                          className="rounded"
                        />
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {modalMode === 'invite' ? 'Send Invite' : 'Create Member'}
                </Button>
              </div>
            </form>

            {modalMode === 'invite' && (
              <p className="mt-4 text-xs text-muted-foreground text-center">
                An email will be sent with a link to complete registration.
              </p>
            )}
            {modalMode === 'create' && (
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Share the credentials with the team member. They should change their password after
                first login.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
