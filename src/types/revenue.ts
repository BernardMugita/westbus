export type RevenueSource = 'Booking' | 'Manual' | 'Adjustment' | 'Refund';
export type RevenueType = 'Ticket' | 'Charter' | 'Other';

export interface RevenueRecord {
  revenue_id: string;
  trip_id: string;
  revenue_source: RevenueSource;
  amount: number;
  revenue_type: RevenueType;
  recorded_at: string;
  recorded_by: string | null;
  notes: string | null;
}

export interface RevenueCreate {
  trip_id: string;
  revenue_source: string;
  amount: number;
  revenue_type: string;
  recorded_at?: string;
  recorded_by?: string;
  notes?: string;
}

export interface RevenueUpdate {
  trip_id?: string;
  revenue_source?: string;
  amount?: number;
  revenue_type?: string;
  recorded_by?: string;
  notes?: string;
}

export interface RevenueResponse {
  status: 'success' | 'error';
  message: string;
  payload?: RevenueRecord | RevenueRecord[] | any;
}
