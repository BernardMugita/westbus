import type { DashboardResponse } from '../../types/dashboard';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

export const dashboardService = {
  async getDashboardData(token: string): Promise<DashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/get_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.json();
  }
};
