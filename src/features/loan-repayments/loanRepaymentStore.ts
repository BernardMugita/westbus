import { create } from 'zustand';
import type { LoanRepaymentRecord, LoanRepaymentCreate, LoanRepaymentUpdate } from '../../types/loanRepayment';
import { loanRepaymentService } from './loanRepaymentService';

interface LoanRepaymentState {
  records: LoanRepaymentRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: LoanRepaymentCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: LoanRepaymentUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useLoanRepaymentStore = create<LoanRepaymentState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loanRepaymentService.getAllRepayments(token);
      if (response.status === 'success') {
        set({ records: (response.payload as LoanRepaymentRecord[]) || [], isLoading: false });
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
      const response = await loanRepaymentService.makeRepayment(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as LoanRepaymentRecord;
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
      const response = await loanRepaymentService.updateRepayment(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as LoanRepaymentRecord;
        set((state) => ({
          records: state.records.map((r) => r.repayment_id === id ? updatedRecord : r),
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
      const response = await loanRepaymentService.deleteRepayment(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.repayment_id !== id),
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
