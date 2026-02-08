import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';
import api from '../services/api';
import { useBusinessStore } from './businessStore';
import { useEnterpriseStore } from './enterpriseStore';
import { useTeamStore } from './teamStore';
import { useClientStore } from './clientStore';
import { useInvoiceStore } from './invoiceStore';
import { useExpenseStore } from './expenseStore';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data;

          set({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role as Role,
              enterpriseId: user.enterpriseId,
              avatar: user.avatar,
            },
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Erreur de connexion',
          });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            enterpriseName: data.enterpriseName,
            taxId: data.taxId,
            country: data.country || 'Tunisia',
          });
          const { user, tokens } = response.data;

          set({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role as Role,
              enterpriseId: user.enterpriseId,
              avatar: user.avatar,
            },
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Erreur d'inscription",
          });
          throw error;
        }
      },

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          // Ignore logout errors
        }
        // Clear all stores
        useBusinessStore.getState().clearStore();
        useEnterpriseStore.getState().clearStore();
        useTeamStore.getState().clearStore();
        useClientStore.getState().clearStore();
        useInvoiceStore.getState().clearStore();
        useExpenseStore.getState().clearStore();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }
        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          set({
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
