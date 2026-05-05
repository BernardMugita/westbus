import { create } from 'zustand';
import type { ExpenseRecord, ExpenseCreate, ExpenseUpdate } from '../../types/expense';
import { expenseService } from './expenseService';

interface ExpenseState {
  records: ExpenseRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: ExpenseCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: ExpenseUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.getAllExpenses(token);
      if (response.status === 'success') {
        set({ records: (response.payload as ExpenseRecord[]) || [], isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addRecord: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await expenseService.createExpense(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as ExpenseRecord;
        set((state) => ({ 
          records: [newRecord, ...state.records],
          isLoading: false 
        }));
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message };
    }
  },

  updateRecord: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await expenseService.updateExpense(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as ExpenseRecord;
        set((state) => ({
          records: state.records.map((r) => r.expense_id === id ? updatedRecord : r),
          isLoading: false
        }));
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message };
    }
  },

  removeRecord: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await expenseService.deleteExpense(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.expense_id !== id),
          isLoading: false 
        }));
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message };
    }
  },
}));
