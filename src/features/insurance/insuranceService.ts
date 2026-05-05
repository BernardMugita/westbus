import type { InsuranceCreate, InsuranceUpdate, InsuranceResponse } from '../../types/insurance';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const insuranceService = {
  async createPolicy(data: InsuranceCreate, token: string): Promise<InsuranceResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-policies/add_insurance_policy`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllPolicies(token: string): Promise<InsuranceResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-policies/get_all_insurance_policies`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getPolicy(insuranceId: string, token: string): Promise<InsuranceResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-policies/get_insurance_policy/${insuranceId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updatePolicy(insuranceId: string, data: InsuranceUpdate, token: string): Promise<InsuranceResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-policies/update_insurance_policy/${insuranceId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deletePolicy(insuranceId: string, token: string): Promise<InsuranceResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-policies/delete_insurance_policy/${insuranceId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },
};