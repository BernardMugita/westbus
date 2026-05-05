import { create } from 'zustand';
import type { LoanRecord, LoanCreate, LoanUpdate } from '../../types/loan';
import { loanService } from './loanService';

interface LoanState {
  records: LoanRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: LoanCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: LoanUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useLoanStore = create<LoanState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loanService.getAllLoans(token);
      if (response.status === 'success') {
        set({ records: (response.payload as LoanRecord[]) || [], isLoading: false });
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
      const response = await loanService.createLoan(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as LoanRecord;
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
      const response = await loanService.updateLoan(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as LoanRecord;
        set((state) => ({
          records: state.records.map((r) => r.loan_id === id ? updatedRecord : r),
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
      const response = await loanService.deleteLoan(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.loan_id !== id),
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
