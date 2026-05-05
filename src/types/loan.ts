export type LoanStatus = 'Active' | 'Paid' | 'Defaulted';

export interface LoanRecord {
  loan_id: string;
  vehicle_id: string;
  lender: string;
  principal_amount: number;
  interest_rate: number;
  total_payable: number;
  start_date: string;
  end_date: string;
  monthly_installment: number;
  status: LoanStatus;
  created_at: string;
}

export interface LoanCreate {
  vehicle_id: string;
  lender: string;
  principal_amount: number;
  interest_rate: number;
  total_payable: number;
  start_date: string;
  end_date: string;
  monthly_installment: number;
  status?: LoanStatus;
}

export interface LoanUpdate {
  vehicle_id?: string;
  lender?: string;
  principal_amount?: number;
  interest_rate?: number;
  total_payable?: number;
  start_date?: string;
  end_date?: string;
  monthly_installment?: number;
  status?: LoanStatus;
}

export interface LoanResponse {
  status: 'success' | 'error';
  message: string;
  payload?: LoanRecord | LoanRecord[] | any;
}
