import type { LoanCreate, LoanUpdate, LoanResponse } from '../../types/loan';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const loanService = {
  async createLoan(data: LoanCreate, token: string): Promise<LoanResponse> {
    const response = await fetch(`${API_BASE_URL}/loans/add_loan`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllLoans(token: string): Promise<LoanResponse> {
    const response = await fetch(`${API_BASE_URL}/loans/get_all_loans`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getLoan(loanId: string, token: string): Promise<LoanResponse> {
    const response = await fetch(`${API_BASE_URL}/loans/get_loan/${loanId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateLoan(loanId: string, data: LoanUpdate, token: string): Promise<LoanResponse> {
    const response = await fetch(`${API_BASE_URL}/loans/update_loan/${loanId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteLoan(loanId: string, token: string): Promise<LoanResponse> {
    const response = await fetch(`${API_BASE_URL}/loans/delete_loan/${loanId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
