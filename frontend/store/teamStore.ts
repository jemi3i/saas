import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '../types';
import api from '../services/api';

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  businesses: Array<{
    id: string;
    name: string;
    role: Role;
  }>;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: Role;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface TeamState {
  members: TeamMember[];
  invitations: TeamInvitation[];
  isLoading: boolean;
  fetchTeamMembers: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  inviteMember: (data: { email: string; role: Role; businessIds?: string[] }) => Promise<any>;
  createMember: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    businessIds?: string[];
  }) => Promise<any>;
  updateMember: (
    id: string,
    data: { role?: Role; businessIds?: string[]; isActive?: boolean }
  ) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  cancelInvitation: (id: string) => Promise<void>;
  assignToBusiness: (userId: string, businessId: string, role?: Role) => Promise<void>;
  removeFromBusiness: (userId: string, businessId: string) => Promise<void>;
  clearStore: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: [],
      invitations: [],
      isLoading: false,

      fetchTeamMembers: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/team/members');
          set({ members: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Error fetching team members:', error);
        }
      },

      fetchInvitations: async () => {
        try {
          const response = await api.get('/team/invitations');
          set({ invitations: response.data });
        } catch (error) {
          console.error('Error fetching invitations:', error);
        }
      },

      inviteMember: async (data) => {
        const response = await api.post('/team/invite', data);
        get().fetchInvitations();
        return response.data;
      },

      createMember: async (data) => {
        const response = await api.post('/team/create', data);
        get().fetchTeamMembers();
        return response.data;
      },

      updateMember: async (id, data) => {
        await api.put(`/team/members/${id}`, data);
        get().fetchTeamMembers();
      },

      removeMember: async (id) => {
        await api.delete(`/team/members/${id}`);
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },

      cancelInvitation: async (id) => {
        await api.delete(`/team/invitations/${id}`);
        set((state) => ({
          invitations: state.invitations.filter((i) => i.id !== id),
        }));
      },

      assignToBusiness: async (userId, businessId, role) => {
        await api.post('/team/assign-business', { userId, businessId, role });
        get().fetchTeamMembers();
      },

      removeFromBusiness: async (userId, businessId) => {
        await api.delete(`/team/members/${userId}/business/${businessId}`);
        get().fetchTeamMembers();
      },

      clearStore: () => {
        set({ members: [], invitations: [], isLoading: false });
      },
    }),
    { name: 'team-storage' }
  )
);
