export type MaintenanceType = 'Oil change' | 'Brake pad' | 'Tyre' | 'Engine' | 'Electrical' | 'Other';

export interface MaintenanceRecord {
  maintenance_id: string;
  vehicle_id: string;
  driver_id: string | null;
  maintenance_date: string;
  type: MaintenanceType;
  cost: number;
  odometer_km: number | null;
  garage_name: string | null;
  next_due_km: number | null;
  created_at: string;
}

export interface MaintenanceRecordCreate {
  vehicle_id: string;
  driver_id?: string | null;
  maintenance_date: string;
  type: string;
  cost: number;
  odometer_km?: number | null;
  garage_name?: string | null;
  next_due_km?: number | null;
}

export interface MaintenanceRecordUpdate {
  vehicle_id?: string;
  driver_id?: string | null;
  maintenance_date?: string;
  type?: string;
  cost?: number;
  odometer_km?: number | null;
  garage_name?: string | null;
  next_due_km?: number | null;
}

export interface MaintenanceRecordResponse {
  status: 'success' | 'error';
  message: string;
  payload?: MaintenanceRecord | MaintenanceRecord[] | any;
}
