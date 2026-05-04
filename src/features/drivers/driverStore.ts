import { create } from 'zustand';
import type { Driver, DriverCreate, DriverUpdate } from '../../types/driver';
import { driverService } from './driverService';

interface DriverState {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  
  fetchDrivers: (token: string) => Promise<void>;
  addDriver: (data: DriverCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateDriver: (id: string, data: DriverUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeDriver: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useDriverStore = create<DriverState>((set) => ({
  drivers: [],
  isLoading: false,
  error: null,

  fetchDrivers: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await driverService.getAllDrivers(token);
      if (response.status === 'success') {
        set({ drivers: (response.payload as Driver[]) || [], isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addDriver: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await driverService.createDriver(data, token);
      if (response.status === 'success') {
        const newDriver = response.payload as Driver;
        set((state) => ({ 
          drivers: [newDriver, ...state.drivers],
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

  updateDriver: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await driverService.updateDriver(id, data, token);
      if (response.status === 'success') {
        const updatedDriver = response.payload as Driver;
        set((state) => ({
          drivers: state.drivers.map((d) => d.driver_id === id ? updatedDriver : d),
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

  removeDriver: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await driverService.deleteDriver(id, token);
      if (response.status === 'success') {
        set((state) => ({
          drivers: state.drivers.filter((d) => d.driver_id !== id),
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
