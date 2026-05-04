import type { DriverAssignmentCreate, DriverAssignmentUpdate, DriverAssignmentResponse } from '../../types/assignment';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const assignmentService = {
  async assignDriver(data: DriverAssignmentCreate, token: string): Promise<DriverAssignmentResponse> {
    const response = await fetch(`${API_BASE_URL}/driver-assignments/assign_driver`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllAssignments(token: string): Promise<DriverAssignmentResponse> {
    const response = await fetch(`${API_BASE_URL}/driver-assignments/get_all_assignments`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getAssignment(assignmentId: string, token: string): Promise<DriverAssignmentResponse> {
    const response = await fetch(`${API_BASE_URL}/driver-assignments/get_assignment/${assignmentId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateAssignment(assignmentId: string, data: DriverAssignmentUpdate, token: string): Promise<DriverAssignmentResponse> {
    const response = await fetch(`${API_BASE_URL}/driver-assignments/update_assignment/${assignmentId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async unassignDriver(assignmentId: string, token: string): Promise<DriverAssignmentResponse> {
    const response = await fetch(`${API_BASE_URL}/driver-assignments/unassign_driver/${assignmentId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
