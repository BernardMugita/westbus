import { create } from 'zustand';
import type { Route, RouteCreate, RouteUpdate } from '../../types/route';
import { routeService } from './routeService';

interface RouteState {
  routes: Route[];
  isLoading: boolean;
  error: string | null;
  
  fetchRoutes: (token: string) => Promise<void>;
  addRoute: (data: RouteCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateRoute: (id: string, data: RouteUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeRoute: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  isLoading: false,
  error: null,

  fetchRoutes: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routeService.getAllRoutes(token);
      if (response.status === 'success') {
        set({ routes: response.payload as Route[], isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addRoute: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await routeService.createRoute(data, token);
      if (response.status === 'success') {
        const newRoute = response.payload as Route;
        set((state) => ({ 
          routes: [newRoute, ...state.routes],
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

  updateRoute: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await routeService.updateRoute(id, data, token);
      if (response.status === 'success') {
        const updatedRoute = response.payload as Route;
        set((state) => ({
          routes: state.routes.map((r) => r.route_id === id ? updatedRoute : r),
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

  removeRoute: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await routeService.deleteRoute(id, token);
      if (response.status === 'success') {
        set((state) => ({
          routes: state.routes.filter((r) => r.route_id !== id),
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
