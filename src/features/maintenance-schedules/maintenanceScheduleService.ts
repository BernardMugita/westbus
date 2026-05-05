import type { MaintenanceScheduleCreate, MaintenanceScheduleUpdate, MaintenanceScheduleResponse } from '../../types/maintenanceSchedule';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const maintenanceScheduleService = {
  async createSchedule(data: MaintenanceScheduleCreate, token: string): Promise<MaintenanceScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-schedules/add_maintenance_schedule`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllSchedules(token: string): Promise<MaintenanceScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-schedules/get_all_maintenance_schedules`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getSchedule(scheduleId: string, token: string): Promise<MaintenanceScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-schedules/get_maintenance_schedule/${scheduleId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateSchedule(scheduleId: string, data: MaintenanceScheduleUpdate, token: string): Promise<MaintenanceScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-schedules/update_maintenance_schedule/${scheduleId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteSchedule(scheduleId: string, token: string): Promise<MaintenanceScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/maintenance-schedules/delete_maintenance_schedule/${scheduleId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
