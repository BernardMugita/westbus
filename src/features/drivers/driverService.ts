import type { DriverCreate, DriverUpdate, DriverResponse } from '../../types/driver';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const driverService = {
  async createDriver(data: DriverCreate, token: string): Promise<DriverResponse> {
    const response = await fetch(`${API_BASE_URL}/drivers/add_driver`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllDrivers(token: string): Promise<DriverResponse> {
    const response = await fetch(`${API_BASE_URL}/drivers/get_all_drivers`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getDriver(driverId: string, token: string): Promise<DriverResponse> {
    const response = await fetch(`${API_BASE_URL}/drivers/get_driver/${driverId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateDriver(driverId: string, data: DriverUpdate, token: string): Promise<DriverResponse> {
    const response = await fetch(`${API_BASE_URL}/drivers/update_driver/${driverId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteDriver(driverId: string, token: string): Promise<DriverResponse> {
    const response = await fetch(`${API_BASE_URL}/drivers/delete_driver/${driverId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
