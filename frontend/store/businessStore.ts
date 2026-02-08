import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Business } from '../types';
import api from '../services/api';

interface BusinessState {
  currentBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  fetchBusinesses: () => Promise<void>;
  setBusinesses: (businesses: Business[]) => void;
  setCurrentBusiness: (business: Business) => void;
  addBusiness: (business: Partial<Business>) => Promise<Business>;
  updateBusiness: (id: string, data: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  clearStore: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      currentBusiness: null,
      businesses: [],
      isLoading: false,

      fetchBusinesses: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/businesses/my-businesses');
          const businesses = response.data;
          const current = get().currentBusiness;
          // Only keep currentBusiness if it exists in the new businesses list
          const validCurrent = current && businesses.some((b: Business) => b.id === current.id);
          set({
            businesses,
            currentBusiness: validCurrent ? current : businesses[0] || null,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Error fetching businesses:', error);
        }
      },

      setBusinesses: (businesses) => set({ businesses }),
      setCurrentBusiness: (currentBusiness) => set({ currentBusiness }),

      addBusiness: async (businessData) => {
        const response = await api.post('/businesses', businessData);
        const newBusiness = response.data;
        set((state) => ({
          businesses: [newBusiness, ...state.businesses],
          currentBusiness: state.currentBusiness || newBusiness,
        }));
        return newBusiness;
      },

      updateBusiness: async (id, data) => {
        const response = await api.put(`/businesses/${id}`, data);
        const updated = response.data;
        set((state) => ({
          businesses: state.businesses.map((b) => (b.id === id ? updated : b)),
          currentBusiness: state.currentBusiness?.id === id ? updated : state.currentBusiness,
        }));
      },

      deleteBusiness: async (id) => {
        await api.delete(`/businesses/${id}`);
        set((state) => ({
          businesses: state.businesses.filter((b) => b.id !== id),
          currentBusiness:
            state.currentBusiness?.id === id ? state.businesses[0] || null : state.currentBusiness,
        }));
      },

      clearStore: () => {
        set({
          currentBusiness: null,
          businesses: [],
          isLoading: false,
        });
      },
    }),
    { name: 'business-storage' }
  )
);
