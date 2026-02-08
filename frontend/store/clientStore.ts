import { create } from 'zustand';
import api from '../services/api';
import { Client } from '../types';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;

  fetchClients: (businessId: string) => Promise<void>;
  getClient: (id: string, businessId: string) => Promise<Client | null>;
  createClient: (
    businessId: string,
    client: Omit<Client, 'id' | 'createdAt' | 'businessId'>
  ) => Promise<Client>;
  updateClient: (id: string, businessId: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string, businessId: string) => Promise<void>;
  searchClients: (businessId: string, query: string) => Promise<Client[]>;
  clearStore: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async (businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/clients/business/${businessId}`);
      set({ clients: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch clients',
        isLoading: false,
      });
    }
  },

  getClient: async (id: string, businessId: string) => {
    try {
      const response = await api.get(`/clients/${id}/business/${businessId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  createClient: async (businessId: string, clientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/clients/business/${businessId}`, clientData);
      set((state) => ({
        clients: [response.data, ...state.clients],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create client',
        isLoading: false,
      });
      throw error;
    }
  },

  updateClient: async (id: string, businessId: string, data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/clients/${id}/business/${businessId}`, data);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? response.data : c)),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update client',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteClient: async (id: string, businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/clients/${id}/business/${businessId}`);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete client',
        isLoading: false,
      });
      throw error;
    }
  },

  searchClients: async (businessId: string, query: string) => {
    try {
      const response = await api.get(`/clients/business/${businessId}/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  clearStore: () => {
    set({ clients: [], isLoading: false, error: null });
  },
}));
