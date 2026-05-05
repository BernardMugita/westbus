import type { LoanRepaymentCreate, LoanRepaymentUpdate, LoanRepaymentResponse } from '../../types/loanRepayment';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const loanRepaymentService = {
  async makeRepayment(data: LoanRepaymentCreate, token: string): Promise<LoanRepaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/loan-repayments/make_repayment`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllRepayments(token: string): Promise<LoanRepaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/loan-repayments/get_all_repayments`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getRepayment(repaymentId: string, token: string): Promise<LoanRepaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/loan-repayments/get_repayment/${repaymentId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateRepayment(repaymentId: string, data: LoanRepaymentUpdate, token: string): Promise<LoanRepaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/loan-repayments/update_repayment/${repaymentId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteRepayment(repaymentId: string, token: string): Promise<LoanRepaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/loan-repayments/delete_repayment/${repaymentId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
