import type { RevenueCreate, RevenueUpdate, RevenueResponse } from '../../types/revenue';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const revenueService = {
  async createRevenue(data: RevenueCreate, token: string): Promise<RevenueResponse> {
    const response = await fetch(`${API_BASE_URL}/revenue-ledger/add_revenue`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllRevenue(token: string): Promise<RevenueResponse> {
    const response = await fetch(`${API_BASE_URL}/revenue-ledger/get_all_revenue`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getRevenue(revenueId: string, token: string): Promise<RevenueResponse> {
    const response = await fetch(`${API_BASE_URL}/revenue-ledger/get_revenue/${revenueId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateRevenue(revenueId: string, data: RevenueUpdate, token: string): Promise<RevenueResponse> {
    const response = await fetch(`${API_BASE_URL}/revenue-ledger/update_revenue/${revenueId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteRevenue(revenueId: string, token: string): Promise<RevenueResponse> {
    const response = await fetch(`${API_BASE_URL}/revenue-ledger/delete_revenue/${revenueId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
