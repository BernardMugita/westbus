export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export interface Vehicle {
  vehicle_id: string;
  images: string[];
  registration_number: string;
  model: string;
  capacity: number;
  status: VehicleStatus;
  purchase_date: string | null;
  license_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  registration_number: string;
  model: string;
  capacity: number;
  status?: string;
  purchase_date?: string;
  license_expiry?: string;
}

export interface VehicleUpdate {
  registration_number?: string;
  model?: string;
  capacity?: number;
  status?: string;
  purchase_date?: string;
  license_expiry?: string;
}

export interface VehicleResponse {
  status: 'success' | 'error';
  message: string;
  payload?: any;
}
