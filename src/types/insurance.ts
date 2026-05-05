export type PolicyType = 'Comprehensive' | 'Third-party' | 'PSV';
export type InsuranceStatus = 'Active' | 'Expired' | 'Cancelled';

export interface InsuranceRecord {
  insurance_id: string;
  vehicle_id: string;
  provider: string;
  policy_type: PolicyType;
  start_date: string;
  end_date: string;
  premium_amount: number;
  status: InsuranceStatus;
  created_at: string;
  updated_at: string;
}

export interface InsuranceCreate {
  vehicle_id: string;
  provider: string;
  policy_type: PolicyType;
  start_date: string;
  end_date: string;
  premium_amount: number;
  status?: InsuranceStatus;
}

export interface InsuranceUpdate {
  vehicle_id?: string;
  provider?: string;
  policy_type?: PolicyType;
  start_date?: string;
  end_date?: string;
  premium_amount?: number;
  status?: InsuranceStatus;
}

export interface InsuranceResponse {
  status: 'success' | 'error';
  message: string;
  payload?: InsuranceRecord | InsuranceRecord[] | any;
}