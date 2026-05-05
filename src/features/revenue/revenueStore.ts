import { create } from 'zustand';
import type { RevenueRecord, RevenueCreate, RevenueUpdate } from '../../types/revenue';
import { revenueService } from './revenueService';

interface RevenueState {
  records: RevenueRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: RevenueCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: RevenueUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useRevenueStore = create<RevenueState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await revenueService.getAllRevenue(token);
      if (response.status === 'success') {
        set({ records: (response.payload as RevenueRecord[]) || [], isLoading: false });
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
      const response = await revenueService.createRevenue(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as RevenueRecord;
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
      const response = await revenueService.updateRevenue(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as RevenueRecord;
        set((state) => ({
          records: state.records.map((r) => r.revenue_id === id ? updatedRecord : r),
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
      const response = await revenueService.deleteRevenue(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.revenue_id !== id),
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
