import { create } from 'zustand';
import type { Vehicle } from '../../types/vehicle';
import { vehicleService } from './vehicleService';

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  
  fetchVehicles: (token: string) => Promise<void>;
  addVehicle: (data: any, token: string) => Promise<{ success: boolean; message: string }>;
  updateVehicle: (id: string, data: any, token: string) => Promise<{ success: boolean; message: string }>;
  removeVehicle: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  isLoading: false,
  error: null,

  fetchVehicles: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.getAllVehicles(token);
      if (response.status === 'success') {
        set({ vehicles: response.payload as Vehicle[], isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addVehicle: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await vehicleService.createVehicle(data, token);
      if (response.status === 'success') {
        const newVehicle = response.payload as Vehicle;
        set((state) => ({ 
          vehicles: [newVehicle, ...state.vehicles],
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

  updateVehicle: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await vehicleService.updateVehicle(id, data, token);
      if (response.status === 'success') {
        const updatedVehicle = response.payload as Vehicle;
        set((state) => ({
          vehicles: state.vehicles.map((v) => v.vehicle_id === id ? updatedVehicle : v),
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

  removeVehicle: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await vehicleService.deleteVehicle(id, token);
      if (response.status === 'success') {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.vehicle_id !== id),
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
