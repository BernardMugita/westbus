import type { MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceRecordResponse } from '../../types/maintenance';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const maintenanceService = {
  async createRecord(data: MaintenanceRecordCreate, token: string): Promise<MaintenanceRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-records/add_maintenance_record`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllRecords(token: string): Promise<MaintenanceRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-records/get_all_maintenance_records`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getRecord(maintenanceId: string, token: string): Promise<MaintenanceRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-records/get_maintenance_record/${maintenanceId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateRecord(maintenanceId: string, data: MaintenanceRecordUpdate, token: string): Promise<MaintenanceRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-records/update_maintenance_record/${maintenanceId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteRecord(maintenanceId: string, token: string): Promise<MaintenanceRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-records/delete_maintenance_record/${maintenanceId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
