import type { ExpenseCreate, ExpenseUpdate, ExpenseResponse } from '../../types/expense';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const expenseService = {
  async createExpense(data: ExpenseCreate, token: string): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/expenses/create_expense`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllExpenses(token: string): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/expenses/get_all_expenses`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getExpense(expenseId: string, token: string): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/expenses/get_expense/${expenseId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateExpense(expenseId: string, data: ExpenseUpdate, token: string): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/expenses/update_expense/${expenseId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteExpense(expenseId: string, token: string): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/expenses/delete_expense/${expenseId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
