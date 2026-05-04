import type { RouteCreate, RouteUpdate, RouteResponse } from '../../types/route';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const routeService = {
  async createRoute(data: RouteCreate, token: string): Promise<RouteResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/add_route`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllRoutes(token: string): Promise<RouteResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/get_all_routes`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getRoute(routeId: string, token: string): Promise<RouteResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/get_route/${routeId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateRoute(routeId: string, data: RouteUpdate, token: string): Promise<RouteResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/update_route/${routeId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteRoute(routeId: string, token: string): Promise<RouteResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/delete_route/${routeId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
