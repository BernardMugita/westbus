import { create } from 'zustand';
import type { Trip, TripCreate, TripUpdate } from '../../types/trip';
import { tripService } from './tripService';

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;
  
  fetchTrips: (token: string) => Promise<void>;
  addTrip: (data: TripCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateTrip: (id: string, data: TripUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeTrip: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  isLoading: false,
  error: null,

  fetchTrips: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tripService.getAllTrips(token);
      if (response.status === 'success') {
        set({ trips: response.payload as Trip[], isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addTrip: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await tripService.createTrip(data, token);
      if (response.status === 'success') {
        const newTrip = response.payload as Trip;
        set((state) => ({ 
          trips: [newTrip, ...state.trips],
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

  updateTrip: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await tripService.updateTrip(id, data, token);
      if (response.status === 'success') {
        const updatedTrip = response.payload as Trip;
        set((state) => ({
          trips: state.trips.map((t) => t.trip_id === id ? updatedTrip : t),
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

  removeTrip: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await tripService.deleteTrip(id, token);
      if (response.status === 'success') {
        set((state) => ({
          trips: state.trips.filter((t) => t.trip_id !== id),
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
