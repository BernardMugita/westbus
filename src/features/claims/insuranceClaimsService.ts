import type {
  InsuranceClaimCreate,
  InsuranceClaimUpdate,
  InsuranceClaimResponse,
} from '../../types/insuranceClaims';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const insuranceClaimService = {
  async createClaim(
    data: InsuranceClaimCreate,
    token: string
  ): Promise<InsuranceClaimResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-claims/create_claim`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllClaims(token: string): Promise<InsuranceClaimResponse> {
    const response = await fetch(`${API_BASE_URL}/insurance-claims/get_all_claims`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getClaim(claimId: string, token: string): Promise<InsuranceClaimResponse> {
    const response = await fetch(
      `${API_BASE_URL}/insurance-claims/get_claim/${claimId}`,
      {
        method: 'POST',
        headers: getHeaders(token),
      }
    );
    return response.json();
  },

  async updateClaim(
    claimId: string,
    data: InsuranceClaimUpdate,
    token: string
  ): Promise<InsuranceClaimResponse> {
    const response = await fetch(
      `${API_BASE_URL}/insurance-claims/update_claim/${claimId}`,
      {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  async deleteClaim(claimId: string, token: string): Promise<InsuranceClaimResponse> {
    const response = await fetch(
      `${API_BASE_URL}/insurance-claims/delete_claim/${claimId}`,
      {
        method: 'POST',
        headers: getHeaders(token),
      }
    );
    return response.json();
  },
};