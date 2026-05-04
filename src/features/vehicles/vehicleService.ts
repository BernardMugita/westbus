import type { VehicleCreate, VehicleUpdate, VehicleResponse } from '../../types/vehicle';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const vehicleService = {
  async createVehicle(data: VehicleCreate, token: string): Promise<VehicleResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/create_vehicle`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllVehicles(token: string): Promise<VehicleResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/get_all_vehicles`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getVehicle(vehicleId: string, token: string): Promise<VehicleResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/get_vehicle/${vehicleId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateVehicle(vehicleId: string, data: VehicleUpdate, token: string): Promise<VehicleResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/update_vehicle/${vehicleId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteVehicle(vehicleId: string, token: string): Promise<VehicleResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/delete_vehicle/${vehicleId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
