import { create } from 'zustand';
import api from '../services/api';
import { Expense, ExpenseStatus } from '../types';

interface ExpenseStats {
  totalExpenses: number;
  pendingAmount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  byCategory: Record<string, number>;
}

interface ExpenseState {
  expenses: Expense[];
  stats: ExpenseStats | null;
  isLoading: boolean;
  error: string | null;

  fetchExpenses: (businessId: string) => Promise<void>;
  fetchStats: (businessId: string) => Promise<void>;
  getExpense: (id: string, businessId: string) => Promise<Expense | null>;
  createExpense: (
    businessId: string,
    expense: Omit<Expense, 'id' | 'createdAt' | 'businessId' | 'status'>
  ) => Promise<Expense>;
  updateExpense: (id: string, businessId: string, data: Partial<Expense>) => Promise<Expense>;
  approveExpense: (id: string, businessId: string, status: ExpenseStatus) => Promise<Expense>;
  deleteExpense: (id: string, businessId: string) => Promise<void>;
  getByCategory: (businessId: string) => Promise<{ category: string; total: number }[]>;
  clearStore: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchExpenses: async (businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/expenses/business/${businessId}`);
      set({ expenses: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch expenses',
        isLoading: false,
      });
    }
  },

  fetchStats: async (businessId: string) => {
    try {
      const response = await api.get(`/expenses/business/${businessId}/stats`);
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch expense stats');
    }
  },

  getExpense: async (id: string, businessId: string) => {
    try {
      const response = await api.get(`/expenses/${id}/business/${businessId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  createExpense: async (businessId: string, expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/expenses/business/${businessId}`, expenseData);
      set((state) => ({
        expenses: [response.data, ...state.expenses],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create expense',
        isLoading: false,
      });
      throw error;
    }
  },

  updateExpense: async (id: string, businessId: string, data: Partial<Expense>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/expenses/${id}/business/${businessId}`, data);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? response.data : e)),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update expense',
        isLoading: false,
      });
      throw error;
    }
  },

  approveExpense: async (id: string, businessId: string, status: ExpenseStatus) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/expenses/${id}/business/${businessId}/approve`, { status });
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? response.data : e)),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to approve expense',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteExpense: async (id: string, businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/expenses/${id}/business/${businessId}`);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete expense',
        isLoading: false,
      });
      throw error;
    }
  },

  getByCategory: async (businessId: string) => {
    try {
      const response = await api.get(`/expenses/business/${businessId}/by-category`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  clearStore: () => {
    set({ expenses: [], stats: null, isLoading: false, error: null });
  },
}));
