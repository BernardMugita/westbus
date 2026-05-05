export interface LoanRepaymentRecord {
  repayment_id: string;
  loan_id: string;
  payment_date: string;
  amount_paid: number;
  principal_portion: number;
  interest_portion: number;
  outstanding_balance: number;
  receipt_ref: string | null;
  created_at: string;
}

export interface LoanRepaymentCreate {
  loan_id: string;
  payment_date: string;
  amount_paid: number;
  principal_portion: number;
  interest_portion: number;
  receipt_ref?: string | null;
}

export interface LoanRepaymentUpdate {
  loan_id?: string;
  payment_date?: string;
  amount_paid?: number;
  principal_portion?: number;
  interest_portion?: number;
  outstanding_balance?: number;
  receipt_ref?: string | null;
}

export interface LoanRepaymentResponse {
  status: 'success' | 'error';
  message: string;
  payload?: LoanRepaymentRecord | LoanRepaymentRecord[] | any;
}
