export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected';

export interface InsuranceClaimRecord {
  claim_id: string;
  insurance_id: string;
  incident_date: string;
  claim_date: string;
  amount_claimed: number;
  amount_approved: number | null;
  status: ClaimStatus;
  repair_estimate: number | null;
  created_at: string;
}

export interface InsuranceClaimCreate {
  insurance_id: string;
  incident_date: string;
  claim_date: string;
  amount_claimed: number;
  amount_approved?: number | null;
  status?: ClaimStatus;
  repair_estimate?: number | null;
}

export interface InsuranceClaimUpdate {
  insurance_id?: string;
  incident_date?: string;
  claim_date?: string;
  amount_claimed?: number;
  amount_approved?: number | null;
  status?: ClaimStatus;
  repair_estimate?: number | null;
}

export interface InsuranceClaimResponse {
  status: 'success' | 'error';
  message: string;
  payload?: InsuranceClaimRecord | InsuranceClaimRecord[] | any;
}