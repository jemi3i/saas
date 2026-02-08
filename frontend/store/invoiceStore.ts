import { create } from 'zustand';
import api from '../services/api';
import { Invoice, InvoiceStatus } from '../types';

interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  paidCount: number;
  draftCount: number;
  sentCount: number;
}

interface ProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface InvoiceState {
  invoices: Invoice[];
  stats: InvoiceStats | null;
  isLoading: boolean;
  error: string | null;

  fetchInvoices: (businessId: string) => Promise<void>;
  fetchStats: (businessId: string) => Promise<void>;
  getInvoice: (id: string, businessId: string) => Promise<Invoice | null>;
  createInvoice: (businessId: string, invoice: any) => Promise<Invoice>;
  updateInvoice: (id: string, businessId: string, data: any) => Promise<Invoice>;
  markAsPaid: (id: string, businessId: string, paidDate?: Date) => Promise<Invoice>;
  markAsSent: (id: string, businessId: string) => Promise<Invoice>;
  deleteInvoice: (id: string, businessId: string) => Promise<void>;
  getDashboardStats: (businessId: string) => {
    revenue: number;
    expenses: number;
    profit: number;
    overdueCount: number;
  };
  clearStore: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchInvoices: async (businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/invoices/business/${businessId}`);
      set({ invoices: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch invoices',
        isLoading: false,
      });
    }
  },

  fetchStats: async (businessId: string) => {
    try {
      const response = await api.get(`/invoices/business/${businessId}/stats`);
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch invoice stats');
    }
  },

  getInvoice: async (id: string, businessId: string) => {
    try {
      const response = await api.get(`/invoices/${id}/business/${businessId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  createInvoice: async (businessId: string, invoiceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/invoices/business/${businessId}`, invoiceData);
      set((state) => ({
        invoices: [response.data, ...state.invoices],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  updateInvoice: async (id: string, businessId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/invoices/${id}/business/${businessId}`, data);
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? response.data : inv)),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  markAsPaid: async (id: string, businessId: string, paidDate?: Date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/invoices/${id}/business/${businessId}/paid`, { paidDate });
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? response.data : inv)),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark invoice as paid',
        isLoading: false,
      });
      throw error;
    }
  },

  markAsSent: async (id: string, businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/invoices/${id}/business/${businessId}/sent`);
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? response.data : inv)),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark invoice as sent',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteInvoice: async (id: string, businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/invoices/${id}/business/${businessId}`);
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  getDashboardStats: (businessId: string) => {
    const { stats } = get();
    if (stats) {
      return {
        revenue: stats.totalRevenue,
        expenses: 0, // Will be fetched from expense store
        profit: stats.totalRevenue,
        overdueCount: stats.overdueCount,
      };
    }
    return { revenue: 0, expenses: 0, profit: 0, overdueCount: 0 };
  },

  clearStore: () => {
    set({ invoices: [], stats: null, isLoading: false, error: null });
  },
}));
