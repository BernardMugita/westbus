import { create } from 'zustand';
import type { MaintenanceRecord, MaintenanceRecordCreate, MaintenanceRecordUpdate } from '../../types/maintenance';
import { maintenanceService } from './maintenanceService';

interface MaintenanceState {
  records: MaintenanceRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: MaintenanceRecordCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: MaintenanceRecordUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await maintenanceService.getAllRecords(token);
      if (response.status === 'success') {
        set({ records: (response.payload as MaintenanceRecord[]) || [], isLoading: false });
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
      const response = await maintenanceService.createRecord(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as MaintenanceRecord;
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
      const response = await maintenanceService.updateRecord(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as MaintenanceRecord;
        set((state) => ({
          records: state.records.map((r) => r.maintenance_id === id ? updatedRecord : r),
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
      const response = await maintenanceService.deleteRecord(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.maintenance_id !== id),
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
