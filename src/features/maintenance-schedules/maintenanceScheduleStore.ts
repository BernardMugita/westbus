import { create } from 'zustand';
import type { MaintenanceScheduleRecord, MaintenanceScheduleCreate, MaintenanceScheduleUpdate } from '../../types/maintenanceSchedule';
import { maintenanceScheduleService } from './maintenanceScheduleService';

interface MaintenanceScheduleState {
  records: MaintenanceScheduleRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (token: string) => Promise<void>;
  addRecord: (data: MaintenanceScheduleCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRecord: (id: string, data: MaintenanceScheduleUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRecord: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useMaintenanceScheduleStore = create<MaintenanceScheduleState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await maintenanceScheduleService.getAllSchedules(token);
      if (response.status === 'success') {
        set({ records: (response.payload as MaintenanceScheduleRecord[]) || [], isLoading: false });
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
      const response = await maintenanceScheduleService.createSchedule(data, token);
      if (response.status === 'success') {
        const newRecord = response.payload as MaintenanceScheduleRecord;
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
      const response = await maintenanceScheduleService.updateSchedule(id, data, token);
      if (response.status === 'success') {
        const updatedRecord = response.payload as MaintenanceScheduleRecord;
        set((state) => ({
          records: state.records.map((r) => r.schedule_id === id ? updatedRecord : r),
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
      const response = await maintenanceScheduleService.deleteSchedule(id, token);
      if (response.status === 'success') {
        set((state) => ({
          records: state.records.filter((r) => r.schedule_id !== id),
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
