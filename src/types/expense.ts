export type ExpenseType = 'Fuel' | 'Toll' | 'Maintenance' | 'Food' | 'Other';

export interface ExpenseRecord {
  expense_id: string;
  trip_id: string;
  type: ExpenseType;
  amount: number;
  receipt_image: string | null;
  incident_type: string | null;
  created_at: string;
}

export interface ExpenseCreate {
  trip_id: string;
  type: string;
  amount: number;
  receipt_image?: string | null;
  incident_type?: string | null;
}

export interface ExpenseUpdate {
  trip_id?: string;
  type?: string;
  amount?: number;
  receipt_image?: string | null;
  incident_type?: string | null;
}

export interface ExpenseResponse {
  status: 'success' | 'error';
  message: string;
  payload?: ExpenseRecord | ExpenseRecord[] | any;
}
