import { create } from 'zustand';
import type { DashboardData } from '../../types/dashboard';
import { dashboardService } from './dashboardService';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (token: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchDashboardData: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getDashboardData(token);
      if (response.status === 'success' && response.payload) {
        set({ data: response.payload, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
