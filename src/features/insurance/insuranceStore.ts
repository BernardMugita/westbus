import { create } from 'zustand';
import type { InsuranceRecord, InsuranceCreate, InsuranceUpdate } from '../../types/insurance';
import { insuranceService } from './insuranceService';

interface InsuranceState {
  records: InsuranceRecord[];
  isLoading: boolean;
  error: string | null;

  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: InsuranceCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: InsuranceUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useInsuranceStore = create<InsuranceState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceService.getAllPolicies(token);
      if (response.status === 'success') {
        set({ records: (response.payload as InsuranceRecord[]) || [], isLoading: false });
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
      const response = await insuranceService.createPolicy(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as InsuranceRecord;
        set((state) => ({
          records: [newRecord, ...state.records],
          isLoading: false,
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
      const response = await insuranceService.updatePolicy(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as InsuranceRecord;
        set((state) => ({
          records: state.records.map((r) => (r.insurance_id === id ? updatedRecord : r)),
          isLoading: false,
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
      const response = await insuranceService.deletePolicy(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.insurance_id !== id),
          isLoading: false,
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