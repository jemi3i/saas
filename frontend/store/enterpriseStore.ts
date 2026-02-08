import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Enterprise, EnterpriseStatus } from '../types';
import api from '../services/api';

interface EnterpriseState {
  enterprises: Enterprise[];
  currentEnterprise: Enterprise | null;
  isLoading: boolean;
  fetchEnterprises: () => Promise<void>;
  fetchMyEnterprise: () => Promise<void>;
  addEnterprise: (enterprise: Partial<Enterprise>) => Promise<Enterprise>;
  updateEnterpriseStatus: (id: string, status: EnterpriseStatus) => Promise<void>;
  getEnterpriseById: (id: string) => Enterprise | undefined;
  clearStore: () => void;
}

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set, get) => ({
      enterprises: [],
      currentEnterprise: null,
      isLoading: false,

      fetchEnterprises: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/enterprises');
          set({ enterprises: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Error fetching enterprises:', error);
        }
      },

      fetchMyEnterprise: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/enterprises/my-enterprise');
          set({ currentEnterprise: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Error fetching my enterprise:', error);
        }
      },

      addEnterprise: async (enterpriseData) => {
        const response = await api.post('/enterprises', enterpriseData);
        const newEnterprise = response.data;
        set((state) => ({
          enterprises: [newEnterprise, ...state.enterprises],
        }));
        return newEnterprise;
      },

      updateEnterpriseStatus: async (id, status) => {
        const response = await api.patch(`/enterprises/${id}/status`, { status });
        const updated = response.data;
        set((state) => ({
          enterprises: state.enterprises.map((e) => (e.id === id ? updated : e)),
          currentEnterprise: state.currentEnterprise?.id === id ? updated : state.currentEnterprise,
        }));
      },

      getEnterpriseById: (id) => get().enterprises.find((e) => e.id === id),

      clearStore: () => {
        set({
          enterprises: [],
          currentEnterprise: null,
          isLoading: false,
        });
      },
    }),
    { name: 'enterprise-storage' }
  )
);
